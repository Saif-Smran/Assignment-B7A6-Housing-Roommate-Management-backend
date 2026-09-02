import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	env: process.env.NODE_ENV || "development",
	port: process.env.PORT || 5000,
	database_url: process.env.DATABASE_URL,
	jwt: {
		secret: process.env.JWT_ACCESS_SECRET || "supersecretaccesskey",
		refresh_secret: process.env.JWT_REFRESH_SECRET || "supersecretrefreshkey",
		expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
		refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
	},
	cors_origin: process.env.CORS_ORIGIN || "*",
};
