import { Request } from "express";

export interface createUser extends Request {
	body: {
		name: string;
		email: string;
		password: string;
	};
}
export interface verifyUser extends Request {
	body: {
		id: string;
		token: string;
	};
}
declare global {
	namespace Express {
		interface Request {
			user: {
				id: any;
				email: string;
				name: string;
				verified: boolean;
				avatar?: string;
				followers: number;
				followings: number;
			};
			token: string
		}
	}
}
