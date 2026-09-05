import httpStatus from "http-status";
import {
	ApplicationStatus,
	type Prisma,
	type Role,
	Role as RoleEnum,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TApplicationQueryFilters,
	TCreateApplication,
	TUpdateApplicationStatus,
} from "./application.interface.js";

const createApplication = async (
	tenantId: string,
	payload: TCreateApplication,
) => {
	const room = await prisma.room.findFirst({
		where: {
			id: payload.roomId,
			deletedAt: null,
		},
	});

	if (!room) {
		throw new AppError(httpStatus.NOT_FOUND, "Room not found!");
	}

	if (!room.isAvailable) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Room is currently not available for application!",
		);
	}

	const existingApp = await prisma.application.findFirst({
		where: {
			tenantId,
			roomId: payload.roomId,
			status: { in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED] },
			deletedAt: null,
		},
	});

	if (existingApp) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You already have an active application for this room!",
		);
	}

	const newApplication = await prisma.application.create({
		data: {
			tenantId,
			roomId: payload.roomId,
			moveInDate: new Date(payload.moveInDate),
			moveOutDate: payload.moveOutDate ? new Date(payload.moveOutDate) : null,
			message: payload.message,
			status: ApplicationStatus.PENDING,
		},
		include: {
			room: {
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

	return newApplication;
};

const getAllApplications = async (
	userId: string,
	userRole: Role,
	query: TApplicationQueryFilters,
) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const { status, sortBy, sortOrder } = query;

	const whereConditions: Prisma.ApplicationWhereInput = {
		deletedAt: null,
	};

	if (userRole === RoleEnum.TENANT) {
		whereConditions.tenantId = userId;
	} else if (userRole === RoleEnum.OWNER) {
		whereConditions.room = {
			property: {
				ownerId: userId,
			},
		};
	}

	if (status) {
		whereConditions.status = status;
	}

	const allowedSortFields = ["createdAt", "moveInDate", "status"];
	const validSortBy =
		sortBy && allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
	const validSortOrder: "asc" | "desc" =
		sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

	const total = await prisma.application.count({
		where: whereConditions,
	});

	const items = await prisma.application.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: {
			[validSortBy]: validSortOrder,
		},
		include: {
			tenant: {
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
				},
			},
			room: {
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
			},
		},
	});

	return {
		items,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const getMyApplications = async (tenantId: string) => {
	const applications = await prisma.application.findMany({
		where: {
			tenantId,
			deletedAt: null,
		},
		orderBy: {
			createdAt: "desc",
		},
		include: {
			room: {
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
			},
		},
	});

	return applications;
};

const getApplicationsForProperty = async (
	propertyId: string,
	userId: string,
	userRole: Role,
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
			"Forbidden! You do not have permission to view applications for this property.",
		);
	}

	const applications = await prisma.application.findMany({
		where: {
			room: {
				propertyId,
			},
			deletedAt: null,
		},
		orderBy: {
			createdAt: "desc",
		},
		include: {
			tenant: {
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
				},
			},
			room: {
				select: {
					id: true,
					roomNumber: true,
					roomType: true,
					rentAmount: true,
				},
			},
		},
	});

	return applications;
};

const getApplicationById = async (
	id: string,
	userId: string,
	userRole: Role,
) => {
	const application = await prisma.application.findFirst({
		where: {
			id,
			deletedAt: null,
		},
		include: {
			tenant: {
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
					role: true,
				},
			},
			room: {
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
			},
		},
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	if (userRole === RoleEnum.ADMIN) {
		return application;
	}

	if (userRole === RoleEnum.TENANT && application.tenantId === userId) {
		return application;
	}

	if (
		userRole === RoleEnum.OWNER &&
		application.room.property.ownerId === userId
	) {
		return application;
	}

	throw new AppError(
		httpStatus.FORBIDDEN,
		"Forbidden! You do not have permission to view this application.",
	);
};

const updateApplicationStatus = async (
	id: string,
	userId: string,
	userRole: Role,
	payload: TUpdateApplicationStatus,
) => {
	const existingApp = await prisma.application.findFirst({
		where: {
			id,
			deletedAt: null,
		},
		include: {
			room: {
				include: {
					property: true,
				},
			},
		},
	});

	if (!existingApp) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found!");
	}

	const newStatus = payload.status;

	if (newStatus === ApplicationStatus.CANCELLED) {
		if (userRole !== RoleEnum.ADMIN && existingApp.tenantId !== userId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden! Only the tenant who applied can cancel this application.",
			);
		}

		if (
			existingApp.status === ApplicationStatus.CANCELLED ||
			existingApp.status === ApplicationStatus.REJECTED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Application is already ${existingApp.status.toLowerCase()}.`,
			);
		}
	} else if (
		newStatus === ApplicationStatus.APPROVED ||
		newStatus === ApplicationStatus.REJECTED
	) {
		if (
			userRole !== RoleEnum.ADMIN &&
			existingApp.room.property.ownerId !== userId
		) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden! Only property owners or admins can approve or reject applications.",
			);
		}

		if (existingApp.status !== ApplicationStatus.PENDING) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Only pending applications can be approved or rejected.",
			);
		}
	}

	const updatedApplication = await prisma.$transaction(async (tx) => {
		const appResult = await tx.application.update({
			where: { id },
			data: {
				status: newStatus,
			},
			include: {
				room: {
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

		return appResult;
	});

	return updatedApplication;
};

export const ApplicationService = {
	createApplication,
	getAllApplications,
	getMyApplications,
	getApplicationsForProperty,
	getApplicationById,
	updateApplicationStatus,
};
