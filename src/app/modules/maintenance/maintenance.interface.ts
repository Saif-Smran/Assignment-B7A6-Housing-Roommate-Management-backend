import type {
	MaintenanceStatus,
	Priority,
} from "../../../generated/prisma/client.js";

export type TCreateMaintenanceRequest = {
	title: string;
	description: string;
	priority?: Priority;
};

export type TUpdateMaintenanceStatus = {
	status: MaintenanceStatus;
	assignedTo?: string;
};
