const { env } = process as { env: { [key: string]: string } };
export const {
	URI,
	MAILTRAP_USER,
	MAILTRAP_PASS,
	VERIFICATION_MAIL,
	PASSWORD_RESET_LINK,
	SIGN_IN_URL
} = env;
