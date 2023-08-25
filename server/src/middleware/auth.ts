import { RequestHandler } from "express";
import User from "#/models/user";
import PasswordResetToken from "../models/passwordResetToken";
import { JwtPayload, verify } from "jsonwebtoken";
import { JWT_SECRET } from "../utils/variables";

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

export const mustAuth: RequestHandler = async (req, res, next) => {
	const { authorization } = req.headers;
	const token = authorization?.split('Bearer ')[1]
	if (!token) return res.status(403).json({ error: "Unauthorized request !" })
	const payload = verify(token, JWT_SECRET)
	const { id } = payload as JwtPayload
	const user = await User.findOne({ _id: id, tokens: token })
	if (!user) return res.status(403).json({ error: "Unauthorized request !" })
	req.user = { id: user._id, email: user.email, name: user.name, verified: user.verified, avatar: user.avatar?.url, followers: user.followers.length, followings: user.followings.length }
	next()
} 
