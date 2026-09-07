import { z } from "zod";
import { Role } from "../../../generated/prisma/client.js";

const registerZodSchema = z.object({
	body: z.object({
		fullName: z
			.string()
			.trim()
			.min(2, "Full name must be at least 2 characters long")
			.max(100, "Full name cannot exceed 100 characters"),
		email: z.string().email("Invalid email address").trim().toLowerCase(),
		password: z.string().min(6, "Password must be at least 6 characters long"),
		phone: z.string().trim().optional(),
		role: z.nativeEnum(Role).optional(),
	}),
});

const loginZodSchema = z.object({
	body: z.object({
		email: z.string().email("Invalid email address").trim().toLowerCase(),
		password: z.string().min(1, "Password is required"),
	}),
});

const googleLoginZodSchema = z.object({
	body: z
		.object({
			idToken: z.string().optional(),
			credential: z.string().optional(),
			accessToken: z.string().optional(),
			code: z.string().optional(),
			role: z.nativeEnum(Role).optional(),
		})
		.refine(
			(data) => data.idToken || data.credential || data.accessToken || data.code,
			{
				message:
					"At least one of idToken, credential, accessToken, or code is required for Google authentication",
			},
		),
});

const refreshTokenZodSchema = z.object({
	body: z
		.object({
			refreshToken: z.string().optional(),
		})
		.optional(),
	cookies: z
		.object({
			refreshToken: z.string().optional(),
		})
		.optional(),
});

export const AuthValidation = {
	registerZodSchema,
	loginZodSchema,
	googleLoginZodSchema,
	refreshTokenZodSchema,
};
