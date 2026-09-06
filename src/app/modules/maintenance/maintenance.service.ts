import httpStatus from "http-status";
import {
	ApplicationStatus,
	MaintenanceStatus,
	Priority,
	Role,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TCreateMaintenanceRequest,
	TUpdateMaintenanceStatus,
} from "./maintenance.interface.js";

const createMaintenance = async (
	tenantId: string,
	roomId: string,
	payload: TCreateMaintenanceRequest,
) => {
	const room = await prisma.room.findFirst({
		where: {
			id: roomId,
			deletedAt: null,
		},
	});

	if (!room) {
		throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
	}

	const approvedApplication = await prisma.application.findFirst({
		where: {
			roomId,
			tenantId,
			status: ApplicationStatus.APPROVED,
			deletedAt: null,
		},
	});

	if (!approvedApplication) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! Only tenants with an approved booking for this room can submit maintenance requests.",
		);
	}

	const maintenanceRequest = await prisma.maintenanceRequest.create({
		data: {
			roomId,
			tenantId,
			title: payload.title,
			description: payload.description,
			priority: payload.priority || Priority.MEDIUM,
			status: MaintenanceStatus.SUBMITTED,
		},
		include: {
			room: {
				select: {
					id: true,
					roomNumber: true,
					roomType: true,
					propertyId: true,
				},
			},
			tenant: {
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
				},
			},
		},
	});

	return maintenanceRequest;
};

const getAllMaintenanceRequests = async (userId: string, userRole: Role) => {
	let whereCondition = {};

	if (userRole === Role.TENANT) {
		whereCondition = { tenantId: userId };
	} else if (userRole === Role.OWNER) {
		whereCondition = {
			room: {
				property: {
					ownerId: userId,
				},
			},
		};
	} else if (userRole === Role.ADMIN) {
		whereCondition = {};
	}

	const maintenanceRequests = await prisma.maintenanceRequest.findMany({
		where: whereCondition,
		orderBy: {
			createdAt: "desc",
		},
		include: {
			room: {
				select: {
					id: true,
					roomNumber: true,
					roomType: true,
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
			},
			tenant: {
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
				},
			},
		},
	});

	return maintenanceRequests;
};

const updateMaintenanceStatus = async (
	maintenanceId: string,
	userId: string,
	userRole: Role,
	payload: TUpdateMaintenanceStatus,
) => {
	const existing = await prisma.maintenanceRequest.findUnique({
		where: { id: maintenanceId },
		include: {
			room: {
				include: {
					property: true,
				},
			},
		},
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Maintenance request not found!");
	}

	const isOwner = existing.room.property.ownerId === userId;
	const isAdmin = userRole === Role.ADMIN;

	if (!isOwner && !isAdmin) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! Only room owners or admins can update maintenance request status.",
		);
	}

	const resolvedAt =
		payload.status === MaintenanceStatus.RESOLVED ? new Date() : undefined;

	const updated = await prisma.maintenanceRequest.update({
		where: { id: maintenanceId },
		data: {
			status: payload.status,
			...(payload.assignedTo !== undefined && {
				assignedTo: payload.assignedTo,
			}),
			...(resolvedAt && { resolvedAt }),
		},
		include: {
			room: {
				select: {
					id: true,
					roomNumber: true,
					roomType: true,
					propertyId: true,
				},
			},
			tenant: {
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
				},
			},
		},
	});

	return updated;
};

export const MaintenanceService = {
	createMaintenance,
	getAllMaintenanceRequests,
	updateMaintenanceStatus,
};
