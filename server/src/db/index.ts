import mongoose from "mongoose";
import { URI } from "#/utils/variables";
mongoose.set("strictQuery", true);
mongoose
	.connect(URI)
	.then(() => {
		console.log("db connected !!");
	})
	.catch(err => {
		console.log("db disconnect !", err);
	});
