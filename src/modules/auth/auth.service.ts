import UserModel from "../../database/models/user.model";
import SessionModel from "../../database/models/session.model";
import { BadRequestException, UnauthorizedException } from "../../common/utils/app-error";
import { ErrorCodeEnum } from "../../common/enums/error-code.enum";
import { calculateExpirationDate, fortyFiveMinutesFromNow, ONE_DAY_IN_MS } from "../../common/utils/date-time";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../common/enums/verification-code-enums";
import { refreshTokenSignOptions, RefreshTPayload, signJwtToken, verifyJwtToken } from "../../common/utils/jwt";
import type { LoginDto, RegisterDto } from "../../common/interface/auth.interface";
import { Env } from "../../configs/env.config";

export class AuthService {
	public async register(registerDto: RegisterDto) {
		const { name, email, password } = registerDto;

		const existingUser = await UserModel.exists({ email });
		if (existingUser) {
			throw new BadRequestException(
				"User already exists with this email",
				ErrorCodeEnum.AUTH_EMAIL_ALREADY_EXISTS,
			);
		}

		const newUser = await UserModel.create({
			name,
			email,
			password,
		});

		const userId = newUser._id;

		const _verification = await VerificationCodeModel.create({
			userId,
			type: VerificationEnum.EMAIL_VERIFICATION,
			expiredAt: fortyFiveMinutesFromNow(),
		});

		return { user: newUser };
	}

	public async login(loginDto: LoginDto) {
		const { email, password, userAgent } = loginDto;

		const user = await UserModel.findOne({ email });
		if (!user) {
			throw new BadRequestException(
				"User not found",
				ErrorCodeEnum.AUTH_USER_NOT_FOUND,
			);
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			throw new BadRequestException(
				"Invalid password",
				ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
			);
		}

		if (user.userPreferences.enable2FA) {
			return {
				user: null,
				mfaRequired: true,
				accessToken: "",
				refreshToken: "",
			};
		}

		const session = await SessionModel.create({
			userId: user._id,
			userAgent,
		});

		const accessToken = signJwtToken({
			userId: user._id,
			sessionId: session._id,
		})

		const refreshToken = signJwtToken(
			{ sessionId: session._id },
			refreshTokenSignOptions
		);

		return { user, accessToken, refreshToken, mfaRequired: false };

	}

	public async refreshToken(refreshToken: string) {
		const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
			secret: refreshTokenSignOptions.secret,
		});

		if (!payload) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		const session = await SessionModel.findById(payload.sessionId);
		const now = Date.now();

		if (!session) {
			throw new UnauthorizedException("Session does not exist");
		}

		if (session.expiredAt.getTime() <= now) {
			throw new UnauthorizedException("Session expired");
		}

		const sessionRequireRefresh =
			session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

		if (sessionRequireRefresh) {
			session.expiredAt = calculateExpirationDate(
				Env.JWT.REFRESH_EXPIRES_IN
			);
			await session.save();
		}

		const newRefreshToken = sessionRequireRefresh ? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions) : undefined;

		const accessToken = signJwtToken({
			userId: session.userId,
			sessionId: session._id,
		});

		return {
			accessToken,
			newRefreshToken,
		};
	}
}