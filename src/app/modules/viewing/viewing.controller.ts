import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ViewingService } from "./viewing.service.js";

const createViewingRequest = catchAsync(async (req: Request, res: Response) => {
	const propertyId = req.params.id as string;
	const tenantId = req.user?.id;

	if (!tenantId) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await ViewingService.createViewingRequest(
		tenantId,
		propertyId,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Property viewing requested successfully",
		data: result,
	});
});

const getAllViewingRequests = catchAsync(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		const userRole = req.user?.role;

		if (!userId || !userRole) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not authorized! Token is missing or invalid.",
			);
		}

		const result = await ViewingService.getAllViewingRequests(userId, userRole);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Viewing requests retrieved successfully",
			data: result,
		});
	},
);

const updateViewingStatus = catchAsync(async (req: Request, res: Response) => {
	const viewingRequestId = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await ViewingService.updateViewingStatus(
		viewingRequestId,
		userId,
		userRole,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Viewing request status updated successfully",
		data: result,
	});
});

export const ViewingController = {
	createViewingRequest,
	getAllViewingRequests,
	updateViewingStatus,
};
