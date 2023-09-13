import { Router } from "express";
import { isVerified, mustAuth } from "../middleware/auth";
import fileParser from "../middleware/fileParser";
import { createAudio, getLatestUploads, updateAudio } from "../controllers/audio";

const router = Router()
router.post('/create', mustAuth, fileParser, isVerified, createAudio)
router.patch('/update/:audioId', mustAuth, fileParser, isVerified, updateAudio)
router.get("/latest", getLatestUploads);


export default router