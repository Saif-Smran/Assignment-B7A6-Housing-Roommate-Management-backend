import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import type { TPaymentQueryFilters } from "./payment.interface.js";
import { PaymentService } from "./payment.service.js";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await PaymentService.initiatePayment(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Payment initiated successfully",
		data: result,
	});
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await PaymentService.getPaymentById(id, userId, userRole);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment details retrieved successfully",
		data: result,
	});
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
	const signature = req.headers["stripe-signature"] as string | undefined;

	const result = await PaymentService.handleWebhook(req.body, signature);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Webhook processed successfully",
		data: result,
	});
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await PaymentService.getMyPayments(
		userId,
		userRole,
		req.query as TPaymentQueryFilters,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payments retrieved successfully",
		data: result,
	});
});

export const PaymentController = {
	initiatePayment,
	getPaymentById,
	handleWebhook,
	getMyPayments,
};
