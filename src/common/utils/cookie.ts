import { Env } from "../../configs/env.config";
import type { CookieOptions, Response } from "express";
import { calculateExpirationDate } from "./date-time";

type CookiePayloadType = {
	res: Response;
	accessToken: string;
	refreshToken: string;
};

export const REFRESH_PATH = `${Env.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
	httpOnly: true,
	//secure: Env.NODE_ENV === "production" ? true : false,
	//sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
	const expiresIn = Env.JWT.REFRESH_EXPIRES_IN;
	const expires = calculateExpirationDate(expiresIn);
	return {
		...defaults,
		expires,
		path: REFRESH_PATH,
	};
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
	const expiresIn = Env.JWT.EXPIRES_IN;
	const expires = calculateExpirationDate(expiresIn);
	return {
		...defaults,
		expires,
		path: "/",
	};
};

export const setAuthenticationCookies = ({
	res,
	accessToken,
	refreshToken,
}: CookiePayloadType): Response =>
	res
		.cookie("accessToken", accessToken, getAccessTokenCookieOptions())
		.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

export const clearAuthenticationCookies = (res: Response): Response =>
	res.clearCookie("accessToken").clearCookie("refreshToken", {
		path: REFRESH_PATH,
	});
