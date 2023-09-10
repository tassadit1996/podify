import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import { categories } from "./audio_category";

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
		.transform(function (value) {
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
		.transform(function (value) {
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
export const SignInValidationSchema = yup.object().shape({
	email: yup.string().required("email is missing!").email("format invalid!!"),
	password: yup.string().required("password is missing!")
});
export const AudioValidationSchema = yup.object().shape({
	title: yup.string().required("title is missing!"),
	about: yup.string().required("about is missing!"),
	category: yup.string().required("category is missing!")
});
export const NewPlaylistValidationSchema = yup.object().shape({
	title: yup.string().required("Title is missing!"),
	resId: yup.string().transform(function (value) {
		return this.isType(value) && isValidObjectId(value) ? value : "";
	}),
	visibility: yup
		.string()
		.oneOf(["public", "private"], "Visibility must be public or private!")
		.required("Visibility is missing!"),
});
export const OldPlaylistValidationSchema = yup.object().shape({
	title: yup.string().required("Title is missing!"),
	// this is going to validate the audio id
	item: yup.string().transform(function (value) {
		return this.isType(value) && isValidObjectId(value) ? value : "";
	}),
	// this is going to validate the playlist id
	id: yup.string().transform(function (value) {
		return this.isType(value) && isValidObjectId(value) ? value : "";
	}),
	visibility: yup
		.string()
		.oneOf(["public", "private"], "Visibility must be public or private!"),
	// .required("Visibility is missing!"),
});