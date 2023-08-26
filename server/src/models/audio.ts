import { Model, ObjectId, Schema, model, models } from "mongoose";
import { categories, categoriesTypes } from "../utils/audio_category";

export interface AudioDocument<T = ObjectId> {
    _id: ObjectId;
    title: string;
    about: string;
    owner: T;
    file: {
        url: string;
        publicId: string;
    };
    poster: {
        url: string;
        publicId: string;
    };
    likes: ObjectId[];
    category: categoriesTypes;
}
const AudioSchema = new Schema<AudioDocument>({
    title: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    file: {
        type: Object,
        url: String,
        publicId: String
    },
    poster: {
        type: Object,
        url: String,
        publicId: String
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    category: {
        type: String,
        enum: categories
    }
}, {
    timestamps: true
});
const Audio = models.Audio || model("Audio", AudioSchema)
export default Audio as Model<AudioDocument>
