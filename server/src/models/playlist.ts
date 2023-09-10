import { Model, ObjectId, Schema, model, models } from "mongoose";
import { categories, categoriesTypes } from "../utils/audio_category";

export interface PlaylistDocument {
    title: string;
    owner: ObjectId;
    items: ObjectId[];
    visibility: "public" | "private" | "auto"
}
const PlaylistSchema = new Schema<PlaylistDocument>({
    title: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            type: Schema.Types.ObjectId,
            ref: "Audio"
        }
    ],
    visibility: {
        type: String,
        enum: ["public", "private", "auto"],
        default: 'auto'
    }

}, {
    timestamps: true
});
const Playlist = models.Playlist || model("Playlist", PlaylistSchema)
export default Playlist as Model<PlaylistDocument>
