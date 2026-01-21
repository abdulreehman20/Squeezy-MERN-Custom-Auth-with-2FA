import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";
import type { SessionDocument } from "../../database/models/session.model";
import type { UserDocument } from "../../database/models/user.model";
import { Env } from "../../configs/env.config";

export type AccessTPayload = {
	userId: UserDocument["_id"];
	sessionId: SessionDocument["_id"];
};

export type RefreshTPayload = {
	sessionId: SessionDocument["_id"];
};

type SignOptsAndSecret = SignOptions & {
	secret: string;
};

// Defaults used only for signing
const signDefaults: SignOptions = {
	audience: "user",
};

export const accessTokenSignOptions: SignOptsAndSecret = {
	expiresIn: Env.JWT.EXPIRES_IN as SignOptions["expiresIn"],
	secret: Env.JWT.SECRET,
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
	expiresIn: Env.JWT.REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
	secret: Env.JWT.REFRESH_SECRET,
};

export const signJwtToken = (
	payload: AccessTPayload | RefreshTPayload,
	options?: SignOptsAndSecret,
) => {
	const { secret, ...opts } = options || accessTokenSignOptions;
	return jwt.sign(payload, secret, {
		...signDefaults,
		...opts,
	});
};

export const verifyJwtToken = <TPayload extends object = AccessTPayload>(
	token: string,
	options?: VerifyOptions & { secret?: string },
) => {
	try {
		const { secret = Env.JWT.SECRET, ...opts } = options || {};
		const decodedUnknown = jwt.verify(token, secret, {
			...opts,
		}) as unknown;

		if (typeof decodedUnknown !== "object" || decodedUnknown === null) {
			return { error: "Invalid token payload" };
		}

		return { payload: decodedUnknown as TPayload };
	} catch (err: any) {
		return {
			error: err.message,
		};
	}
};

// import jwt from "jsonwebtoken";
// import { Env } from "../../Envs/env.config";
// import type { SignOptions, VerifyOptions, JwtPayload } from "jsonwebtoken";
// import type { UserDocument } from "../../database/models/user.model";
// import type { SessionDocument } from "../../database/models/session.model";

// export type AccessTPayload = {
//   userId: UserDocument["_id"];
//   sessionId: SessionDocument["_id"];
// };

// export type RefreshTPayload = {
//   sessionId: SessionDocument["_id"];
// };

// type SignOptsAndSecret = SignOptions & {
//   secret: string;
// };

// const defaultSignOptions: SignOptions = {
// 	// use a single string; VerifyOptions doesn’t accept a plain string[]
// 	audience: "user",
//   };  

// export const accessTokenSignOptions: SignOptsAndSecret = {
//   expiresIn: Env.JWT.EXPIRES_IN as SignOptions["expiresIn"],
//   secret: Env.JWT.SECRET,
// };

// export const refreshTokenSignOptions: SignOptsAndSecret = {
//   expiresIn: Env.JWT.REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
//   secret: Env.JWT.REFRESH_SECRET,
// };

// export const signJwtToken = (
//   payload: AccessTPayload | RefreshTPayload,
//   options?: SignOptsAndSecret,
// ) => {
//   const { secret, ...opts } = options || accessTokenSignOptions;
//   return jwt.sign(payload, secret, { ...defaultSignOptions, ...opts });
// };


// export const verifyJwtToken = <TPayload extends object = AccessTPayload>(
// 	token: string,
// 	options?: VerifyOptions & { secret?: string },
//   ) => {
// 	try {
// 	  const { secret = Env.JWT.SECRET, ...opts } = options || {};
// 	  const decoded = jwt.verify(token, secret, {
// 		...defaultSignOptions,
// 		...opts,
// 	  });
  
// 	  // jwt.verify can return string | JwtPayload; guard the string case
// 	  if (typeof decoded === "string") {
// 		return { error: "Invalid token payload" };
// 	  }
  
// 	  return { payload: decoded as TPayload };
// 	} catch (err: any) {
// 	  return { error: err.message };
// 	}
//   };