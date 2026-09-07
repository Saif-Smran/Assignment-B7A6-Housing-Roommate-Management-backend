import type { Role } from "../../../generated/prisma/client.js";

export interface TUserQueryFilters {
	page?: string | number;
	limit?: string | number;
	role?: Role;
	searchTerm?: string;
	q?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface TAdminPropertyQueryFilters {
	page?: string | number;
	limit?: string | number;
	city?: string;
	propertyType?: string;
	isActive?: string | boolean;
	isDeleted?: string | boolean;
	searchTerm?: string;
	q?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface TAuditLogQueryFilters {
	page?: string | number;
	limit?: string | number;
	action?: string;
	targetType?: string;
	actorId?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}
