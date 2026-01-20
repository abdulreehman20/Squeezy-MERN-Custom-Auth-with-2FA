import UserModel from "../../database/models/user.model";
import { BadRequestException } from "../../common/utils/app-error";
import { RegisterDto } from "../../common/interface/auth.interface";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../common/enums/verification-code-enums";
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time";


export class AuthService {
    public async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        const existingUser = await UserModel.exists({ email });
        if (existingUser) {
            throw new BadRequestException(
                "User already exists with this email",
                ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
            );
        }

        const newUser = await UserModel.create({
            name,
            email,
            password,
        });

        const userId = newUser._id;

        const verification = await VerificationCodeModel.create({
            userId,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiresAt: fortyFiveMinutesFromNow(),
        });

        return { user: newUser };
    }
}