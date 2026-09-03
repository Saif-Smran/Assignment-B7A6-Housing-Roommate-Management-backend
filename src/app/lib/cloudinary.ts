import { v2 as Cloudinary } from "cloudinary";
import config from "../config/index.js";

Cloudinary.config({
	cloud_name: config.cloudinary.cloud_name,
	api_key: config.cloudinary.api_key,
	api_secret: config.cloudinary.api_secret,
});

export const cloudinary = Cloudinary;
