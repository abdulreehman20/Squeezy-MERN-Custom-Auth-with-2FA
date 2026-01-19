import { Env } from "../../configs/env.config";

/**
 * Handle unhandled promise rejections
 * This catches errors from async operations that weren't properly handled
 */
export const handleUnhandledRejection = (): void => {
	process.on(
		"unhandledRejection",
		(_reason: unknown, _promise: Promise<unknown>) => {
			// In production, we might want to exit the process
			// In development, we can continue for debugging
			if (Env.NODE_ENV === "production") {
				// Give time for cleanup
				setTimeout(() => {
					process.exit(1);
				}, 1000);
			}
		},
	);
};

/**
 * Handle uncaught exceptions
 * This catches synchronous errors that weren't caught
 */
export const handleUncaughtException = (): void => {
	process.on("uncaughtException", (_error: Error) => {
		// Uncaught exceptions are critical - exit the process
		process.exit(1);
	});
};

/**
 * Handle SIGTERM signal (graceful shutdown)
 */
export const handleSIGTERM = (): void => {
	process.on("SIGTERM", () => {
		// Close server gracefully
		process.exit(0);
	});
};

/**
 * Handle SIGINT signal (Ctrl+C)
 */
export const handleSIGINT = (): void => {
	process.on("SIGINT", () => {
		// Close server gracefully
		process.exit(0);
	});
};

/**
 * Initialize all process-level error handlers
 */
export const initializeProcessHandlers = (): void => {
	handleUnhandledRejection();
	handleUncaughtException();
	handleSIGTERM();
	handleSIGINT();
};
