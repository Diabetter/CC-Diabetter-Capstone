import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import createHttpError from "http-errors";
import { sendError } from "../helpers/errorHandler.js";
import { getUserByEmail, createUser, logoutUser } from "../helpers/database.js";
import { registerSchema, loginSchema } from "../helpers/validationSchema.js";
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from "../helpers/jwtHandler.js";

const router = express.Router();

router.post("/register", async(req, res) => {
	try {
		const result = await registerSchema.validateAsync(req.body);
		const doesExist = await getUserByEmail(result.email);
		if (doesExist)
			throw createHttpError.Conflict(`${result.email} is already in use.`);
		const user = await createUser(result.name, result.email, result.password);
		const accessToken = await signAccessToken(user.id);
		const refreshToken = await signRefreshToken(user.id);
		res.send({accessToken, refreshToken});
	} catch(error) {
		if (error.isJoi === true)
			error.status = 422;
		sendError(res, error);
	}
});

router.post("/login", async(req, res, next) => {
	try {
		const result = await loginSchema.validateAsync(req.body);
		const user = await getUserByEmail(result.email);
		if (!user || !await bcrypt.compare(result.password, user.password))
			throw createHttpError.BadRequest("Invalid username or password");
		const accessToken = await signAccessToken(user.id);
		const refreshToken = await signRefreshToken(user.id);
		res.send({accessToken, refreshToken});
	} catch (error) {
		if (error.isJoi === true)
			error.status = 422;
		sendError(res, error);
	}
});

router.get("/verify-user", verifyAccessToken, async(req, res, next) => {
	res.json({message: "Authorized"}); 
});

router.post("/refresh-token", async(req, res, next) => {
	try {
		const {refreshToken} = req.body;
		if (!refreshToken)
			throw createHttpError.BadRequest();
		const userID = await verifyRefreshToken(refreshToken);
		const accessToken = await signAccessToken(userID);
		const newRefreshToken = await signRefreshToken(userID);
		res.send({accessToken: accessToken, refreshToken: newRefreshToken});
	} catch (error) {
		sendError(res, error);
	}
});

router.delete("/logout", async(req, res, next) => {
	try {
		const {accessToken} = req.body;
		if (!accessToken)
			throw createHttpError.BadRequest();
		logoutUser(accessToken);
		res.json({ message: "Token invalidated" });
	} catch (error) {
		sendError(res, error);
	}
});

// Google OAuth
router.get("/google", passport.authenticate(
	"google",
	{ scope: ["profile", "email"] }
));

router.get("/google/callback", passport.authenticate(
	"google",
	{ failureRedirect: "/login" }
), async (req, res) => {
	try {
		const accessToken = await signAccessToken(req.user.id);
		const refreshToken = await signRefreshToken(req.user.id);
		res.send({ accessToken, refreshToken });
	} catch (error) {
		sendError(res, error);
	}
});

export default router;