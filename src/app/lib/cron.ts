import type { Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentStatus } from "../../generated/prisma/client.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { prisma } from "./prisma.js";

export const executeCronTasks = async () => {
	const now = new Date();

	// Clean up stale pending payments older than 24 hours
	const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const expiredPayments = await prisma.payment.updateMany({
		where: {
			status: PaymentStatus.PENDING,
			createdAt: {
				lt: twentyFourHoursAgo,
			},
		},
		data: {
			status: PaymentStatus.FAILED,
		},
	});

	return {
		executedAt: now.toISOString(),
		cleanedPendingPayments: expiredPayments.count,
	};
};

export const handleCronJob = catchAsync(async (req: Request, res: Response) => {
	const authHeader = req.headers.authorization;
	const cronSecret = process.env.CRON_SECRET;
	const isVercelCron = req.headers["x-vercel-cron"] === "1";

	if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
		res.status(httpStatus.UNAUTHORIZED).json({
			success: false,
			message: "Unauthorized cron execution request",
		});
		return;
	}

	const result = await executeCronTasks();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Vercel cron job executed successfully",
		data: result,
	});
});
