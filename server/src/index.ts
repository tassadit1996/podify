import express from "express";
import "dotenv/config";
import "#/db";
import authRouter from "#/routers/authRouter";
import audioRouter from "#/routers/audioRouter";
import favoriteRouter from "#/routers/favoriteRouter";



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));
app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);


const PORT = 3001;

app.listen(PORT, () => {
	console.log("Port is listening on port " + PORT);
});
