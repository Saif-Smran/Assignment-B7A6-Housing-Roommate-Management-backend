import type { Role, AuthProvider } from "../../../generated/prisma/client.js";

export type TRegisterUser = {
	fullName: string;
	email: string;
	password: string;
	phone?: string;
	role?: Role;
};

export type TLoginUser = {
	email: string;
	password: string;
};

export type TGoogleLoginUser = {
	idToken?: string;
	credential?: string;
	accessToken?: string;
	code?: string;
	role?: Role;
};

export type TRefreshToken = {
	refreshToken?: string;
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

export type TLoginResponse = {
	accessToken: string;
	refreshToken: string;
	user: TSanitizedUser;
};
