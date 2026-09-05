import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { RoomService } from "./room.service.js";

const createRoom = catchAsync(async (req: Request, res: Response) => {
	const propertyId = req.params.propertyId as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await RoomService.createRoom(
		propertyId,
		userId,
		userRole,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Room created successfully",
		data: result,
	});
});

const getRoomsByProperty = catchAsync(async (req: Request, res: Response) => {
	const propertyId = req.params.propertyId as string;

	const result = await RoomService.getRoomsByProperty(propertyId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Rooms retrieved successfully",
		data: result,
	});
});

const getRoomById = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;

	const result = await RoomService.getRoomById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Room details retrieved successfully",
		data: result,
	});
});

const updateRoom = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await RoomService.updateRoom(id, userId, userRole, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Room updated successfully",
		data: result,
	});
});

const softDeleteRoom = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const userId = req.user?.id;
	const userRole = req.user?.role;

	if (!userId || !userRole) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"You are not authorized! Token is missing or invalid.",
		);
	}

	const result = await RoomService.softDeleteRoom(id, userId, userRole);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Room deleted successfully",
		data: result,
	});
});

const updateRoomAvailability = catchAsync(
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

		const result = await RoomService.updateRoomAvailability(
			id,
			userId,
			userRole,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Room availability updated successfully",
			data: result,
		});
	},
);

export const RoomController = {
	createRoom,
	getRoomsByProperty,
	getRoomById,
	updateRoom,
	softDeleteRoom,
	updateRoomAvailability,
};
