import jwt from "jsonwebtoken";
import { Env } from "../../configs/env.config";
import type { SignOptions } from "jsonwebtoken";
import type { UserDocument } from "../../database/models/user.model";
import type { SessionDocument } from "../../database/models/session.model";

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

const defaultSignOptions: SignOptions = {
    audience: ["user"],
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
    return jwt.sign(payload, secret, { ...defaultSignOptions, ...opts });
};