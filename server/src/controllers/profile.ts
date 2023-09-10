import { RequestHandler } from "express";
import User from "../models/user";
import { paginationQuery } from "../@types/misc";
import Audio, { AudioDocument } from "../models/audio";
import { ObjectId, isValidObjectId } from "mongoose";
import Playlist from "../models/playlist";

export const updateFollower: RequestHandler = async (req, res) => {
    const { profileId } = req.params
    let status: "added" | "removed"
    const profile = User.findById(profileId)
    if (!profile) return res.status(422).json({ error: "profile not found" })
    const alreadyFollowed = await User.findOne({ _id: profileId, followers: req.user.id })
    if (alreadyFollowed) {
        await User.updateOne({ _id: profileId }, {
            $pull: { followers: req.user.id }
        })
        status = "removed"
    } else {
        await User.updateOne({ _id: profileId }, {
            $addToSet: { followers: req.user.id }
        })
        status = "added"
    }
    if (status === "added") {
        await User.updateOne({ _id: req.user.id }, {
            $addToSet: { followings: profileId }
        })
    }
    if (status === "removed") {
        await User.updateOne({ _id: req.user.id }, {
            $pull: { followings: profileId }
        })
    }
    res.json({ status })
}
export const getUploads: RequestHandler = async (req, res) => {
    const { limit = "20", pageNo = "0" } = req.query as paginationQuery;

    const data = await Audio.find({ owner: req.user.id })
        .skip(parseInt(limit) * parseInt(pageNo))
        .limit(parseInt(limit))
        .sort("-createdAt");

    const audios = data.map((item) => {
        return {
            id: item._id,
            title: item.title,
            about: item.about,
            file: item.file.url,
            poster: item.poster?.url,
            date: item.createdAt,
            owner: { name: req.user.name, id: req.user.id },
        };
    });

    res.json({ audios });
};
export const getPublicUploads: RequestHandler = async (req, res) => {
    const { limit = "20", pageNo = "0" } = req.query as paginationQuery;
    const { profileId } = req.params;

    if (!isValidObjectId(profileId))
        return res.status(422).json({ error: "Invalid profile id!" });

    const data = await Audio.find({ owner: profileId })
        .skip(parseInt(limit) * parseInt(pageNo))
        .limit(parseInt(limit))
        .sort("-createdAt")
        .populate<AudioDocument<{ name: string; _id: ObjectId }>>("owner");

    const audios = data.map((item) => {
        return {
            id: item._id,
            title: item.title,
            about: item.about,
            file: item.file.url,
            poster: item.poster?.url,
            date: item.createdAt,
            owner: { name: item.owner.name, id: item.owner._id },
        };
    });

    res.json({ audios });
};
export const getPublicProfile: RequestHandler = async (req, res) => {
    const { profileId } = req.params;

    if (!isValidObjectId(profileId))
        return res.status(422).json({ error: "Invalid profile id!" });

    const user = await User.findById(profileId);
    if (!user) return res.status(422).json({ error: "User not found!" });

    res.json({
        profile: {
            id: user._id,
            name: user.name,
            followers: user.followers.length,
            avatar: user.avatar?.url,
        },
    });
};
export const getPublicPlaylist: RequestHandler = async (req, res) => {
    const { profileId } = req.params;
    const { limit = "20", pageNo = "0" } = req.query as paginationQuery;

    if (!isValidObjectId(profileId))
        return res.status(422).json({ error: "Invalid profile id!" });

    const playlist = await Playlist.find({
        owner: profileId,
        visibility: "public",
    })
        .skip(parseInt(limit) * parseInt(pageNo))
        .limit(parseInt(limit))
        .sort("-createdAt");

    if (!playlist) return res.json({ playlist: [] });

    res.json({
        playlist: playlist.map((item) => {
            return {
                id: item._id,
                title: item.title,
                itemsCount: item.items.length,
                visibility: item.visibility,
            };
        }),
    });
};