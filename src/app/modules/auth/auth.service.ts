import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { Role } from "../../../generated/prisma/client.js";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";

import { AppError } from "../../utils/AppError.js";
import type {
	TLoginResponse,
	TLoginUser,
	TRegisterUser,
	TSanitizedUser,
} from "./auth.interface.js";

const registerUser = async (payload: TRegisterUser): Promise<TSanitizedUser> => {
	const existingUser = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (existingUser) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"User with this email already exists!",
		);
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_rounds),
	);

	const newUser = await prisma.user.create({
		data: {
			fullName: payload.fullName,
			email: payload.email,
			passwordHash: hashedPassword,
			phone: payload.phone || null,
			role: payload.role || Role.TENANT,
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

	return newUser;
};

const loginUser = async (payload: TLoginUser): Promise<TLoginResponse> => {
	const user = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (!user) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid email or password!",
		);
	}

	if (user.deletedAt) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"This account has been deleted!",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		payload.password,
		user.passwordHash,
	);

	if (!isPasswordMatched) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid email or password!",
		);
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwt.sign(jwtPayload, config.jwt.secret, {
		expiresIn: config.jwt.expires_in as jwt.SignOptions["expiresIn"],
	});

	const refreshToken = jwt.sign(jwtPayload, config.jwt.refresh_secret, {
		expiresIn: config.jwt.refresh_expires_in as jwt.SignOptions["expiresIn"],
	});

	const sanitizedUser: TSanitizedUser = {
		id: user.id,
		fullName: user.fullName,
		email: user.email,
		phone: user.phone,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	return {
		accessToken,
		refreshToken,
		user: sanitizedUser,
	};
};

const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
	let decoded: { id: string; email: string; role: Role };

	try {
		decoded = jwt.verify(
			token,
			config.jwt.refresh_secret,
		) as { id: string; email: string; role: Role };
	} catch (_err) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid or expired refresh token!",
		);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: decoded.id,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
	}

	if (user.deletedAt) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"This user account has been deleted!",
		);
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	const newAccessToken = jwt.sign(jwtPayload, config.jwt.secret, {
		expiresIn: config.jwt.expires_in as jwt.SignOptions["expiresIn"],
	});

	return {
		accessToken: newAccessToken,
	};
};

export const AuthService = {
	registerUser,
	loginUser,
	refreshToken,
};
