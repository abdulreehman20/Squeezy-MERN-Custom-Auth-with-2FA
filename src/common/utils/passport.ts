import passport from "passport";
import { setupJwtStrategy } from "../strategies/strategies";


const intializePassport = () => { setupJwtStrategy(passport) };

intializePassport();
export default passport;