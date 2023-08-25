import { Router } from "express";
import User from "../models/user";
import { createUser } from "../@types/user";
import {
	CreateUserSchema,
	TokenAndIdValidation,
	UpdatePasswordSchema
} from "../utils/validationSchema";
import { validate } from "../middleware/validator";
import {
	create,
	generateForgetPasswordLink,
	granValid,
	sendReverifyEmail,
	updatePassword,
	verifyEmail
} from "../controllers/user";
import { isValidPassResetToken } from "../middleware/auth";

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

export default router;
