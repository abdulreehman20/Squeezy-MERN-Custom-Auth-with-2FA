import { Resend } from "resend";
import { Env } from "../configs/env.config";

export const resend = new Resend(Env.RESEND_API_KEY);
