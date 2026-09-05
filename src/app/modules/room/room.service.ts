import httpStatus from "http-status";
import {
	type Role,
	Role as RoleEnum,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TCreateRoom,
	TUpdateRoom,
	TUpdateRoomAvailability,
} from "./room.interface.js";

const createRoom = async (
	propertyId: string,
	userId: string,
	userRole: Role,
	payload: TCreateRoom,
) => {
	const property = await prisma.property.findFirst({
		where: {
			id: propertyId,
			deletedAt: null,
		},
	});

	if (!property) {
		throw new AppError(httpStatus.NOT_FOUND, "Property not found!");
	}

	if (userRole !== RoleEnum.ADMIN && property.ownerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! You do not have permission to add room to this property.",
		);
	}

	const roomData = {
		...payload,
		propertyId,
		availableFrom: payload.availableFrom
			? new Date(payload.availableFrom)
			: undefined,
		availableTo: payload.availableTo
			? new Date(payload.availableTo)
			: undefined,
	};

	const newRoom = await prisma.room.create({
		data: roomData,
		include: {
			property: {
				select: {
					id: true,
					title: true,
					address: true,
					city: true,
					ownerId: true,
				},
			},
		},
	});

	return newRoom;
};

const getRoomsByProperty = async (propertyId: string) => {
	const property = await prisma.property.findFirst({
		where: {
			id: propertyId,
			deletedAt: null,
		},
	});

	if (!property) {
		throw new AppError(httpStatus.NOT_FOUND, "Property not found!");
	}

	const rooms = await prisma.room.findMany({
		where: {
			propertyId,
			deletedAt: null,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return rooms;
};

const getRoomById = async (roomId: string) => {
	const room = await prisma.room.findFirst({
		where: {
			id: roomId,
			deletedAt: null,
		},
		include: {
			property: {
				include: {
					owner: {
						select: {
							id: true,
							fullName: true,
							email: true,
							phone: true,
							role: true,
						},
					},
					images: true,
				},
			},
		},
	});

	if (!room) {
		throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
	}

	return room;
};

const updateRoom = async (
	roomId: string,
	userId: string,
	userRole: Role,
	payload: TUpdateRoom,
) => {
	const existingRoom = await prisma.room.findFirst({
		where: {
			id: roomId,
			deletedAt: null,
		},
		include: {
			property: true,
		},
	});

	if (!existingRoom) {
		throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
	}

	if (userRole !== RoleEnum.ADMIN && existingRoom.property.ownerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! You do not have permission to update this room.",
		);
	}

	const updateData: Record<string, unknown> = { ...payload };

	if (payload.availableFrom !== undefined) {
		updateData.availableFrom = payload.availableFrom
			? new Date(payload.availableFrom)
			: null;
	}

	if (payload.availableTo !== undefined) {
		updateData.availableTo = payload.availableTo
			? new Date(payload.availableTo)
			: null;
	}

	const updatedRoom = await prisma.room.update({
		where: { id: roomId },
		data: updateData,
		include: {
			property: {
				select: {
					id: true,
					title: true,
					ownerId: true,
				},
			},
		},
	});

	return updatedRoom;
};

const softDeleteRoom = async (
	roomId: string,
	userId: string,
	userRole: Role,
) => {
	const existingRoom = await prisma.room.findFirst({
		where: {
			id: roomId,
			deletedAt: null,
		},
		include: {
			property: true,
		},
	});

	if (!existingRoom) {
		throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
	}

	if (userRole !== RoleEnum.ADMIN && existingRoom.property.ownerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! You do not have permission to delete this room.",
		);
	}

	const deletedRoom = await prisma.room.update({
		where: { id: roomId },
		data: {
			deletedAt: new Date(),
			isAvailable: false,
		},
		select: {
			id: true,
			roomNumber: true,
			isAvailable: true,
			deletedAt: true,
		},
	});

	return deletedRoom;
};

const updateRoomAvailability = async (
	roomId: string,
	userId: string,
	userRole: Role,
	payload: TUpdateRoomAvailability,
) => {
	const existingRoom = await prisma.room.findFirst({
		where: {
			id: roomId,
			deletedAt: null,
		},
		include: {
			property: true,
		},
	});

	if (!existingRoom) {
		throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
	}

	if (userRole !== RoleEnum.ADMIN && existingRoom.property.ownerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! You do not have permission to update availability for this room.",
		);
	}

	const updateData: Record<string, unknown> = {};

	if (payload.availableFrom !== undefined) {
		updateData.availableFrom = payload.availableFrom
			? new Date(payload.availableFrom)
			: null;
	}

	if (payload.availableTo !== undefined) {
		updateData.availableTo = payload.availableTo
			? new Date(payload.availableTo)
			: null;
	}

	if (payload.isAvailable !== undefined) {
		updateData.isAvailable = payload.isAvailable;
	}

	const updatedRoom = await prisma.room.update({
		where: { id: roomId },
		data: updateData,
		include: {
			property: {
				select: {
					id: true,
					title: true,
					ownerId: true,
				},
			},
		},
	});

	return updatedRoom;
};

export const RoomService = {
	createRoom,
	getRoomsByProperty,
	getRoomById,
	updateRoom,
	softDeleteRoom,
	updateRoomAvailability,
};
