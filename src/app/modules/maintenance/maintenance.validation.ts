import { z } from "zod";
import {
	MaintenanceStatus,
	Priority,
} from "../../../generated/prisma/client.js";

const createMaintenanceZodSchema = z.object({
	body: z.object({
		title: z
			.string()
			.trim()
			.min(2, "Title must be at least 2 characters long")
			.max(150, "Title cannot exceed 150 characters"),
		description: z
			.string()
			.trim()
			.min(5, "Description must be at least 5 characters long"),
		priority: z.nativeEnum(Priority).optional(),
	}),
});

const updateMaintenanceStatusZodSchema = z.object({
	body: z.object({
		status: z.nativeEnum(MaintenanceStatus, {
			message: "Status must be SUBMITTED, IN_PROGRESS, RESOLVED, or REJECTED",
		}),
		assignedTo: z.string().trim().optional(),
	}),
});

export const MaintenanceValidation = {
	createMaintenanceZodSchema,
	updateMaintenanceStatusZodSchema,
};
