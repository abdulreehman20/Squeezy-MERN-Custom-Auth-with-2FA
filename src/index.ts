import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { initializeProcessHandlers } from "./common/utils/process-handlers";
import { Env } from "./configs/env.config";
import { HTTPSTATUS } from "./configs/http.config";
import { connectDatabase } from "./database/database";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";

// Initialize process-level error handlers (must be done early)
initializeProcessHandlers();

const app = express();
// const BASE_PATH = Env.BASE_PATH;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: Env.FRONTEND_ORIGIN, credentials: true }));

// Routes
app.get(
	"/",
	asyncHandler(async (_req: Request, res: Response) => {
		res.status(HTTPSTATUS.OK).json({
			message: "Welcome to the Express.js Authentication API",
			status: "OK",
		});
	}),
);

app.get(
	"/health",
	asyncHandler(async (_req: Request, res: Response) => {
		res.status(HTTPSTATUS.OK).json({
			message: "Server is healthy",
			status: "OK",
			timestamp: new Date().toISOString(),
		});
	}),
);

// 404 Handler - must be after all routes but before error handler
app.use(notFoundHandler);

// Error Handler - must be last
app.use(errorHandler);

// Start server
app.listen(Env.PORT, async () => {
	await connectDatabase();
	console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
