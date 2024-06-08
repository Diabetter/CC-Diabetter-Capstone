import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { mySQLErrorHandler } from "./errorHandler.js";

dotenv.config();

const pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: process.env.MYSQL_DATABASE,
}).promise();

export async function createTableIfNotExists() {
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				password VARCHAR(255),
				google_id VARCHAR(255) UNIQUE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			);
		`);
		await pool.query(`
			CREATE TABLE IF NOT EXISTS invalidated_tokens (
				id INT AUTO_INCREMENT PRIMARY KEY,
				token VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			);
		`);
	} catch (error) {
		mySQLErrorHandler(error);
		throw error;
	}
}

export async function getUserById(id) {
	try {
		const [data] = await pool.query(`
			SELECT * \
			FROM users\
			WHERE id = ?;`, [id]);
		return data[0];
	} catch (error) {
			mySQLErrorHandler(error);
			throw error;
	}
}

export async function getUserByEmail(email) {
	try {
		const [data] = await pool.query(`
			SELECT * \
			FROM users \
			WHERE email = ?;`, [email]);
		return data[0];
	} catch (error) {
			mySQLErrorHandler(error);
			throw error;
	}
}

export async function createUser(name, email, password) {
	try {
		password = await bcrypt.hash(password, 8);
		const [data] = await pool.query(`
			INSERT INTO users (name, email, password) \
			VALUES (?, ?, ?);`, [name, email, password]);
		return getUserById(data.insertId);
	} catch (error) {
			mySQLErrorHandler(error);
			throw error;
	}
}

export async function checkToken(accessToken) {
	try {
		const [doesExist] = await pool.query(`
			SELECT * \
			FROM invalidated_tokens
			WHERE token = ?`, [accessToken]);
		if (doesExist[0])
			return doesExist[0];
		return null;
	} catch (error) {
		mySQLErrorHandler(error);
		throw error;
	}
}

export async function logoutUser(accessToken) {
	try {
	const token = await checkToken(accessToken);
	if (token)
		return token;
	const [data] = await pool.query(`
		INSERT INTO invalidated_tokens (token) \
		VALUES (?);`, [accessToken]);
	return data[0];
	} catch (error) {
		mySQLErrorHandler(error);
		throw error;
	}
}

export async function getUserByGoogleId(id) {
	try {
		const [data] = await pool.query(`
			SELECT * \
			FROM users\
			WHERE google_id = ?;`, [id]);
		return data[0];
	} catch (error) {
			mySQLErrorHandler(error);
			throw error;
	}
}

export async function createUserWithGoogleId(googleId) {
	try {
		const [data] = await pool.query(`
			INSERT INTO users (name, email, password, google_id) \
			VALUES (?, ?, ?, ?);`, [googleId.name, googleId.email, googleId.password, googleId.googleId]);
		return getUserById(data.insertId);
	} catch (error) {
			mySQLErrorHandler(error);
			throw error;
	}
}

export default pool;
