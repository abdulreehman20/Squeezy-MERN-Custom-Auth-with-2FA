import UserModel from "../../database/models/user.model";
import SessionModel from "../../database/models/session.model";
import { BadRequestException } from "../../common/utils/app-error";
import { ErrorCodeEnum } from "../../common/enums/error-code.enum";
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../common/enums/verification-code-enums";
import { refreshTokenSignOptions, signJwtToken } from "../../common/utils/jwt";
import type { LoginDto, RegisterDto } from "../../common/interface/auth.interface";

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
}
