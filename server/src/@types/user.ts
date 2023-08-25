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
