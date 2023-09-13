import History from "#/models/history";
import { UserDocument } from "#/models/user";
import { Request } from "express";
import moment from "moment";

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
export const getUsersPreviousHistory = async (
	req: Request
): Promise<string[]> => {
	const [result] = await History.aggregate([
		{ $match: { owner: req.user.id } },
		{ $unwind: "$all" },
		{
			$match: {
				"all.date": {
					// only those histories which are not older than 30 days
					$gte: moment().subtract(30, "days").toDate(),
				},
			},
		},
		{ $group: { _id: "$all.audio" } },
		{
			$lookup: {
				from: "audios",
				localField: "_id",
				foreignField: "_id",
				as: "audioData",
			},
		},
		{ $unwind: "$audioData" },
		{ $group: { _id: null, category: { $addToSet: "$audioData.category" } } },
	]);

	if (result) {
		return result.category;
	}

	return [];
};
