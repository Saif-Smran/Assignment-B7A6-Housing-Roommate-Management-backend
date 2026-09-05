import { z } from "zod";

const createApplicationZodSchema = z.object({
	body: z.object({
		roomId: z.string().trim().min(1, "Room ID is required"),
		moveInDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
			message: "Invalid date format for moveInDate",
		}),
		moveOutDate: z
			.string()
			.optional()
			.refine((val) => val === undefined || !Number.isNaN(Date.parse(val)), {
				message: "Invalid date format for moveOutDate",
			}),
		message: z.string().trim().optional(),
	}),
});

const updateApplicationStatusZodSchema = z.object({
	body: z.object({
		status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]),
	}),
});

export const ApplicationValidation = {
	createApplicationZodSchema,
	updateApplicationStatusZodSchema,
};
