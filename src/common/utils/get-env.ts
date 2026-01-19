export const getEnv = (key: string, defaultValue?: string): string => {
	const val = process.env[key] ?? defaultValue;

	if (process.env.NODE_ENV !== "production") {
		console.log(`Env ${key}: ${val}`);
	}

	if (!val) {
		throw new Error(`Missing env variable: ${key}`);
	}

	return val;
};
