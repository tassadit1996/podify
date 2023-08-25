import express from "express";
import "dotenv/config";
import "#/db";
import authRouter from "#/routers/authRouter";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));
app.use("/auth", authRouter);
const PORT = 3001;

app.listen(PORT, () => {
	console.log("Port is listening on port " + PORT);
});
