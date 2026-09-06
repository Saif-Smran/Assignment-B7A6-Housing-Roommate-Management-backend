import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { MaintenanceService } from "./maintenance.service.js";

const createMaintenance = catchAsync(async (req: Request, res: Response) => {
	const roomId = req.params.id as string;
	const tenantId = req.user?.id;

	if (!tenantId) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await MaintenanceService.createMaintenance(
		tenantId,
		roomId,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Maintenance request submitted successfully",
		data: result,
	});
});

const getAllMaintenanceRequests = catchAsync(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		const userRole = req.user?.role;

		if (!userId || !userRole) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not authorized! Token is missing or invalid.",
			);
		}

		const result = await MaintenanceService.getAllMaintenanceRequests(
			userId,
			userRole,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Maintenance requests retrieved successfully",
			data: result,
		});
	},
);

const updateMaintenanceStatus = catchAsync(
	async (req: Request, res: Response) => {
		const maintenanceId = req.params.id as string;
		const userId = req.user?.id;
		const userRole = req.user?.role;

		if (!userId || !userRole) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not authorized! Token is missing or invalid.",
			);
		}

		const result = await MaintenanceService.updateMaintenanceStatus(
			maintenanceId,
			userId,
			userRole,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Maintenance request status updated successfully",
			data: result,
		});
	},
);

export const MaintenanceController = {
	createMaintenance,
	getAllMaintenanceRequests,
	updateMaintenanceStatus,
};
