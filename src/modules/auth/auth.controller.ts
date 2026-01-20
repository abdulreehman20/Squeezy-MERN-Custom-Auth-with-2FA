import type { Request, Response } from "express";
import type { AuthService } from "./auth.service";
import { HTTPSTATUS } from "../../configs/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../../common/validators/auth.validator";
import { setAuthenticationCookies } from "../../common/utils/cookie";

export class AuthController {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	public register = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const body = registerSchema.parse({ ...req.body });

			const { user } = await this.authService.register(body);

			res.status(HTTPSTATUS.CREATED).json({
				message: "User registered successfully",
				data: { user },
			});
		},
	);

	public login = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const userAgent = req.headers["user-agent"];
			const body = loginSchema.parse({ ...req.body, userAgent });

			const { user, accessToken, refreshToken, mfaRequired } =
				await this.authService.login(body);

			if (mfaRequired) {
				res.status(HTTPSTATUS.OK).json({
					message: "Verify MFA authentication",
					mfaRequired,
					user,
				});
				return; // stop here so we don't send two responses
			}

			setAuthenticationCookies({ res, accessToken, refreshToken })
				.status(HTTPSTATUS.OK)
				.json({
					message: "User login successfully",
					mfaRequired,
					user,
				});
		},
	);
}
