import httpStatus from "http-status";
import { type Prisma, Role } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TCreateProperty,
	TPropertyQueryFilters,
	TUpdateProperty,
} from "./property.interface.js";

const createProperty = async (ownerId: string, payload: TCreateProperty) => {
	const { images, ...propertyData } = payload;

	const newProperty = await prisma.property.create({
		data: {
			...propertyData,
			ownerId,
			...(images && images.length > 0
				? {
						images: {
							create: images.map((img) => ({
								url: img.url,
								isPrimary: img.isPrimary || false,
							})),
						},
					}
				: {}),
		},
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
			rooms: {
				where: { deletedAt: null },
			},
		},
	});

	return newProperty;
};

const getAllProperties = async (query: TPropertyQueryFilters) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;

	const { city, propertyType, minRent, maxRent, sortBy, sortOrder } = query;

	const whereConditions: Prisma.PropertyWhereInput = {
		deletedAt: null,
		isActive: true,
	};

	if (city) {
		whereConditions.city = {
			contains: city,
			mode: "insensitive",
		};
	}

	if (propertyType) {
		whereConditions.propertyType = {
			equals: propertyType,
			mode: "insensitive",
		};
	}

	if (minRent !== undefined || maxRent !== undefined) {
		whereConditions.rooms = {
			some: {
				deletedAt: null,
				rentAmount: {
					...(minRent !== undefined ? { gte: Number(minRent) } : {}),
					...(maxRent !== undefined ? { lte: Number(maxRent) } : {}),
				},
			},
		};
	}

	const allowedSortFields = ["createdAt", "title", "city", "propertyType"];
	const validSortBy =
		sortBy && allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
	const validSortOrder: "asc" | "desc" =
		sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

	const total = await prisma.property.count({
		where: whereConditions,
	});

	const items = await prisma.property.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: {
			[validSortBy]: validSortOrder,
		},
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
			rooms: {
				where: { deletedAt: null },
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

const searchProperties = async (searchTerm: string) => {
	if (!searchTerm || searchTerm.trim() === "") {
		return [];
	}

	const term = searchTerm.trim();

	const properties = await prisma.property.findMany({
		where: {
			deletedAt: null,
			isActive: true,
			OR: [
				{ title: { contains: term, mode: "insensitive" } },
				{ description: { contains: term, mode: "insensitive" } },
				{ address: { contains: term, mode: "insensitive" } },
				{ city: { contains: term, mode: "insensitive" } },
			],
		},
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
			rooms: {
				where: { deletedAt: null },
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return properties;
};

const getPropertyById = async (propertyId: string) => {
	const property = await prisma.property.findFirst({
		where: {
			id: propertyId,
			deletedAt: null,
		},
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
			rooms: {
				where: { deletedAt: null },
			},
		},
	});

	if (!property) {
		throw new AppError(httpStatus.NOT_FOUND, "Property not found!");
	}

	return property;
};

const updateProperty = async (
	propertyId: string,
	userId: string,
	userRole: Role,
	payload: TUpdateProperty,
) => {
	const existingProperty = await prisma.property.findFirst({
		where: {
			id: propertyId,
			deletedAt: null,
		},
	});

	if (!existingProperty) {
		throw new AppError(httpStatus.NOT_FOUND, "Property not found!");
	}

	if (userRole !== Role.ADMIN && existingProperty.ownerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! You do not have permission to update this property.",
		);
	}

	const { images, ...updateData } = payload;

	const updatedProperty = await prisma.property.update({
		where: { id: propertyId },
		data: {
			...updateData,
			...(images && images.length > 0
				? {
						images: {
							deleteMany: {},
							create: images.map((img) => ({
								url: img.url,
								isPrimary: img.isPrimary || false,
							})),
						},
					}
				: {}),
		},
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
			rooms: {
				where: { deletedAt: null },
			},
		},
	});

	return updatedProperty;
};

const softDeleteProperty = async (
	propertyId: string,
	userId: string,
	userRole: Role,
) => {
	const existingProperty = await prisma.property.findFirst({
		where: {
			id: propertyId,
			deletedAt: null,
		},
	});

	if (!existingProperty) {
		throw new AppError(httpStatus.NOT_FOUND, "Property not found!");
	}

	if (userRole !== Role.ADMIN && existingProperty.ownerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden! You do not have permission to delete this property.",
		);
	}

	const deletedProperty = await prisma.property.update({
		where: { id: propertyId },
		data: {
			deletedAt: new Date(),
			isActive: false,
		},
		select: {
			id: true,
			title: true,
			deletedAt: true,
			isActive: true,
		},
	});

	return deletedProperty;
};

export const PropertyService = {
	createProperty,
	getAllProperties,
	searchProperties,
	getPropertyById,
	updateProperty,
	softDeleteProperty,
};
