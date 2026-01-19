/**
 * Error Handling Examples
 *
 * This file demonstrates how to use the error handling system in your controllers and services.
 * These are examples only and should not be imported directly.
 */

import { ErrorCodeEnum } from "../common/enums/error-code.enum";
import {
	ConflictException,
	DatabaseException,
	ForbiddenException,
	InternalServerException,
	NotFoundException,
	TooManyRequestsException,
	UnauthorizedException,
	ValidationException,
} from "../common/utils/app-error";

// ==================== Example 1: Validation Error ====================
export const exampleValidationError = () => {
	// Simple validation error
	throw new ValidationException("Email is required");
};

// ==================== Example 1b: Validation Error with Details ====================
export const exampleValidationErrorWithDetails = () => {
	// Validation error with details
	throw new ValidationException("Validation failed", ErrorCodeEnum.VAL_400, {
		fields: ["email", "password"],
		errors: ["Email is required", "Password must be at least 8 characters"],
	});
};

// ==================== Example 2: Not Found Error ====================
export const exampleNotFoundError = (userId: string) => {
	throw new NotFoundException(`User with ID ${userId} not found`);
};

// ==================== Example 3: Unauthorized Error ====================
export const exampleUnauthorizedError = () => {
	throw new UnauthorizedException("Invalid credentials");
};

// ==================== Example 4: Forbidden Error ====================
export const exampleForbiddenError = () => {
	throw new ForbiddenException(
		"You do not have permission to access this resource",
	);
};

// ==================== Example 5: Conflict Error ====================
export const exampleConflictError = () => {
	throw new ConflictException(
		"An account with this email already exists",
		ErrorCodeEnum.AUTH_EMAIL_ALREADY_EXISTS,
	);
};

// ==================== Example 6: Database Error ====================
export const exampleDatabaseError = () => {
	throw new DatabaseException("Failed to save user to database");
};

// ==================== Example 7: Rate Limit Error ====================
export const exampleRateLimitError = () => {
	throw new TooManyRequestsException(
		"Too many login attempts. Please try again in 15 minutes",
	);
};

// ==================== Example 8: Internal Server Error ====================
export const exampleInternalServerError = () => {
	throw new InternalServerException("An unexpected error occurred");
};

// ==================== Example 9: Using in Async Functions ====================
export const exampleAsyncErrorHandling = async (userId: string) => {
	// This would be wrapped with asyncHandler in your route
	try {
		// Some async operation
		const user = await findUserById(userId);

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}

		return user;
	} catch (error) {
		// Re-throw AppError instances (they will be caught by errorHandler)
		if (error instanceof NotFoundException) {
			throw error;
		}

		// Wrap unknown errors
		throw new InternalServerException("Failed to fetch user");
	}
};

// Mock function for example
const findUserById = async (_id: string) => {
	return null;
};

// ==================== Example 10: Conditional Error Throwing ====================
export const exampleConditionalError = (email: string, password: string) => {
	if (!email) {
		throw new ValidationException(
			"Email is required",
			ErrorCodeEnum.VAL_REQUIRED_FIELD,
		);
	}

	if (!password) {
		throw new ValidationException(
			"Password is required",
			ErrorCodeEnum.VAL_REQUIRED_FIELD,
		);
	}

	if (password.length < 8) {
		throw new ValidationException(
			"Password must be at least 8 characters",
			ErrorCodeEnum.VAL_OUT_OF_RANGE,
		);
	}

	if (!isValidEmail(email)) {
		throw new ValidationException(
			"Invalid email format",
			ErrorCodeEnum.VAL_INVALID_FORMAT,
		);
	}
};

// Mock function for example
const isValidEmail = (_email: string) => {
	return false;
};
