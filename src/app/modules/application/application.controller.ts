import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import type { TApplicationQueryFilters } from "./application.interface.js";
import { ApplicationService } from "./application.service.js";

const createApplication = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await ApplicationService.createApplication(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Application submitted successfully",
		data: result,
	});
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await ApplicationService.getAllApplications(
		userId,
		userRole,
		req.query as TApplicationQueryFilters,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applications retrieved successfully",
		data: result,
	});
});

const getMyApplications = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await ApplicationService.getMyApplications(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My applications retrieved successfully",
		data: result,
	});
});

const getApplicationsForProperty = catchAsync(
	async (req: Request, res: Response) => {
		const propertyId = req.params.propertyId as string;
		const userId = req.user?.id;
		const userRole = req.user?.role;

		if (!userId || !userRole) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not authorized! Token is missing or invalid.",
			);
		}

		const result = await ApplicationService.getApplicationsForProperty(
			propertyId,
			userId,
			userRole,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Property applications retrieved successfully",
			data: result,
		});
	},
);

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await ApplicationService.getApplicationById(
		id,
		userId,
		userRole,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Application details retrieved successfully",
		data: result,
	});
});

const updateApplicationStatus = catchAsync(
	async (req: Request, res: Response) => {
		const id = req.params.id as string;
		const userId = req.user?.id;
		const userRole = req.user?.role;

		if (!userId || !userRole) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not authorized! Token is missing or invalid.",
			);
		}

		const result = await ApplicationService.updateApplicationStatus(
			id,
			userId,
			userRole,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Application status updated successfully",
			data: result,
		});
	},
);

export const ApplicationController = {
	createApplication,
	getAllApplications,
	getMyApplications,
	getApplicationsForProperty,
	getApplicationById,
	updateApplicationStatus,
};
