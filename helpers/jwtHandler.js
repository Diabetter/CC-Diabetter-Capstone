import JWT from "jsonwebtoken";
import createHttpError from "http-errors";
import { sendError } from "../helpers/errorHandler.js";
import { checkToken } from "../helpers/database.js"

export function signAccessToken(userID) {
	return new Promise((resolve, reject) => {
		const payload = {
		};
		const secret = process.env.ACCESS_TOKEN_SECRET;
		const options = {
			expiresIn: "12h",
			issuer: "google.com",
			audience: userID.toString(),
		};
		JWT.sign(payload, secret, options, (err, token) => {
			if (err) {
				console.log(err.message);
				return (reject(createHttpError.InternalServerError()));
			}
			resolve(token);
		});
	});
}

export async function verifyAccessToken(req, res, next) {
	if (!req.headers["authorization"]) {
		sendError(res, createHttpError.Unauthorized());
		return ;
	}
	const token = req.headers["authorization"].split(' ')[1];
	const invalidatedToken = await checkToken(token);
	if (invalidatedToken) {
		sendError(res, createHttpError.Unauthorized())
		return ;
	}
	JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
		if (err) {
			if (err.name === "JsonWebTokenError") {
				sendError(res, createHttpError.Unauthorized());
				return ;
			}
			else {
				sendError(res, createHttpError.Unauthorized(err.message));
				return ;
			}
		}
		req.payload = payload;
		next();
	});
}

export function	signRefreshToken(userID) {
	return new Promise((resolve, reject) => {
		const payload = {
		};
		const secret = process.env.REFRESH_TOKEN_SECRET;
		const options = {
			expiresIn: "1y",
			issuer: "google.com",
			audience: userID.toString(),
		};
		JWT.sign(payload, secret, options, (err, token) => {
			if (err) {
				console.log(err.message);
				return (reject(createHttpError.InternalServerError()));
			}
			resolve(token);
		});
	});
}

export function	verifyRefreshToken(refreshToken) {
	return new Promise((resolve, reject) => {
		JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
			if (err)
				return reject(createHttpError.Unauthorized());
			const	userID = payload.aud;
			resolve(userID);	
		});
	});
}