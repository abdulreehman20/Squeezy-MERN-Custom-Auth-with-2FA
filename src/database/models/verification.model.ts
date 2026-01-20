import mongoose, { type Document, Schema } from "mongoose";
import { generateUniqueCode } from "../../common/utils/uuid";
import type { VerificationEnum } from "../../common/enums/verification-code-enums"


export interface verificationCodeDocument extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
    type: VerificationEnum;
    createdAt: Date;
    expiredAt: Date;
}

const verificationCodeSchema = new Schema<verificationCodeDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
        code: { type: String, unique: true, required: true, default: generateUniqueCode },
        type: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiredAt: { type: Date, required: true },
    },
);

const VerificationCodeModel = mongoose.model<verificationCodeDocument>("VerificationCode", verificationCodeSchema, "verification_codes");
export default VerificationCodeModel; 