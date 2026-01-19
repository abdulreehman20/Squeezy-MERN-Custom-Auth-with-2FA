import { HTTPSTATUS, type HttpStatusCodeType } from "../../configs/http.config";
import {
	ErrorCodeEnum,
	type ErrorCodeEnumType,
} from "../enums/error-code.enum";

export const ErrorCodes = {
	ERR_INTERNAL: "ERR_INTERNAL",
	ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
	ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
	ERR_FORBIDDEN: "ERR_FORBIDDEN",
	ERR_NOT_FOUND: "ERR_NOT_FOUND",
} as const;

export type ErrorCodeType = keyof typeof ErrorCodes;

/**
 * Base Application Error Class
 * All custom errors should extend this class
 */
export class AppError extends Error {
	public readonly isOperational: boolean = true;
	public readonly timestamp: string;

	constructor(
		message: string,
		public statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
		public errorCode: ErrorCodeEnumType = ErrorCodeEnum.SRV_500,
		public details?: unknown,
	) {
		super(message);
		this.name = this.constructor.name;
		this.timestamp = new Date().toISOString();
		Error.captureStackTrace(this, this.constructor);
	}
}

// ==================== Client Errors (4xx) ====================

export class BadRequestException extends AppError {
	constructor(
		message = "The request is invalid or malformed",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.USR_400,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.BAD_REQUEST, errorCode, details);
	}
}

export class UnauthorizedException extends AppError {
	constructor(
		message = "Authentication required. Please provide valid credentials",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.AUTH_401,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.UNAUTHORIZED, errorCode, details);
	}
}

export class ForbiddenException extends AppError {
	constructor(
		message = "You do not have permission to access this resource",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.AUTH_403,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.FORBIDDEN, errorCode, details);
	}
}

export class NotFoundException extends AppError {
	constructor(
		message = "The requested resource was not found",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.USR_404,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.NOT_FOUND, errorCode, details);
	}
}

export class MethodNotAllowedException extends AppError {
	constructor(
		message = "The HTTP method is not allowed for this endpoint",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.USR_405,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.METHOD_NOT_ALLOWED, errorCode, details);
	}
}

export class ConflictException extends AppError {
	constructor(
		message = "The request conflicts with the current state of the resource",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.USR_409,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.CONFLICT, errorCode, details);
	}
}

export class UnprocessableEntityException extends AppError {
	constructor(
		message = "The request is well-formed but contains semantic errors",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.USR_422,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.UNPROCESSABLE_ENTITY, errorCode, details);
	}
}

export class TooManyRequestsException extends AppError {
	constructor(
		message = "Too many requests. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.RATE_429,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.TOO_MANY_REQUESTS, errorCode, details);
	}
}

// ==================== Validation Errors ====================

export class ValidationException extends AppError {
	constructor(
		message = "Validation failed. Please check your input",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.VAL_400,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.BAD_REQUEST, errorCode, details);
	}
}

// ==================== Authentication & Authorization Errors ====================

export class AuthenticationException extends AppError {
	constructor(
		message = "Authentication failed. Please check your credentials",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.AUTH_401,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.UNAUTHORIZED, errorCode, details);
	}
}

export class AuthorizationException extends AppError {
	constructor(
		message = "You do not have permission to perform this action",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.AUTH_403,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.FORBIDDEN, errorCode, details);
	}
}

// ==================== Database Errors ====================

export class DatabaseException extends AppError {
	constructor(
		message = "A database error occurred. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.DB_500,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode, details);
	}
}

export class DatabaseConnectionException extends AppError {
	constructor(
		message = "Unable to connect to the database. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.DB_CONNECTION_ERROR,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.SERVICE_UNAVAILABLE, errorCode, details);
	}
}

// ==================== External/Third-party API Errors ====================

export class ExternalServiceException extends AppError {
	constructor(
		message = "An external service error occurred. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.EXT_API_ERROR,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.BAD_GATEWAY, errorCode, details);
	}
}

export class ServiceUnavailableException extends AppError {
	constructor(
		message = "The service is temporarily unavailable. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.EXT_503,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.SERVICE_UNAVAILABLE, errorCode, details);
	}
}

export class GatewayTimeoutException extends AppError {
	constructor(
		message = "The request timed out. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.EXT_504,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.GATEWAY_TIMEOUT, errorCode, details);
	}
}

// ==================== Server Errors (5xx) ====================

export class InternalServerException extends AppError {
	constructor(
		message = "An internal server error occurred. Please try again later",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.SRV_500,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode, details);
	}
}

export class NotImplementedException extends AppError {
	constructor(
		message = "This feature is not yet implemented",
		errorCode: ErrorCodeEnumType = ErrorCodeEnum.SRV_501,
		details?: unknown,
	) {
		super(message, HTTPSTATUS.NOT_IMPLEMENTED, errorCode, details);
	}
}
