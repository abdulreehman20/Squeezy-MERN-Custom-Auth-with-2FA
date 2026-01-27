import UserModel from "../../database/models/user.model";
import SessionModel from "../../database/models/session.model";
import {
	BadRequestException,
	InternalServerException,
	NotFoundException,
	TooManyRequestsException,
	UnauthorizedException,
} from "../../common/utils/app-error";
import { ErrorCodeEnum } from "../../common/enums/error-code.enum";
import {
	anHourFromNow,
	calculateExpirationDate,
	fortyFiveMinutesFromNow,
	ONE_DAY_IN_MS,
	threeMinutesAgo,
} from "../../common/utils/date-time";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../common/enums/verification-code-enums";
import {
	refreshTokenSignOptions,
	type RefreshTPayload,
	signJwtToken,
	verifyJwtToken,
} from "../../common/utils/jwt";
import type {
	LoginDto,
	RegisterDto,
	resetPasswordDto,
} from "../../common/interface/auth.interface";
import { Env } from "../../configs/env.config";
import { sendEmail } from "../../mailers/mailer";
import {
	passwordResetTemplate,
	verifyEmailTemplate,
} from "../../mailers/template";
import { hashValue } from "../../common/utils/bcrypt";

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
		await sendEmail({
			to: newUser.email,
			...verifyEmailTemplate(verificationUrl),
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
		});

		const refreshToken = signJwtToken(
			{ sessionId: session._id },
			refreshTokenSignOptions,
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
			session.expiredAt = calculateExpirationDate(Env.JWT.REFRESH_EXPIRES_IN);
			await session.save();
		}

		const newRefreshToken = sessionRequireRefresh
			? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions)
			: undefined;

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
		const trimmedCode = code.trim();

		const codeExists = await VerificationCodeModel.findOne({
			code: trimmedCode,
			type: VerificationEnum.EMAIL_VERIFICATION,
		});

		if (!codeExists) {
			throw new BadRequestException(
				"Invalid verification code",
				ErrorCodeEnum.VAL_400,
			);
		}

		const now = new Date();
		if (codeExists.expiredAt <= now) {
			throw new BadRequestException(
				"Verification code has expired. Please request a new one",
				ErrorCodeEnum.VAL_400,
			);
		}

		const updatedUser = await UserModel.findByIdAndUpdate(
			codeExists.userId,
			{ isEmailVerified: true },
			{ new: true },
		);

		if (!updatedUser) {
			throw new BadRequestException(
				"Unable to verify email address",
				ErrorCodeEnum.DB_VALIDATION_ERROR,
			);
		}

		await codeExists.deleteOne();
		return { user: updatedUser };
	}

	public async forgotPassword(email: string) {
		const user = await UserModel.findOne({ email: email });

		if (!user) {
			throw new NotFoundException("User not found");
		}

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
				ErrorCodeEnum.RATE_429,
			);
		}

		const expiresAt = anHourFromNow();
		const validCode = await VerificationCodeModel.create({
			userId: user._id,
			type: VerificationEnum.PASSWORD_RESET,
			expiredAt: expiresAt,
		});

		const resetLink = `${Env.FRONTEND_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

		const { data, error } = await sendEmail({
			to: user.email,
			...passwordResetTemplate(resetLink),
		});

		if (!data?.id) {
			throw new InternalServerException(`${error?.name} ${error?.message}`);
		}

		return { url: resetLink, emailId: data.id };
	}

	public async resePassword({ password, verificationCode }: resetPasswordDto) {
		const trimmedCode = verificationCode.trim();

		const codeExists = await VerificationCodeModel.findOne({
			code: trimmedCode,
			type: VerificationEnum.PASSWORD_RESET,
		});

		if (!codeExists) {
			throw new NotFoundException(
				"Invalid verification code",
				ErrorCodeEnum.USR_404,
			);
		}

		const now = new Date();
		if (codeExists.expiredAt <= now) {
			throw new BadRequestException(
				"Verification code has expired. Please request a new one",
				ErrorCodeEnum.VAL_400,
			);
		}

		const hashedPassword = await hashValue(password);

		const updatedUser = await UserModel.findByIdAndUpdate(
			codeExists.userId,
			{ password: hashedPassword },
			{ new: true },
		);

		if (!updatedUser) {
			throw new BadRequestException(
				"Failed to reset password",
				ErrorCodeEnum.DB_VALIDATION_ERROR,
			);
		}

		await codeExists.deleteOne();

		await SessionModel.deleteMany({ userId: updatedUser._id });

		return { user: updatedUser };
	}

	public async logout(sessionId: string) {
		return await SessionModel.findByIdAndDelete(sessionId);
	}
}
