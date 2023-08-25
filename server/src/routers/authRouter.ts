import { Router } from "express";
import {
	CreateUserSchema,
	SignInValidationSchema,
	TokenAndIdValidation,
	UpdatePasswordSchema
} from "../utils/validationSchema";
import { validate } from "../middleware/validator";
import {
	create,
	generateForgetPasswordLink,
	granValid,
	logOut,
	sendProfile,
	sendReverifyEmail,
	signIn,
	updatePassword,
	updateProfile,
	verifyEmail
} from "../controllers/user";
import { isValidPassResetToken, mustAuth } from "../middleware/auth";
import { JwtPayload, verify } from "jsonwebtoken";
import { JWT_SECRET } from "../utils/variables";
import User from "../models/user";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import fileParser from "../middleware/fileParser";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverifyEmail);
router.post("/reset-password", generateForgetPasswordLink);
router.post(
	"/verify-pass-reset-token",
	validate(TokenAndIdValidation),
	isValidPassResetToken,
	granValid
);
router.post(
	"/update-password",
	validate(UpdatePasswordSchema),
	isValidPassResetToken,
	updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signIn);
router.post("/is-auth", mustAuth, sendProfile);
router.post("/update-profile", mustAuth, fileParser, updateProfile);
router.post("/log-out", mustAuth, logOut);


export default router;
