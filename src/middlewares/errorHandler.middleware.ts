import type { ErrorRequestHandler, Request, Response } from "express";
import mongoose from "mongoose";
import { ErrorCodeEnum } from "../common/enums/error-code.enum";
import { AppError } from "../common/utils/app-error";
import { Env } from "../configs/env.config";
import { HTTPSTATUS, type HttpStatusCodeType } from "../configs/http.config";

/**
 * Standardized error response format
 */
interface ErrorResponse {
	errorName: string;
	errorCode: string;
	httpStatus: number;
	message: string;
	details?: unknown;
	timestamp?: string;
	path?: string;
}

/**
 * Production-level error handler middleware
 * Handles all types of errors and returns consistent JSON responses
 */

export const errorHandler: ErrorRequestHandler = (
	err: unknown,
	req: Request,
	res: Response,
	_next,
): void => {
	let error = err as AppError | Error;
	let statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR;
	let errorCode: string = ErrorCodeEnum.SRV_500;
	let message = "An unexpected error occurred";
	let details: unknown;

	// Handle AppError instances (operational errors)
	if (err instanceof AppError) {
		error = err;
		statusCode = err.statusCode;
		errorCode = err.errorCode;
		message = err.message;
		details = err.details;
	}

	// Handle Mongoose validation errors
	else if (err instanceof mongoose.Error.ValidationError) {
		statusCode = HTTPSTATUS.BAD_REQUEST;
		errorCode = ErrorCodeEnum.DB_VALIDATION_ERROR;
		message = "Validation failed";
		details = Object.values(err.errors).map((e) => ({
			field: e.path,
			message: e.message,
		}));
	}

	// Handle Mongoose cast errors (invalid ObjectId, etc.)
	else if (err instanceof mongoose.Error.CastError) {
		statusCode = HTTPSTATUS.BAD_REQUEST;
		errorCode = ErrorCodeEnum.VAL_INVALID_FORMAT;
		message = `Invalid ${err.path}: ${err.value}`;
	}

	// Handle Mongoose duplicate key errors
	else if (err instanceof Error && "code" in err && err.code === 11000) {
		statusCode = HTTPSTATUS.CONFLICT;
		errorCode = ErrorCodeEnum.DB_DUPLICATE_KEY;
		message = "A resource with this value already exists";

		// Extract field name from error message if available
		const match = (err as Error & { keyPattern?: Record<string, unknown> })
			.keyPattern;
		if (match) {
			details = { duplicateFields: Object.keys(match) };
		}
	}

	// Handle JSON syntax errors (malformed JSON in request body)
	else if (err instanceof SyntaxError && "body" in err) {
		statusCode = HTTPSTATUS.BAD_REQUEST;
		errorCode = ErrorCodeEnum.VAL_400;
		message = "Invalid JSON in request body";
	}

	// Handle JWT errors
	else if (
		err instanceof Error &&
		(err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
	) {
		statusCode = HTTPSTATUS.UNAUTHORIZED;
		errorCode = ErrorCodeEnum.AUTH_INVALID_TOKEN;
		message =
			err.name === "TokenExpiredError"
				? "Your session has expired. Please log in again"
				: "Invalid authentication token";
	}

	// Handle rate limit errors (from express-rate-limit)
	else if (
		err instanceof Error &&
		"statusCode" in err &&
		err.statusCode === HTTPSTATUS.TOO_MANY_REQUESTS
	) {
		statusCode = HTTPSTATUS.TOO_MANY_REQUESTS;
		errorCode = ErrorCodeEnum.RATE_429;
		message = "Too many requests. Please try again later";
	} else if (
		err instanceof Error &&
		"code" in err &&
		(err.code === "LIMIT_FILE_SIZE" ||
			err.code === "LIMIT_FILE_COUNT" ||
			err.code === "LIMIT_UNEXPECTED_FILE")
	) {
		statusCode = HTTPSTATUS.BAD_REQUEST;
		errorCode = ErrorCodeEnum.FILE_UPLOAD_ERROR;
		message = "File upload error";
		message =
			err.code === "LIMIT_FILE_SIZE"
				? "File size exceeds the maximum allowed limit"
				: message;
	}

	// Handle network/connection errors
	else if (
		err instanceof Error &&
		(err.name === "ECONNREFUSED" ||
			err.name === "ETIMEDOUT" ||
			err.name === "ENOTFOUND")
	) {
		statusCode = HTTPSTATUS.SERVICE_UNAVAILABLE;
		errorCode = ErrorCodeEnum.EXT_SERVICE_UNAVAILABLE;
		message = "External service is unavailable. Please try again later";
	}

	// Handle unknown errors
	else if (err instanceof Error) {
		error = err;
		message = err.message || message;
	}

	// Prepare error response
	const errorResponse: ErrorResponse = {
		errorName: error.name || "Error",
		errorCode,
		httpStatus: statusCode,
		message,
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
	};

	// Include details only in development or for specific error types
	if (details !== undefined) {
		errorResponse.details = details;
	}

	// Include stack trace only in development
	if (Env.NODE_ENV === "development" && error instanceof Error && error.stack) {
		errorResponse.details = {
			...(errorResponse.details as Record<string, unknown>),
			stack: error.stack,
		};
	}

	// Send error response
	res.status(statusCode).json(errorResponse);
};
