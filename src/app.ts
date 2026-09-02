import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./app/config/index.js";
import { prisma } from "./app/lib/prisma.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";

const app: Application = express();

// Middlewares
app.use(
	cors({
		origin: config.cors_origin === "*" ? true : config.cors_origin,
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get("/", (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Welcome to Housing & Roommate Management Platform API",
		data: {
			version: "1.0.0",
			docs: "/api/v1/docs",
		},
	});
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Server is healthy",
		data: {
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		},
	});
});

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "API Route Not Found",
		errors: [
			{
				path: req.originalUrl,
				message: `The requested endpoint [${req.method} ${req.originalUrl}] does not exist on this server.`,
			},
		],
	});
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
export { prisma };
