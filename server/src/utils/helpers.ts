import { UserDocument } from "../models/user";

export const generateToken = () => {
	let otp = "";
	for (let i = 0; i < 6; i++) {
		const digit = Math.floor(Math.random() * 10);
		otp += digit;
	}
	return otp;
};

export const formatProfile = (user: UserDocument) => {
	return {
		id: user.id, email: user.email, name: user.name, verified: user.verified, avatar: user.avatar?.url, followers: user.followers.length, followings: user.followings.length
	}
}
