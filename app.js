import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/auth.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json())
app.use(cookieParser())

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}...`);
});

app.use(router);