import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	env: process.env.NODE_ENV || "development",
	port: process.env.PORT || 5000,
	database_url: process.env.DATABASE_URL,
	bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
	backend_url: process.env.BACKEND_URL || "http://localhost:5000",
	frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
	cors_origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "*",
	jwt: {
		secret: process.env.JWT_ACCESS_SECRET || "supersecretaccesskey",
		refresh_secret: process.env.JWT_REFRESH_SECRET || "supersecretrefreshkey",
		expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
		refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
	},
	google: {
		client_id: process.env.GOOGLE_CLIENT_ID,
		client_secret: process.env.GOOGLE_CLIENT_SECRET,
	},
	tester_admin: {
		name: process.env.TESTER_ADMIN_NAME,
		email: process.env.TESTER_ADMIN_EMAIL,
		password: process.env.TESTER_ADMIN_PASSWORD,
	},
	tester_owner: {
		name: process.env.TESTER_OWNER_NAME,
		email: process.env.TESTER_OWNER_EMAIL,
		password: process.env.TESTER_OWNER_PASSWORD,
	},
	tester_tenant: {
		name: process.env.TESTER_TENANT_NAME,
		email: process.env.TESTER_TENANT_EMAIL,
		password: process.env.TESTER_TENANT_PASSWORD,
	},
	redis: {
		user: process.env.REDIS_USER || process.env.REDIS_uSER || "default",
		password: process.env.REDIS_PASSWORD,
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT) || 6379,
	},
	smtp: {
		user: process.env.SMTP_USER,
		sender: process.env.EMAIL_SENDER,
		password: process.env.SMTP_PASSWORD,
	},
	cloudinary: {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	},
	bkash: {
		base_url: process.env.BKASH_BASE_URL,
		username: process.env.BKASH_USERNAME,
		password: process.env.BKASH_PASSWORD,
		app_key: process.env.BKASH_APP_KEY,
		app_secret: process.env.BKASH_APP_SECRET,
		callback_url: process.env.BKASH_CALLBACK_URL,
	},
};
