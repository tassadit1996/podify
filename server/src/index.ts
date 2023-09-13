import express from "express";
import "dotenv/config";
import "#/db";
import authRouter from "#/routers/authRouter";
import audioRouter from "#/routers/audioRouter";
import favoriteRouter from "#/routers/favoriteRouter";
import playlistRouter from "#/routers/playlistRouter";
import profileRouter from "#/routers/profileRouter";
import historyRouter from "./routers/history";
import "./utils/schedule";






const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));
app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use("/history", historyRouter);





const PORT = 3001;

app.listen(PORT, () => {
	console.log("Port is listening on port " + PORT);
});
