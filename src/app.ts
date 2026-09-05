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
import { AuthRoutes } from "./app/modules/auth/auth.router.js";
import { PropertyRoutes } from "./app/modules/property/property.route.js";
import { UserRoutes } from "./app/modules/user/user.route.js";

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
			docs: "/api/docs",
		},
	});
});

// Health check endpoint
app.get("/health", async (_req: Request, res: Response) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.status(200).json({
			success: true,
			message: "Server and database are healthy",
			data: {
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				database: "connected",
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server is running but database connection failed",
			data: {
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				database: "disconnected",
				error: error instanceof Error ? error.message : "Database Error",
			},
		});
	}
});

// Application API Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/properties", PropertyRoutes);

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
