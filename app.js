import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import morgan from "morgan";
import dotenv from "dotenv";
import passport from "passport";
import AuthRoute from "./routes/auth.js";
import pool from "./helpers/database.js";
import { createLogDirectory } from "./helpers/createLogDir.js";


dotenv.config();
createLogDirectory();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.join(__dirname, "./public");
const PORT = process.env.PORT || 8081;
const accessLogStream = fs.createWriteStream( path.join(__dirname, "logs/access.log"), { flags: "a" });


app.use(morgan("common", { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(publicDirectory));

// helper for login Google
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", AuthRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}...`);
});

process.on('SIGINT', () => {
	console.log("Received SIGINT signal. Gracefully shutting down...")
	pool.end();
	process.exit();
});
