import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import type { Role } from "../../generated/prisma/client.js";
import config from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export type TJwtPayload = {
	id: string;
	email: string;
	role: Role;
	iat?: number;
	exp?: number;
};

declare global {
	namespace Express {
		interface Request {
			user?: TJwtPayload;
		}
	}
}

export const auth = (...requiredRoles: Role[]) => {
	return catchAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			const authHeader = req.headers.authorization;
			let token: string | undefined;

			if (authHeader?.startsWith("Bearer ")) {
				token = authHeader.split(" ")[1];
			} else if (req.cookies?.accessToken) {
				token = req.cookies.accessToken;
			}

			if (!token) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"You are not authorized! Token is missing.",
				);
			}

			let decoded: TJwtPayload;
			try {
				decoded = jwt.verify(token, config.jwt.secret) as TJwtPayload;
			} catch (_err) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"Invalid or expired access token!",
				);
			}

			const { id, role } = decoded;

			const user = await prisma.user.findUnique({
				where: { id },
			});

			if (!user) {
				throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
			}

			if (user.deletedAt) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"This user account has been deleted!",
				);
			}

			if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
				throw new AppError(
					httpStatus.FORBIDDEN,
					"Forbidden! You do not have access to this resource.",
				);
			}

			req.user = decoded;
			next();
		},
	);
};
