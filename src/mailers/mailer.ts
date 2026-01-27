import { Env } from "../configs/env.config";
import { resend } from "./resendClient";

type Params = {
	to: string | string[];
	subject: string;
	text: string;
	html: string;
	from?: string;
};

const mailer_sender =
	Env.NODE_ENV === "development"
		? `no-reply <onboarding@resend.dev>`
		: `no-reply <${Env.MAILER_SENDER}>`;

export const sendEmail = async ({
	to,
	from = mailer_sender,
	subject,
	text,
	html,
}: Params) =>
	await resend.emails.send({
		from: from,
		to: Array.isArray(to) ? to : [to],
		text: text,
		subject: subject,
		html: html,
	});
