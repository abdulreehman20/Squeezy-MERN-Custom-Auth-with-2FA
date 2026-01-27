import passport from "passport";
import { setupJwtStrategy } from "../common/strategies/strategies";

const intializePassport = () => {
	setupJwtStrategy(passport);
};

intializePassport();
export default passport;
