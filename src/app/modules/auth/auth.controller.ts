import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config/index.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";

const register = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.registerUser(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "User registered successfully",
		data: result,
	});
});

const login = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.loginUser(req.body);

	const { refreshToken, accessToken, user } = result;

	res.cookie("refreshToken", refreshToken, {
		secure: config.node_env === "production",
		httpOnly: true,
		sameSite: config.node_env === "production" ? "none" : "lax",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
			user,
		},
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const token =
		req.cookies?.refreshToken ||
		req.body?.refreshToken ||
		(req.headers.authorization?.startsWith("Bearer ")
			? req.headers.authorization.split(" ")[1]
			: undefined);

	if (!token) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required!");
	}

	const result = await AuthService.refreshToken(token);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Access token regenerated successfully",
		data: result,
	});
});

const logout = catchAsync(async (_req: Request, res: Response) => {
	res.clearCookie("refreshToken", {
		secure: config.node_env === "production",
		httpOnly: true,
		sameSite: config.node_env === "production" ? "none" : "lax",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged out successfully",
		data: null,
	});
});

export const AuthController = {
	register,
	login,
	refreshToken,
	logout,
};
