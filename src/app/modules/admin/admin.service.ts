import httpStatus from "http-status";
import { type Prisma, Role } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TAdminPropertyQueryFilters,
	TUserQueryFilters,
} from "./admin.interface.js";

const getAllUsers = async (query: TUserQueryFilters) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
	const skip = (page - 1) * limit;

	const { role, searchTerm, q, sortBy, sortOrder } = query;
	const search = searchTerm || q;

	const whereConditions: Prisma.UserWhereInput = {};

	if (role) {
		whereConditions.role = role;
	}

	if (search) {
		whereConditions.OR = [
			{ fullName: { contains: search, mode: "insensitive" } },
			{ email: { contains: search, mode: "insensitive" } },
			{ phone: { contains: search, mode: "insensitive" } },
		];
	}

	const allowedSortFields = ["createdAt", "fullName", "email", "role"];
	const validSortBy =
		sortBy && allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
	const validSortOrder: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

	const total = await prisma.user.count({ where: whereConditions });

	const users = await prisma.user.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: { [validSortBy]: validSortOrder },
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			role: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
	});

	const totalPages = Math.ceil(total / limit);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages,
		},
		data: users,
	};
};

const updateUserRole = async (userId: string, role: Role) => {
	const existingUser = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!existingUser) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: { role },
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			role: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return updatedUser;
};

const getDashboardStats = async () => {
	const [
		totalUsers,
		tenantCount,
		ownerCount,
		adminCount,
		totalProperties,
		activeProperties,
		totalRooms,
		availableRooms,
		totalApplications,
		pendingApplications,
		approvedApplications,
		rejectedApplications,
		totalPaymentsCount,
		completedPayments,
		pendingPayments,
		failedPayments,
		revenueAggregate,
	] = await Promise.all([
		prisma.user.count({ where: { deletedAt: null } }),
		prisma.user.count({ where: { role: Role.TENANT, deletedAt: null } }),
		prisma.user.count({ where: { role: Role.OWNER, deletedAt: null } }),
		prisma.user.count({ where: { role: Role.ADMIN, deletedAt: null } }),
		prisma.property.count({ where: { deletedAt: null } }),
		prisma.property.count({ where: { isActive: true, deletedAt: null } }),
		prisma.room.count({ where: { deletedAt: null } }),
		prisma.room.count({ where: { isAvailable: true, deletedAt: null } }),
		prisma.application.count(),
		prisma.application.count({ where: { status: "PENDING" } }),
		prisma.application.count({ where: { status: "APPROVED" } }),
		prisma.application.count({ where: { status: "REJECTED" } }),
		prisma.payment.count(),
		prisma.payment.count({ where: { status: "COMPLETED" } }),
		prisma.payment.count({ where: { status: "PENDING" } }),
		prisma.payment.count({ where: { status: "FAILED" } }),
		prisma.payment.aggregate({
			_sum: { amount: true },
			where: { status: "COMPLETED" },
		}),
	]);

	const totalRevenue = revenueAggregate._sum.amount || 0;

	return {
		users: {
			total: totalUsers,
			tenants: tenantCount,
			owners: ownerCount,
			admins: adminCount,
		},
		properties: {
			total: totalProperties,
			active: activeProperties,
			inactive: totalProperties - activeProperties,
		},
		rooms: {
			total: totalRooms,
			available: availableRooms,
			occupied: totalRooms - availableRooms,
		},
		applications: {
			total: totalApplications,
			pending: pendingApplications,
			approved: approvedApplications,
			rejected: rejectedApplications,
		},
		payments: {
			totalCount: totalPaymentsCount,
			completedCount: completedPayments,
			pendingCount: pendingPayments,
			failedCount: failedPayments,
			totalRevenue,
		},
	};
};

const getAllPropertiesAdmin = async (query: TAdminPropertyQueryFilters) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
	const skip = (page - 1) * limit;

	const { city, propertyType, isActive, isDeleted, searchTerm, q, sortBy, sortOrder } = query;
	const search = searchTerm || q;

	const whereConditions: Prisma.PropertyWhereInput = {};

	if (isActive !== undefined) {
		whereConditions.isActive = isActive === "true" || isActive === true;
	}

	if (isDeleted === "true" || isDeleted === true) {
		whereConditions.deletedAt = { not: null };
	} else if (isDeleted === "false" || isDeleted === false) {
		whereConditions.deletedAt = null;
	}

	if (city) {
		whereConditions.city = { contains: city, mode: "insensitive" };
	}

	if (propertyType) {
		whereConditions.propertyType = { equals: propertyType, mode: "insensitive" };
	}

	if (search) {
		whereConditions.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{ address: { contains: search, mode: "insensitive" } },
			{ city: { contains: search, mode: "insensitive" } },
		];
	}

	const allowedSortFields = ["createdAt", "title", "city", "propertyType"];
	const validSortBy =
		sortBy && allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
	const validSortOrder: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

	const total = await prisma.property.count({ where: whereConditions });

	const properties = await prisma.property.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: { [validSortBy]: validSortOrder },
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
			rooms: true,
		},
	});

	const totalPages = Math.ceil(total / limit);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages,
		},
		data: properties,
	};
};

const hardDeleteProperty = async (propertyId: string) => {
	const existingProperty = await prisma.property.findUnique({
		where: { id: propertyId },
	});

	if (!existingProperty) {
		throw new AppError(httpStatus.NOT_FOUND, "Property not found");
	}

	return await prisma.$transaction(async (tx) => {
		const rooms = await tx.room.findMany({
			where: { propertyId },
			select: { id: true },
		});
		const roomIds = rooms.map((r) => r.id);

		if (roomIds.length > 0) {
			await tx.maintenanceRequest.deleteMany({
				where: { roomId: { in: roomIds } },
			});
			await tx.payment.deleteMany({
				where: { application: { roomId: { in: roomIds } } },
			});
			await tx.application.deleteMany({
				where: { roomId: { in: roomIds } },
			});
			await tx.utilitySplit.deleteMany({
				where: { bill: { propertyId } },
			});
			await tx.utilityBill.deleteMany({
				where: { propertyId },
			});
			await tx.room.deleteMany({
				where: { propertyId },
			});
		}

		await tx.viewingRequest.deleteMany({
			where: { propertyId },
		});
		await tx.propertyImage.deleteMany({
			where: { propertyId },
		});

		return await tx.property.delete({
			where: { id: propertyId },
		});
	});
};

export const AdminService = {
	getAllUsers,
	updateUserRole,
	getDashboardStats,
	getAllPropertiesAdmin,
	hardDeleteProperty,
};
