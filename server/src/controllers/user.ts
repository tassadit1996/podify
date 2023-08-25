import { RequestHandler } from "express";
import { createUser, verifyUser } from "../@types/user";
import User from "../models/user";
import { generateToken } from "../utils/helpers";
import {
	sendForgetPasswordLink,
	sendPassResetSuccessEmail,
	sendVerificationMail
} from "../utils/mail";
import EmailVerificationToken from "../models/emailVerificationToken";
import user from "../models/user";
import { isValidObjectId } from "mongoose";
import PasswordResetToken from "../models/passwordResetToken";
import crypto from "crypto";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "../utils/variables";
import jwt from "jsonwebtoken";

export const create: RequestHandler = async (req: createUser, res) => {
	const { email, password, name } = req.body;
	const user = await User.create({ email, password, name });
	const token = generateToken();
	await EmailVerificationToken.create({
		owner: user._id,
		token
	});
	sendVerificationMail(token, { email, name, id: user._id.toString() });
	res.json({ user });
};
export const verifyEmail: RequestHandler = async (req: verifyUser, res) => {
	const { id, token } = req.body;
	const verificationToken = await EmailVerificationToken.findOne({
		owner: id
	});
	if (!verificationToken)
		return res.status(403).json({ error: "invalid token" });
	const matched = await verificationToken.compareToken(token);
	if (!matched) return res.status(403).json({ error: "invalid token" });
	await User.findByIdAndUpdate(id, { verified: true });
	await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
	res.json({ message: "email verified !!" });
};
export const sendReverifyEmail: RequestHandler = async (req, res) => {
	const { id } = req.body;
	if (!isValidObjectId(id))
		return res.status(403).json({ error: "invalid user !" });
	const user = await User.findById(id);
	if (!user) return res.status(403).json({ error: "invalid request !" });
	const token = generateToken();
	await EmailVerificationToken.findOneAndDelete({ owner: id });

	await EmailVerificationToken.create({
		owner: id,
		token
	});
	await sendVerificationMail(token, {
		id: user._id.toString(),
		name: user.name,
		email: user.email
	});
	res.json({ message: "Please, check your emails !" });
};
export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	const token = crypto.randomBytes(36).toString("hex");
	if (!user) return res.status(403).json({ error: "Account not found !!" });
	await PasswordResetToken.findOneAndDelete({ owner: user._id });
	await PasswordResetToken.create({
		owner: user._id,
		token
	});
	const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&id=${user._id}`;
	await sendForgetPasswordLink({ email, link: resetLink });

	res.json({ message: "check your email" });
};
export const granValid: RequestHandler = async (req, res) => {
	res.json({ valid: true });
};
export const updatePassword: RequestHandler = async (req, res) => {
	const { password, id } = req.body;
	const user = await User.findById(id);
	if (!user) return res.status(403).json({ error: "Account not found" });
	const matched = user.comparePassword(password);
	if (!matched) {
		return res
			.status(403)
			.json({ error: "the new password must be diffrent !" });
	}

	user.password = password;
	user.save();
	sendPassResetSuccessEmail(user.name, user.email);
	res.json({ message: "Password resets successfully" });
};
export const signIn: RequestHandler = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user) return res.status(403).json({ error: "email/password mismatched" });
	const matched = user.comparePassword(password);
	if (!matched) {
		return res.status(403).json({ error: "email/password mismatched" });
	}
	const token = jwt.sign({ id: user._id }, JWT_SECRET);
	user.tokens.push(token);
	await user.save();

	res.json({profile:{id:user._id,email:user.email,name:user._id,verified:user.verified,avatar:user.avatar?.url,followers:user.followers.length,followings:user.followings.length},token});
};

