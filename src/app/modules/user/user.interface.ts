import type { Role } from "../../../generated/prisma/client.js";

export type TUpdateProfile = {
	fullName?: string;
	phone?: string;
};

export type TChangeRole = {
	role: Role;
};

export type TSanitizedUser = {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	role: Role;
	createdAt: Date;
	updatedAt: Date;
};

export type TPublicUser = {
	id: string;
	fullName: string;
	role: Role;
	createdAt: Date;
};
