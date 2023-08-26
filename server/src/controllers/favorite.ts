import { RequestHandler } from "express";
import { ObjectId, isValidObjectId } from "mongoose";
import Audio, { AudioDocument } from "../models/audio";
import Favorite from "../models/favorite";
import { PopulateFavList } from "../@types/audio";

export const toggleFavorite: RequestHandler = async (req, res) => {

    const { audioId } = req.body
    let status: "added" | "removed"
    if (!isValidObjectId(audioId)) return res.status(422).json({ error: "Audio id not valid" })
    const audio = await Audio.findById(audioId)
    if (!audio) return res.status(404).json({ error: "Audio not found" })
    const alreadyExists = await Favorite.findOne({ owner: req.user.id, items: audioId })
    if (alreadyExists) {
        await Favorite.updateOne({ owner: req.user.id }, {
            $pull: { items: audioId }
        })
        status = "removed"
    } else {
        const favorite = await Favorite.findOne({ owner: req.user.id })
        if (favorite) {
            await Favorite.updateOne({ owner: req.user.id }, {
                $addToSet: { items: audioId }
            })
        } else {
            await Favorite.create({ owner: req.user.id, items: [audioId] })
        }
        status = "added"
    }
    if (status === "added") {
        await Audio.findByIdAndUpdate(audioId, {
            $addToSet: { likes: req.user.id }
        })
    }
    if (status === "removed") {
        await Audio.findByIdAndUpdate(audioId, {
            $pull: { likes: req.user.id }
        })
    }
    res.json({ status })
}
export const getFavorites: RequestHandler = async (req, res) => {
    const userId = req.user.id

    const favorite = await Favorite.findOne({ owner: userId }).populate<{
        items: PopulateFavList[];
    }>({
        path: "items",
        populate: {
            path: "owner",
        },
    });
    if (!favorite) return res.json({ audios: [] });

    const audios = favorite.items.map((item) => {
        return {
            id: item._id,
            title: item.title,
            category: item.category,
            file: item.file.url,
            poster: item.poster?.url,
            owner: { name: item.owner.name, id: item.owner._id },
        };
    });
    res.json({ audios });

}
export const isFavorite: RequestHandler = async (req, res) => {
    const audioId = req.query.audioId
    if (!isValidObjectId(audioId)) return res.status(422).json({ error: "Audio id not valid" })
    const favorite = await Favorite.findOne({
        owner: req.user.id,
        items: audioId
    })


    res.json({ result: favorite ? true : false });

}