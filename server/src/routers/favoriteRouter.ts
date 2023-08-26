import { Router } from "express";
import { isVerified, mustAuth } from "../middleware/auth";
import { getFavorites, isFavorite, toggleFavorite } from "../controllers/favorite";

const router = Router()
router.post('/', mustAuth, isVerified, toggleFavorite)
router.get('/', mustAuth, isVerified, getFavorites)
router.get('/is-fav', mustAuth, isVerified, isFavorite)


export default router