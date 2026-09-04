import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TChangeRole,
	TPublicUser,
	TSanitizedUser,
	TUpdateProfile,
} from "./user.interface.js";

const getOwnProfile = async (userId: string): Promise<TSanitizedUser> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
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

	if (!user || user.deletedAt) {
		throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
	}

	const { deletedAt: _, ...sanitizedUser } = user;
	return sanitizedUser;
};

const updateOwnProfile = async (
	userId: string,
	payload: TUpdateProfile,
): Promise<TSanitizedUser> => {
	const existingUser = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!existingUser || existingUser.deletedAt) {
		throw new AppError(httpStatus.NOT_FOUND, "User profile not found!");
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			...(payload.fullName && { fullName: payload.fullName }),
			...(payload.phone !== undefined && { phone: payload.phone }),
		},
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

const getUserById = async (userId: string): Promise<TPublicUser> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			fullName: true,
			role: true,
			createdAt: true,
			deletedAt: true,
		},
	});

	if (!user || user.deletedAt) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	const { deletedAt: _, ...publicUser } = user;
	return publicUser;
};

const changeUserRole = async (
	userId: string,
	payload: TChangeRole,
): Promise<TSanitizedUser> => {
	const existingUser = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!existingUser || existingUser.deletedAt) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found!");
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			role: payload.role,
		},
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

export const UserService = {
	getOwnProfile,
	updateOwnProfile,
	getUserById,
	changeUserRole,
};
