import type { ViewingStatus } from "../../../generated/prisma/client.js";

export type TCreateViewingRequest = {
	scheduledAt: string | Date;
	notes?: string;
};

export type TUpdateViewingStatus = {
	status: ViewingStatus;
};
