import httpStatus from "http-status";
import { Role, ViewingStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TCreateViewingRequest,
	TUpdateViewingStatus,
} from "./viewing.interface.js";

const createViewingRequest = async (
	tenantId: string,
	propertyId: string,
	payload: TCreateViewingRequest,
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

	const viewingRequest = await prisma.viewingRequest.create({
		data: {
			propertyId,
			tenantId,
			scheduledAt: new Date(payload.scheduledAt),
			notes: payload.notes || null,
			status: ViewingStatus.PENDING,
		},
		include: {
			property: {
				select: {
					id: true,
					title: true,
					address: true,
					city: true,
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

	return viewingRequest;
};

const getAllViewingRequests = async (userId: string, userRole: Role) => {
	let whereCondition = {};

	if (userRole === Role.TENANT) {
		whereCondition = { tenantId: userId };
	} else if (userRole === Role.OWNER) {
		whereCondition = {
			property: {
				ownerId: userId,
			},
		};
	} else if (userRole === Role.ADMIN) {
		whereCondition = {};
	}

	const viewingRequests = await prisma.viewingRequest.findMany({
		where: whereCondition,
		orderBy: {
			createdAt: "desc",
		},
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

	return viewingRequests;
};

const updateViewingStatus = async (
	viewingRequestId: string,
	userId: string,
	userRole: Role,
	payload: TUpdateViewingStatus,
) => {
	const existingRequest = await prisma.viewingRequest.findUnique({
		where: { id: viewingRequestId },
		include: {
			property: true,
		},
	});

	if (!existingRequest) {
		throw new AppError(httpStatus.NOT_FOUND, "Viewing request not found!");
	}

	const isOwner = existingRequest.property.ownerId === userId;
	const isTenant = existingRequest.tenantId === userId;
	const isAdmin = userRole === Role.ADMIN;

	if (
		payload.status === ViewingStatus.CONFIRMED ||
		payload.status === ViewingStatus.COMPLETED
	) {
		if (!isOwner && !isAdmin) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden! Only property owners or admins can confirm or complete viewing requests.",
			);
		}
	} else if (payload.status === ViewingStatus.CANCELLED) {
		if (!isOwner && !isTenant && !isAdmin) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden! You do not have permission to cancel this viewing request.",
			);
		}
	}

	const updated = await prisma.viewingRequest.update({
		where: { id: viewingRequestId },
		data: {
			status: payload.status,
		},
		include: {
			property: {
				select: {
					id: true,
					title: true,
					address: true,
					city: true,
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

export const ViewingService = {
	createViewingRequest,
	getAllViewingRequests,
	updateViewingStatus,
};
