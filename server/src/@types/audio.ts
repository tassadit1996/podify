import { ObjectId } from "mongoose";
import { AudioDocument } from "../models/audio";
import { Request } from "express";

export type PopulateFavList = AudioDocument<{ _id: ObjectId, name: string }>
export interface createPlaylistRequest extends Request {
    body: { title: string, resId: string, visibility: "public" | "private" }
}