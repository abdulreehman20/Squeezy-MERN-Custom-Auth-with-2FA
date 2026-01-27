import {
	ExtractJwt,
	Strategy as JwtStrategy,
	type StrategyOptionsWithRequest,
} from "passport-jwt";
import { UnauthorizedException } from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Env } from "../../configs/env.config";
import passport, { type PassportStatic } from "passport";
import { userService } from "../../modules/user/user.module";

interface JwtPayload {
	userId: string;
	sessionId: string;
}

const options: StrategyOptionsWithRequest = {
	jwtFromRequest: ExtractJwt.fromExtractors([
		(req) => {
			const accessToken = req.cookies.accessToken;
			if (!accessToken) {
				throw new UnauthorizedException(
					"Unauthorized access token",
					ErrorCodeEnum.AUTH_TOKEN_NOT_FOUND,
				);
			}
			return accessToken;
		},
	]),
	secretOrKey: Env.JWT.SECRET,
	audience: ["user"],
	algorithms: ["HS256"],
	passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
	passport.use(
		new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
			try {
				const user = await userService.findUserById(payload.userId);
				if (!user) {
					return done(null, false);
				}
				req.sessionId = payload.sessionId;
				return done(null, user);
			} catch (error) {
				return done(error, false);
			}
		}),
	);
};

export const authenticateJWT = passport.authenticate("jwt", { session: false });
