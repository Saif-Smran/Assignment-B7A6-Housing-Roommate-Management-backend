import type { ApplicationStatus } from "../../../generated/prisma/client.js";

export type TCreateApplication = {
	roomId: string;
	moveInDate: string;
	moveOutDate?: string;
	message?: string;
};

export type TUpdateApplicationStatus = {
	status: ApplicationStatus;
};

export type TApplicationQueryFilters = {
	status?: ApplicationStatus;
	page?: string | number;
	limit?: string | number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};
