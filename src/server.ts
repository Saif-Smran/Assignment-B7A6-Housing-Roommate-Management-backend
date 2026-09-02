import type { Server } from "node:http";
import app from "./app.js";
import config from "./app/config/index.js";

let server: Server;

async function main() {
	try {
		server = app.listen(config.port, () => {
			console.log(
				`🚀 Server running in ${config.env} mode on http://localhost:${config.port}`,
			);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

main();

// Process signal & exception handlers for graceful shutdown
process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	if (server) {
		server.close(() => {
			console.log("Server closed due to unhandled rejection");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
});

process.on("uncaughtException", (error) => {
	console.error("❌ Uncaught Exception:", error);
	if (server) {
		server.close(() => {
			console.log("Server closed due to uncaught exception");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
});

process.on("SIGTERM", () => {
	console.log("⚠️ SIGTERM received. Shutting down gracefully...");
	if (server) {
		server.close(() => {
			console.log("Server closed cleanly.");
		});
	}
});
