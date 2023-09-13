import { RequestHandler } from "express";
import { RequestWithFiles } from "../middleware/fileParser";
import formidable from "formidable";
import cloudinary from "../cloud";
import { categoriesTypes } from "../utils/audio_category";
import Audio from "../models/audio";
import { PopulateFavList } from "../@types/audio";
interface CreateAudioRequest extends RequestWithFiles {
    body: {
        title: string, about: string, category: categoriesTypes
    }
}
export const createAudio: RequestHandler = async (req: CreateAudioRequest, res) => {
    const title = req.body.title[0]
    const about = req.body.about[0]
    const category = req.body.category[0]


    const poster = req.files?.poster![0] as formidable.File
    const audioFile = req.files?.file![0] as formidable.File
    const ownerId = req.user.id
    if (!audioFile) return res.status(422).json({ error: "Audio file is missing" })
    const audioRes = await cloudinary.uploader.upload(audioFile.filepath, {
        resource_type: 'video'
    })
    const newAudio = new Audio({
        title, about, category, owner: ownerId,
        file: { url: audioRes.secure_url, publicId: audioRes.public_id }
    })
    if (poster) {
        const posterRes = await cloudinary.uploader.upload(poster.filepath, {
            width: 300,
            height: 300,
            crop: "thumb",
            gravity: "face"
        })
        newAudio.poster = { url: posterRes.secure_url, publicId: posterRes.public_id }
    }
    await newAudio.save()
    res.status(201).json({ audio: { title, about, file: newAudio.file.url, poster: newAudio.poster?.url } })

}
export const updateAudio: RequestHandler = async (req: CreateAudioRequest, res) => {
    console.log(req.body, req.params);

    const title = req.body.title[0]
    const about = req.body.about[0]
    const category = req.body.category[0]
    const { audioId } = req.params
    const poster = req.files?.poster![0] as formidable.File
    const ownerId = req.user.id
    const audio = await Audio.findOneAndUpdate({ owner: ownerId, _id: audioId }, { title, about, category }, { new: true })
    if (!audio) return res.status(403).json({ error: "Audio not found" })

    if (poster) {
        if (audio.poster.publicId) {
            await cloudinary.uploader.destroy(audio.poster.publicId)
        }
        const posterRes = await cloudinary.uploader.upload(poster.filepath, {
            width: 300,
            height: 300,
            crop: "thumb",
            gravity: "face"
        })
        audio.poster = { url: posterRes.secure_url, publicId: posterRes.public_id }

    }
    await audio.save()
    res.status(201).json({ audio: { title, about, file: audio.file.url, poster: audio.poster?.url } })

}
export const getLatestUploads: RequestHandler = async (req, res) => {
    const list = await Audio.find()
        .sort("-createdAt")
        .limit(10)
        .populate<PopulateFavList>("owner");

    const audios = list.map((item) => {
        return {
            id: item._id,
            title: item.title,
            about: item.about,
            category: item.category,
            file: item.file.url,
            poster: item.poster?.url,
            owner: { name: item.owner.name, id: item.owner._id },
        };
    });

    res.json({ audios });
};