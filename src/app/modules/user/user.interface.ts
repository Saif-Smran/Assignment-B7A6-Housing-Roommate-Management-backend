import type { Role, AuthProvider } from "../../../generated/prisma/client.js";

export type TUpdateProfile = {
	fullName?: string;
	phone?: string;
	profileImage?: string;
};

export type TChangeRole = {
	role: Role;
};

export type TSanitizedUser = {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	googleId?: string | null;
	profileImage?: string | null;
	provider?: AuthProvider;
	role: Role;
	createdAt: Date;
	updatedAt: Date;
};

export type TPublicUser = {
	id: string;
	fullName: string;
	profileImage?: string | null;
	role: Role;
	createdAt: Date;
};
