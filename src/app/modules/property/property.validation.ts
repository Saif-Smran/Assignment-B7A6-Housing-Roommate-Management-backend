import { z } from "zod";

const propertyImageZodSchema = z.object({
	url: z.string().url("Invalid image URL"),
	isPrimary: z.boolean().optional(),
});

const createPropertyZodSchema = z.object({
	body: z.object({
		title: z
			.string()
			.trim()
			.min(2, "Title must be at least 2 characters long")
			.max(150, "Title cannot exceed 150 characters"),
		description: z.string().trim().optional(),
		address: z.string().trim().min(1, "Address is required"),
		city: z.string().trim().min(1, "City is required"),
		state: z.string().trim().optional(),
		country: z.string().trim().min(1, "Country is required"),
		zipCode: z.string().trim().optional(),
		propertyType: z.string().trim().min(1, "Property type is required"),
		amenities: z.array(z.string()).optional(),
		images: z.array(propertyImageZodSchema).optional(),
	}),
});

const updatePropertyZodSchema = z.object({
	body: z.object({
		title: z
			.string()
			.trim()
			.min(2, "Title must be at least 2 characters long")
			.max(150, "Title cannot exceed 150 characters")
			.optional(),
		description: z.string().trim().optional(),
		address: z.string().trim().optional(),
		city: z.string().trim().optional(),
		state: z.string().trim().optional(),
		country: z.string().trim().optional(),
		zipCode: z.string().trim().optional(),
		propertyType: z.string().trim().optional(),
		amenities: z.array(z.string()).optional(),
		images: z.array(propertyImageZodSchema).optional(),
	}),
});

export const PropertyValidation = {
	createPropertyZodSchema,
	updatePropertyZodSchema,
};
