import { Router } from "express";
import { audiosPlaylist, createPlaylist, getPlaylistByProfile, removePlaylist, updatePlaylist } from "../controllers/playlist";
import { isVerified, mustAuth } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { NewPlaylistValidationSchema, OldPlaylistValidationSchema } from "../utils/validationSchema";

const router = Router()
router.post('/create', mustAuth, isVerified, validate(NewPlaylistValidationSchema), createPlaylist)
router.patch('/', mustAuth, validate(OldPlaylistValidationSchema), updatePlaylist)
router.delete('/', mustAuth, removePlaylist)
router.get('/by-profile', mustAuth, getPlaylistByProfile)
router.get('/:playlistId', mustAuth, audiosPlaylist)




export default router