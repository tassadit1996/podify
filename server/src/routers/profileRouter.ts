import { Router } from "express"
import { mustAuth } from "../middleware/auth"
import { getPublicPlaylist, getPublicProfile, getPublicUploads, getUploads, updateFollower } from "../controllers/profile"

const router = Router()
router.post('/update-follower/:profileId', mustAuth, updateFollower)
router.get("/uploads", mustAuth, getUploads);
router.get("/uploads/:profileId", getPublicUploads);
router.get("/info/:profileId", getPublicProfile);
router.get("/playlist/:profileId", getPublicPlaylist);



export default router