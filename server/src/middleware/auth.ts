import { RequestHandler } from "express";
import User from "#/models/user";
import PasswordResetToken from "../models/passwordResetToken";

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
	const { token, id } = req.body;
	const PasswordReset = await PasswordResetToken.findOne({ owner: id });
	if (!PasswordReset)
		return res
			.status(422)
			.json({ error: "Unthorzied access, Invalid Token !" });
	const matched = await PasswordReset.compareToken(token);
	if (!matched)
		return res
			.status(422)
			.json({ error: "Unthorzied access, Invalid Token2 !" });

	next();
};
