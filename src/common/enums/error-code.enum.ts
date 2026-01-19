/**
 * Comprehensive Error Code Enum
 *
 * Naming Convention:
 * - USR_*: User/Client errors (4xx)
 * - AUTH_*: Authentication/Authorization errors
 * - VAL_*: Validation errors
 * - RATE_*: Rate limiting errors
 * - DB_*: Database errors
 * - EXT_*: External/Third-party API errors
 * - SRV_*: Server errors (5xx)
 */

export const ErrorCodeEnum = {
	// Client Errors (4xx)
	USR_400: "USR_400", // Bad Request
	USR_404: "USR_404", // Not Found
	USR_405: "USR_405", // Method Not Allowed
	USR_409: "USR_409", // Conflict
	USR_422: "USR_422", // Unprocessable Entity

	// Authentication & Authorization Errors
	AUTH_401: "AUTH_401", // Unauthorized
	AUTH_403: "AUTH_403", // Forbidden
	AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
	AUTH_EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
	AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
	AUTH_TOKEN_NOT_FOUND: "AUTH_TOKEN_NOT_FOUND",
	AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
	AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
	AUTH_ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
	AUTH_ACCOUNT_DISABLED: "AUTH_ACCOUNT_DISABLED",
	AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_INSUFFICIENT_PERMISSIONS",

	// Validation Errors
	VAL_400: "VAL_400", // Validation Error
	VAL_REQUIRED_FIELD: "VAL_REQUIRED_FIELD",
	VAL_INVALID_FORMAT: "VAL_INVALID_FORMAT",
	VAL_INVALID_TYPE: "VAL_INVALID_TYPE",
	VAL_OUT_OF_RANGE: "VAL_OUT_OF_RANGE",
	VAL_DUPLICATE_VALUE: "VAL_DUPLICATE_VALUE",

	// Rate Limiting
	RATE_429: "RATE_429", // Too Many Requests
	RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

	// Database Errors
	DB_500: "DB_500", // Database Error
	DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
	DB_QUERY_ERROR: "DB_QUERY_ERROR",
	DB_TRANSACTION_ERROR: "DB_TRANSACTION_ERROR",
	DB_DUPLICATE_KEY: "DB_DUPLICATE_KEY",
	DB_VALIDATION_ERROR: "DB_VALIDATION_ERROR",
	DB_NOT_FOUND: "DB_NOT_FOUND",

	// External/Third-party API Errors
	EXT_502: "EXT_502", // Bad Gateway
	EXT_503: "EXT_503", // Service Unavailable
	EXT_504: "EXT_504", // Gateway Timeout
	EXT_API_ERROR: "EXT_API_ERROR",
	EXT_SERVICE_UNAVAILABLE: "EXT_SERVICE_UNAVAILABLE",
	EXT_TIMEOUT: "EXT_TIMEOUT",

	// Server Errors (5xx)
	SRV_500: "SRV_500", // Internal Server Error
	SRV_501: "SRV_501", // Not Implemented
	SRV_INTERNAL_ERROR: "SRV_INTERNAL_ERROR",
	SRV_UNHANDLED_ERROR: "SRV_UNHANDLED_ERROR",

	// File Upload Errors
	FILE_UPLOAD_ERROR: "FILE_UPLOAD_ERROR",
	FILE_TOO_LARGE: "FILE_TOO_LARGE",
	FILE_INVALID_TYPE: "FILE_INVALID_TYPE",
	FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
} as const;

export type ErrorCodeEnumType = keyof typeof ErrorCodeEnum;
