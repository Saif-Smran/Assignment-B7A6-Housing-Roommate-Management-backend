import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { AuthProvider, Role } from "../../../generated/prisma/client.js";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	TGoogleLoginUser,
	TLoginResponse,
	TLoginUser,
	TRegisterUser,
	TSanitizedUser,
} from "./auth.interface.js";

const googleClient = new OAuth2Client(
	config.google.client_id,
	config.google.client_secret,
);

const registerUser = async (
	payload: TRegisterUser,
): Promise<TSanitizedUser> => {
	const existingUser = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (existingUser) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"User with this email already exists!",
		);
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_rounds),
	);

	const newUser = await prisma.user.create({
		data: {
			fullName: payload.fullName,
			email: payload.email,
			passwordHash: hashedPassword,
			phone: payload.phone || null,
			provider: AuthProvider.CREDENTIAL,
			role: payload.role || Role.TENANT,
		},
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			googleId: true,
			profileImage: true,
			provider: true,
			role: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return newUser;
};

const loginUser = async (payload: TLoginUser): Promise<TLoginResponse> => {
	const user = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password!");
	}

	if (user.deletedAt) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"This account has been deleted!",
		);
	}

	if (!user.passwordHash) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This account was created with Google Sign-In. Please log in using Google.",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		payload.password,
		user.passwordHash,
	);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password!");
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwt.sign(jwtPayload, config.jwt.secret, {
		expiresIn: config.jwt.expires_in as jwt.SignOptions["expiresIn"],
	});

	const refreshToken = jwt.sign(jwtPayload, config.jwt.refresh_secret, {
		expiresIn: config.jwt.refresh_expires_in as jwt.SignOptions["expiresIn"],
	});

	const sanitizedUser: TSanitizedUser = {
		id: user.id,
		fullName: user.fullName,
		email: user.email,
		phone: user.phone,
		googleId: user.googleId,
		profileImage: user.profileImage,
		provider: user.provider,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	return {
		accessToken,
		refreshToken,
		user: sanitizedUser,
	};
};

const googleLogin = async (
	payload: TGoogleLoginUser,
): Promise<TLoginResponse> => {
	let email: string | undefined;
	let fullName: string | undefined;
	let googleId: string | undefined;
	let profileImage: string | undefined;

	const token = payload.idToken || payload.credential;

	if (token) {
		try {
			const ticket = await googleClient.verifyIdToken({
				idToken: token,
				audience: config.google.client_id,
			});
			const payloadData = ticket.getPayload();
			if (payloadData && payloadData.email) {
				email = payloadData.email;
				fullName =
					payloadData.name || payloadData.given_name || email.split("@")[0];
				googleId = payloadData.sub;
				profileImage = payloadData.picture;
			}
		} catch (error) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Failed to verify Google ID token: ${(error as Error).message}`,
			);
		}
	} else if (payload.code) {
		try {
			const { tokens } = await googleClient.getToken(payload.code);
			googleClient.setCredentials(tokens);
			const userInfoRes = await googleClient.request<{
				sub?: string;
				email: string;
				name?: string;
				picture?: string;
			}>({
				url: "https://www.googleapis.com/oauth2/v3/userinfo",
			});
			if (userInfoRes.data && userInfoRes.data.email) {
				email = userInfoRes.data.email;
				fullName = userInfoRes.data.name || email.split("@")[0];
				googleId = userInfoRes.data.sub;
				profileImage = userInfoRes.data.picture;
			}
		} catch (error) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Failed to exchange Google OAuth code: ${(error as Error).message}`,
			);
		}
	} else if (payload.accessToken) {
		try {
			googleClient.setCredentials({ access_token: payload.accessToken });
			const userInfoRes = await googleClient.request<{
				sub?: string;
				email: string;
				name?: string;
				picture?: string;
			}>({
				url: "https://www.googleapis.com/oauth2/v3/userinfo",
			});
			if (userInfoRes.data && userInfoRes.data.email) {
				email = userInfoRes.data.email;
				fullName = userInfoRes.data.name || email.split("@")[0];
				googleId = userInfoRes.data.sub;
				profileImage = userInfoRes.data.picture;
			}
		} catch (error) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Failed to verify Google access token: ${(error as Error).message}`,
			);
		}
	}

	if (!email) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Could not extract user email from Google authentication data",
		);
	}

	let user = await prisma.user.findFirst({
		where: {
			OR: [...(googleId ? [{ googleId }] : []), { email: email.toLowerCase() }],
		},
	});

	if (user) {
		if (user.deletedAt) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"This user account has been deleted!",
			);
		}

		// Update Google ID and profile image if missing
		user = await prisma.user.update({
			where: { id: user.id },
			data: {
				...(googleId && !user.googleId ? { googleId } : {}),
				...(profileImage && !user.profileImage ? { profileImage } : {}),
				provider: user.provider || AuthProvider.GOOGLE,
			},
		});
	} else {
		user = await prisma.user.create({
			data: {
				fullName: fullName || email.split("@")[0],
				email: email.toLowerCase(),
				googleId: googleId || null,
				profileImage: profileImage || null,
				provider: AuthProvider.GOOGLE,
				role: payload.role || Role.TENANT,
			},
		});
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwt.sign(jwtPayload, config.jwt.secret, {
		expiresIn: config.jwt.expires_in as jwt.SignOptions["expiresIn"],
	});

	const refreshToken = jwt.sign(jwtPayload, config.jwt.refresh_secret, {
		expiresIn: config.jwt.refresh_expires_in as jwt.SignOptions["expiresIn"],
	});

	const sanitizedUser: TSanitizedUser = {
		id: user.id,
		fullName: user.fullName,
		email: user.email,
		phone: user.phone,
		googleId: user.googleId,
		profileImage: user.profileImage,
		provider: user.provider,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	return {
		accessToken,
		refreshToken,
		user: sanitizedUser,
	};
};

const refreshToken = async (
	token: string,
): Promise<{ accessToken: string }> => {
	let decoded: { id: string; email: string; role: Role };

	try {
		decoded = jwt.verify(token, config.jwt.refresh_secret) as {
			id: string;
			email: string;
			role: Role;
		};
	} catch (_err) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid or expired refresh token!",
		);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: decoded.id,
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
	}

	if (user.deletedAt) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"This user account has been deleted!",
		);
	}

	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	const newAccessToken = jwt.sign(jwtPayload, config.jwt.secret, {
		expiresIn: config.jwt.expires_in as jwt.SignOptions["expiresIn"],
	});

	return {
		accessToken: newAccessToken,
	};
};

export const AuthService = {
	registerUser,
	loginUser,
	googleLogin,
	refreshToken,
};
