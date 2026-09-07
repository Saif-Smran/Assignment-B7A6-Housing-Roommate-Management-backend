import type { Request, Response } from "express";
import httpStatus from "http-status";
import type { Role } from "../../../generated/prisma/client.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import type {
	TAdminPropertyQueryFilters,
	TUserQueryFilters,
} from "./admin.interface.js";
import { AdminService } from "./admin.service.js";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminService.getAllUsers(req.query as TUserQueryFilters);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users retrieved successfully",
		data: result,
	});
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;
	const { role } = req.body as { role: Role };

	const result = await AdminService.updateUserRole(id, role);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User role updated successfully",
		data: result,
	});
});

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
	const result = await AdminService.getDashboardStats();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dashboard statistics retrieved successfully",
		data: result,
	});
});

const getAllPropertiesAdmin = catchAsync(
	async (req: Request, res: Response) => {
		const result = await AdminService.getAllPropertiesAdmin(
			req.query as TAdminPropertyQueryFilters,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Admin properties retrieved successfully",
			data: result,
		});
	},
);

const hardDeleteProperty = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id as string;

	const result = await AdminService.hardDeleteProperty(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Property hard-deleted successfully",
		data: result,
	});
});

export const AdminController = {
	getAllUsers,
	updateUserRole,
	getDashboardStats,
	getAllPropertiesAdmin,
	hardDeleteProperty,
};
