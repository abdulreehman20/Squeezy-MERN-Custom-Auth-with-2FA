import { getEnv } from "../common/utils/get-env";

export const Env = {
	PORT: getEnv("PORT", "7000"),
	NODE_ENV: getEnv("NODE_ENV", "development"),
	MONGO_URI: getEnv("MONGO_URI"),
	BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
	FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
	JWT: {
		SECRET: getEnv("JWT_SECRET"),
		EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
		REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
		REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
	},
	MAILER_SENDER: getEnv("MAILER_SENDER"),
	RESEND_API_KEY: getEnv("RESEND_API_KEY"),
} as const;
