import { z } from "zod";
import { Role } from "../../../generated/prisma/client.js";

const changeUserRoleZodSchema = z.object({
	body: z.object({
		role: z.nativeEnum(Role, {
			message: "Role is required and must be TENANT, OWNER, or ADMIN",
		}),
	}),
});

export const AdminValidation = {
	changeUserRoleZodSchema,
};
