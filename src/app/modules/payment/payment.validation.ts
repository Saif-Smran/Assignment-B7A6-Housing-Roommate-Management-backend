import { z } from "zod";
import { PaymentType } from "../../../generated/prisma/client.js";

const initiatePaymentZodSchema = z.object({
	body: z.object({
		applicationId: z.string().optional(),
		amount: z
			.number({
				message: "Amount is required and must be a number",
			})
			.positive({ message: "Amount must be a positive number" }),
		paymentType: z.nativeEnum(PaymentType, {
			message: "Payment type is required (RENT, DEPOSIT, UTILITY)",
		}),
		description: z.string().optional(),
		successUrl: z.string().url().optional(),
		cancelUrl: z.string().url().optional(),
	}),
});

export const PaymentValidation = {
	initiatePaymentZodSchema,
};
