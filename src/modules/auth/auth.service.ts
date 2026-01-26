import UserModel from "../../database/models/user.model";
import SessionModel from "../../database/models/session.model";
import { BadRequestException, InternalServerException, NotFoundException, TooManyRequestsException, UnauthorizedException } from "../../common/utils/app-error";
import { ErrorCodeEnum } from "../../common/enums/error-code.enum";
import { anHourFromNow, calculateExpirationDate, fortyFiveMinutesFromNow, ONE_DAY_IN_MS, threeMinutesAgo } from "../../common/utils/date-time";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../common/enums/verification-code-enums";
import { refreshTokenSignOptions, type RefreshTPayload, signJwtToken, verifyJwtToken } from "../../common/utils/jwt";
import type { LoginDto, RegisterDto } from "../../common/interface/auth.interface";
import { Env } from "../../configs/env.config";
import { sendEmail } from "../../mailers/mailer";
import { passwordResetTemplate, verifyEmailTemplate } from "../../mailers/template";

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

		const verification = await VerificationCodeModel.create({
			userId,
			type: VerificationEnum.EMAIL_VERIFICATION,
			expiredAt: fortyFiveMinutesFromNow(),
		});

		// Sending verification email link Add This
		const verificationUrl = `${Env.FRONTEND_ORIGIN}/confirm-account?code=${verification.code}`;
		await sendEmail({ to: newUser.email, ...verifyEmailTemplate(verificationUrl) });


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

	public async verifyEmail(code: string) {
		const validCode = await VerificationCodeModel.findOne({
			code: code,
			type: VerificationEnum.EMAIL_VERIFICATION,
			expiresAt: { $gt: new Date() },
		});

		if (!validCode) {
			throw new BadRequestException("Invalid or expired verification code");
		}

		const updatedUser = await UserModel.findByIdAndUpdate(
			validCode.userId,
			{
				isEmailVerified: true,
			},
			{ new: true }
		);

		if (!updatedUser) {
			throw new BadRequestException(
				"Unable to verify email address",
				ErrorCodeEnum.DB_VALIDATION_ERROR);
		}

		await validCode.deleteOne();
		return { user: updatedUser };
	}

	public async forgotPassword(email: string) {
		const user = await UserModel.findOne({ email: email });

		if (!user) {
			throw new NotFoundException("User not found");
		}

		//check mail rate limit is 2 emails per 3 or 10 min
		const timeAgo = threeMinutesAgo();
		const maxAttempts = 2;

		const count = await VerificationCodeModel.countDocuments({
			userId: user._id,
			type: VerificationEnum.PASSWORD_RESET,
			createdAt: { $gt: timeAgo },
		});

		if (count >= maxAttempts) {
			throw new TooManyRequestsException(
				"Too many request, try again later",
				ErrorCodeEnum.RATE_429
			);
		}

		const expiresAt = anHourFromNow();
		const validCode = await VerificationCodeModel.create({
			userId: user._id,
			type: VerificationEnum.PASSWORD_RESET,
			expiresAt,
		});

		const resetLink = `${Env.FRONTEND_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

		const { data, error } = await sendEmail({ to: user.email, ...passwordResetTemplate(resetLink) });

		if (!data?.id) {
			throw new InternalServerException(`${error?.name} ${error?.message}`);
		}

		return { url: resetLink, emailId: data.id };
	}
}