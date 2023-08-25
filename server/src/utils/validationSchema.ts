import { isValidObjectId } from "mongoose";
import * as yup from "yup";

export const CreateUserSchema = yup.object().shape({
	name: yup
		.string()
		.trim()
		.required("name is missing!")
		.min(3, "too short !!")
		.max(20, "too long !!"),
	email: yup.string().required("email is missing!").email("format invalid!!"),
	password: yup
		.string()
		.required("password is missing!")
		.min(8, "too short !!")
		.matches(
			/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
			"too simple !!"
		)
});
export const TokenAndIdValidation = yup.object().shape({
	token: yup.string().trim().required("invalid token !"),
	id: yup
		.string()
		.transform(function(value) {
			if (this.isType(value) && isValidObjectId(value)) {
				return value;
			}
			return "";
		})
		.required("invalid user !")
});
export const UpdatePasswordSchema = yup.object().shape({
	token: yup.string().trim().required("invalid token !"),
	id: yup
		.string()
		.transform(function(value) {
			if (this.isType(value) && isValidObjectId(value)) {
				return value;
			}
			return "";
		})
		.required("invalid user !"),
	password: yup
		.string()
		.required("password is missing!")
		.min(8, "too short !!")
		.matches(
			/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
			"too simple !!"
		)
});
