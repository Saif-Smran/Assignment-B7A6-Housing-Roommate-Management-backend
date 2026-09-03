import { createClient } from "redis";
import config from "../config/index.js";

export const redisClient = createClient({
	username: config.redis.user,
	password: config.redis.password,
	socket: {
		host: config.redis.host,
		port: Number(config.redis.port),
	},
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

export const connectRedis = async () => {
	if (!redisClient.isOpen) {
		await redisClient.connect();
		console.log("Connected to Redis successfully.");
	}
};
