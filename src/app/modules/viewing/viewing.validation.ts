import { z } from "zod";
import { ViewingStatus } from "../../../generated/prisma/client.js";

const createViewingRequestZodSchema = z.object({
	body: z.object({
		scheduledAt: z
			.string({ message: "Scheduled date/time is required" })
			.refine((val) => !Number.isNaN(Date.parse(val)), {
				message: "Invalid date format for scheduledAt",
			}),
		notes: z.string().trim().optional(),
	}),
});

const updateViewingStatusZodSchema = z.object({
	body: z.object({
		status: z.nativeEnum(ViewingStatus, {
			message: "Status must be PENDING, CONFIRMED, COMPLETED, or CANCELLED",
		}),
	}),
});

export const ViewingValidation = {
	createViewingRequestZodSchema,
	updateViewingStatusZodSchema,
};
