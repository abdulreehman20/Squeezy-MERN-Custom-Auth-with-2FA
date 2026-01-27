import { Request, Response } from "express";
import { MfaService } from "./mfa.service";
import { HTTPSTATUS } from "../../configs/http.config";
import { setAuthenticationCookies } from "../../common/utils/cookie";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { verifyMfaForLoginSchema, verifyMfaSchema } from "../../common/validators/mfa.validator";

export class MfaController {
    private mfaService: MfaService;

    constructor(mfaService: MfaService) {
        this.mfaService = mfaService;
    }

    public generateMFASetup = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { secret, qrImageUrl, message } =
                await this.mfaService.generateMFASetup(req);
            res.status(HTTPSTATUS.OK).json({
                message,
                secret,
                qrImageUrl,
            });
            return;
        }
    );

    public verifyMFASetup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { code, secretKey } = verifyMfaSchema.parse({
            ...req.body,
        });
        const { userPreferences, message } = await this.mfaService.verifyMFASetup(
            req,
            code,
            secretKey
        );
        res.status(HTTPSTATUS.OK).json({
            message: message,
            userPreferences: userPreferences,
        });
        return;
    });

    public revokeMFA = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { message, userPreferences } = await this.mfaService.revokeMFA(req);
        res.status(HTTPSTATUS.OK).json({
            message,
            userPreferences,
        });
        return;
    });

    public verifyMFAForLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { code, email, userAgent } = verifyMfaForLoginSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });

        const { accessToken, refreshToken, user } =
            await this.mfaService.verifyMFAForLogin(code, email, userAgent);

        setAuthenticationCookies({ res, accessToken, refreshToken })
        res.status(HTTPSTATUS.OK)
            .json({ message: "Verified & login successfully", user });
        return;
    });
}