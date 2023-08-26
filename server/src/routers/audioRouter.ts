import { Router } from "express";
import { isVerified, mustAuth } from "../middleware/auth";
import fileParser from "../middleware/fileParser";
import { createAudio, updateAudio } from "../controllers/audio";

const router = Router()
router.post('/create', mustAuth, fileParser, isVerified, createAudio)
router.patch('/update/:audioId', mustAuth, fileParser, isVerified, updateAudio)

export default router