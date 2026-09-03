import type { Response } from "express";

export type TResponse<T> = {
	statusCode: number;
	success: boolean;
	message?: string;
	data?: T;
	token?: string;
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
	res.status(data.statusCode).json({
		success: data.success,
		message: data.message || "Operation successful",
		data: data.data,
		...(data.token && { token: data.token }),
	});
};
