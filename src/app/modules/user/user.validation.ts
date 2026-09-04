import { z } from "zod";
import { Role } from "../../../generated/prisma/client.js";

const updateProfileZodSchema = z.object({
	body: z.object({
		fullName: z
			.string()
			.trim()
			.min(2, "Full name must be at least 2 characters long")
			.max(100, "Full name cannot exceed 100 characters")
			.optional(),
		phone: z.string().trim().optional(),
	}),
});

const changeRoleZodSchema = z.object({
	body: z.object({
		role: z.nativeEnum(Role, {
			message: "Role must be TENANT, OWNER, or ADMIN",
		}),
	}),
});

export const UserValidation = {
	updateProfileZodSchema,
	changeRoleZodSchema,
};
