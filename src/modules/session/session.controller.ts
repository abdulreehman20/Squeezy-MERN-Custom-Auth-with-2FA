import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { SessionService } from "./session.service";
import { HTTPSTATUS } from "../../configs/http.config";
import { NotFoundException } from "../../common/utils/app-error";
import { z } from "zod";

export class SessionController {
    private sessionService: SessionService;

    constructor(sessionService: SessionService) {
        this.sessionService = sessionService;
    }

    public getAllSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const sessionId = req.sessionId;

        const { sessions } = await this.sessionService.getAllSession(userId);

        const modifySessions = sessions.map((session) => ({
            ...session.toObject(),
            ...(session.id === sessionId && {
                isCurrent: true,
            }),
        }));

        res.status(HTTPSTATUS.OK).json({
            message: "Retrieved all session successfully",
            sessions: modifySessions,
        });
        return;
    });

    public getSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const sessionId = req?.sessionId;

        if (!sessionId) {
            throw new NotFoundException("Session ID not found. Please log in.");
        }

        const { user } = await this.sessionService.getSessionById(sessionId);

        res.status(HTTPSTATUS.OK).json({
            message: "Session retrieved successfully",
            user,
        });
        return;
    });

    public deleteSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const sessionId = z.string().parse(req.params.id);
        const userId = req.user?.id;
        await this.sessionService.deleteSession(sessionId, userId);

        res.status(HTTPSTATUS.OK).json({
            message: "Session remove successfully",
        });
        return;
    });
}