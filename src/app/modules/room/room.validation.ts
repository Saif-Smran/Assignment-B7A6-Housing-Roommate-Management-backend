import { z } from "zod";

const createRoomZodSchema = z.object({
	body: z.object({
		roomNumber: z.string().trim().optional(),
		roomType: z.string().trim().min(1, "Room type is required"),
		capacity: z
			.number()
			.int("Capacity must be an integer")
			.positive("Capacity must be a positive number"),
		rentAmount: z.number().positive("Rent amount must be a positive number"),
		securityDeposit: z
			.number()
			.nonnegative("Security deposit cannot be negative")
			.optional(),
		availableFrom: z
			.string()
			.refine((val) => !Number.isNaN(Date.parse(val)), {
				message: "Invalid date format for availableFrom",
			})
			.optional(),
		availableTo: z
			.string()
			.refine((val) => !Number.isNaN(Date.parse(val)), {
				message: "Invalid date format for availableTo",
			})
			.optional(),
		isAvailable: z.boolean().optional(),
		description: z.string().trim().optional(),
	}),
});

const updateRoomZodSchema = z.object({
	body: z.object({
		roomNumber: z.string().trim().optional(),
		roomType: z.string().trim().optional(),
		capacity: z
			.number()
			.int("Capacity must be an integer")
			.positive("Capacity must be a positive number")
			.optional(),
		rentAmount: z
			.number()
			.positive("Rent amount must be a positive number")
			.optional(),
		securityDeposit: z
			.number()
			.nonnegative("Security deposit cannot be negative")
			.optional(),
		availableFrom: z
			.string()
			.nullable()
			.optional()
			.refine(
				(val) =>
					val === null || val === undefined || !Number.isNaN(Date.parse(val)),
				{
					message: "Invalid date format for availableFrom",
				},
			),
		availableTo: z
			.string()
			.nullable()
			.optional()
			.refine(
				(val) =>
					val === null || val === undefined || !Number.isNaN(Date.parse(val)),
				{
					message: "Invalid date format for availableTo",
				},
			),
		isAvailable: z.boolean().optional(),
		description: z.string().trim().optional(),
	}),
});

const updateRoomAvailabilityZodSchema = z.object({
	body: z.object({
		availableFrom: z
			.string()
			.nullable()
			.optional()
			.refine(
				(val) =>
					val === null || val === undefined || !Number.isNaN(Date.parse(val)),
				{
					message: "Invalid date format for availableFrom",
				},
			),
		availableTo: z
			.string()
			.nullable()
			.optional()
			.refine(
				(val) =>
					val === null || val === undefined || !Number.isNaN(Date.parse(val)),
				{
					message: "Invalid date format for availableTo",
				},
			),
		isAvailable: z.boolean().optional(),
	}),
});

export const RoomValidation = {
	createRoomZodSchema,
	updateRoomZodSchema,
	updateRoomAvailabilityZodSchema,
};
