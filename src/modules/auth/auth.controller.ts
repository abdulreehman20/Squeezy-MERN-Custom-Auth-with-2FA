import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { HTTPSTATUS } from "../../configs/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { registerSchema } from "../../common/validators/auth.validator";

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public register = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        // Registration logic will go here
        const body = registerSchema.parse({ ...req.body });

        const { user } = await this.authService.register(body);

        return res.status(HTTPSTATUS.CREATED).json({
            message: "User registered successfully",
            data: { user },
        });
    });
}