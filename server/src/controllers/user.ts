import { RequestHandler } from "express";
import { createUser, verifyUser } from "../@types/user";
import User from "../models/user";
import { formatProfile, generateToken } from "../utils/helpers";
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
import { RequestWithFiles } from "../middleware/fileParser";
import cloudinary from "../cloud";
import { error } from "console";
import formidable from "formidable";

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

	res.json({ profile: { id: user._id, email: user.email, name: user.name, verified: user.verified, avatar: user.avatar?.url, followers: user.followers.length, followings: user.followings.length }, token });
};

export const updateProfile: RequestHandler = async (
	req: RequestWithFiles,
	res
) => {


	const { name } = req.body;
	const avatar = req.files?.avatar[0];
	const user = await User.findById(req.user.id);
	if (!user) throw new Error("something went wrong, user not found!");

	if (typeof name[0] !== "string")
		return res.status(422).json({ error: "Invalid name!" });

	if (name[0].trim().length < 3)
		return res.status(422).json({ error: "Invalid name!" });

	user.name = name[0];


	if (avatar) {
		if (user.avatar?.publicId) {
			await cloudinary.uploader.destroy(user.avatar?.publicId)
		}
		// upload new avatar file

		await cloudinary.uploader.upload(
			avatar.filepath,
			{
				width: 300,
				height: 300,
				crop: "thumb",
				gravity: "face",
			}
		).then(({ secure_url, public_id }) => {
			user.avatar = { url: secure_url, publicId: public_id };
		})
			.catch(error => {
				console.error("An error occurred during avatar upload:", error);
			});
	}

	await user.save();

	res.json({ profile: formatProfile(user) });
};
export const sendProfile: RequestHandler = (req, res) => {
	res.json({
		profile: req.user
	});
}
export const logOut: RequestHandler = async (req, res) => {
	const { fromAll } = req.query;

	const token = req.token;
	const user = await User.findById(req.user.id);
	if (!user) throw new Error("something went wrong, user not found!");

	// logout from all
	if (fromAll === "yes") user.tokens = [];
	else user.tokens = user.tokens.filter((t) => t !== token);

	await user.save();
	res.json({ success: true });
};
