import { RequestHandler } from "express";
import { PopulateFavList, createPlaylistRequest } from "../@types/audio";
import Audio from "../models/audio";
import Playlist from "../models/playlist";
import { isValidObjectId } from "mongoose";
import path from "path";

export const createPlaylist: RequestHandler = async (req: createPlaylistRequest, res) => {
    const { title, resId, visibility } = req.body
    const ownerId = req.user.id
    if (resId) {
        const audio = await Audio.findById(resId)
        if (!audio) res.status(403).json({ error: "could not found the audio" })
    }
    const newPlaylist = new Playlist({
        title, visibility, owner: ownerId
    })
    if (resId) newPlaylist.items = [resId as any]
    newPlaylist.save()
    res.status(201).json({
        playlist: {
            title: newPlaylist.title,
            id: newPlaylist._id,
            visibility: newPlaylist.visibility,

        }
    })
}
export const updatePlaylist: RequestHandler = async (req, res) => {
    const { title, visibility, item, id } = req.body
    const playlist = await Playlist.findOneAndUpdate({ _id: id, owner: req.user.id }, { title, visibility }, { new: true })
    if (!playlist) return res.status(404).json({ error: "Playlist not found" })
    if (item) {
        const audio = Audio.findById(item)
        if (!audio) return res.status(404).json({ error: "audio not found" })
        await Playlist.findByIdAndUpdate(playlist._id, {
            $addToSet: { items: item }
        })

    }
    res.status(201).json({
        playlist: {
            title: playlist.title,
            id: playlist._id,
            visibility: playlist.visibility,

        }
    })
}
export const removePlaylist: RequestHandler = async (req, res) => {
    const { all, resId, playlistId } = req.query
    if (!isValidObjectId(playlistId)) return res.status(422).json({ error: "Invalid playlist Id" })
    if (all == "yes") {
        const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: req.user.id })
        if (!playlist) return res.status(422).json({ error: "playlist not found" })
    }
    if (resId) {
        if (!isValidObjectId(resId)) return res.status(422).json({ error: "Invalid audio Id" })

        const playlist = await Playlist.findOneAndUpdate({ _id: playlistId, owner: req.user.id }, {
            $pull: { items: resId }
        })
        if (!playlist) return res.status(422).json({ error: "playlist not found" })

    }

    res.status(201).json({
        success: true
    })

}

export const getPlaylistByProfile: RequestHandler = async (req, res) => {
    const { pageNo = '0', limit = "20" } = req.query as { pageNo: string, limit: string }
    const data = await Playlist.find({ owner: req.user.id, visibility: { $ne: "auto" } }).skip(parseInt(pageNo) * parseInt(limit)).limit(parseInt(limit)).sort('-createdAt')
    const playlist = data.map((item) => {
        return {
            id: item._id,
            title: item.title,
            itemsCount: item.items.length,
            visibility: item.visibility
        }
    })
    res.status(201).json(playlist)

}

export const audiosPlaylist: RequestHandler = async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) return res.status(422).json({ error: "Invalid playlist Id" })
    const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user.id }).populate<{ items: PopulateFavList[] }>({
        path: 'items', populate: {
            path: "owner",
            select: 'name'
        }
    })
    if (!playlist) return res.json({ list: [] })
    const audios = playlist.items.map((item) => {
        return {
            id: item._id,
            title: item.title,
            category: item.category,
            file: item.file.url,
            poster: item.poster?.url,
            owner: { name: item.owner.name }
        }
    })
    res.json({
        list: {
            id: playlist._id,
            title: playlist.title,
            audios
        }
    })

}