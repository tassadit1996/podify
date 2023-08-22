import express from "express";
import "dotenv/config";
import "#/db";

const app = express();
const PORT = 3001;
app.listen(PORT, () => {
	console.log("Port is listening on port " + PORT);
});
