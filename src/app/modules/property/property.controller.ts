import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import type { TPropertyQueryFilters } from "./property.interface.js";
import { PropertyService } from "./property.service.js";

const createProperty = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await PropertyService.createProperty(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Property created successfully",
		data: result,
	});
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
	const result = await PropertyService.getAllProperties(
		req.query as TPropertyQueryFilters,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Properties retrieved successfully",
		data: result,
	});
});

const searchProperties = catchAsync(async (req: Request, res: Response) => {
	const searchTerm = (req.query.q as string) || "";

	const result = await PropertyService.searchProperties(searchTerm);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Properties search results retrieved successfully",
		data: result,
	});
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;

	const result = await PropertyService.getPropertyById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Property details retrieved successfully",
		data: result,
	});
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await PropertyService.updateProperty(
		id,
		userId,
		userRole,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Property updated successfully",
		data: result,
	});
});

const softDeleteProperty = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await PropertyService.softDeleteProperty(id, userId, userRole);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Property deleted successfully",
		data: result,
	});
});

export const PropertyController = {
	createProperty,
	getAllProperties,
	searchProperties,
	getPropertyById,
	updateProperty,
	softDeleteProperty,
};
