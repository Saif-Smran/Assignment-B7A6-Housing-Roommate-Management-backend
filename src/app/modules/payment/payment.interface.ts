import type { PaymentStatus, PaymentType } from "../../../generated/prisma/client.js";

export interface TInitiatePaymentInput {
	applicationId?: string;
	amount: number;
	paymentType: PaymentType;
	description?: string;
	successUrl?: string;
	cancelUrl?: string;
}

export interface TPaymentQueryFilters {
	page?: string | number;
	limit?: string | number;
	status?: PaymentStatus;
	paymentType?: PaymentType;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}
