import httpStatus from "http-status";
import config from "../config/index.js";
import { AppError } from "../utils/AppError.js";
import { redisClient } from "./redis.js";

export const getBkashIdToken = async () => {
	try {
		const IdTokenKey = "bkash:idToken";
		const RefreshTokenKey = "bkash:refreshToken";

		let bkashIdToken = await redisClient.get(IdTokenKey);
		const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);

		const bkashRefreshToken = await redisClient.get(RefreshTokenKey);
		const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey);

		if (
			(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
			bkashRefreshToken &&
			bkashRefreshTokenTTL > 600
		) {
			const refreshTokenResponse = await fetch(
				`${config.bkash.base_url}/tokenized/checkout/token/refresh`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						username: config.bkash.username || "",
						password: config.bkash.password || "",
					},
					body: JSON.stringify({
						app_key: config.bkash.app_key,
						app_secret: config.bkash.app_secret,
						refresh_token: bkashRefreshToken,
					}),
				},
			);
			if (!refreshTokenResponse.ok) {
				throw new AppError(
					httpStatus.INTERNAL_SERVER_ERROR,
					"Bkash Access Token Grant Failed",
				);
			}

			const bkashRefreshTokenResult = (await refreshTokenResponse.json()) as {
				id_token: string;
			};

			bkashIdToken = bkashRefreshTokenResult.id_token;

			await redisClient.set(IdTokenKey, bkashIdToken, {
				expiration: {
					type: "EX",
					value: 60 * 60,
				},
			});

			return bkashIdToken;
		}

		if (bkashIdToken && bkashIdTokenTTL > 600) {
			return bkashIdToken;
		}

		const response = await fetch(
			`${config.bkash.base_url}/tokenized/checkout/token/grant`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					username: config.bkash.username || "",
					password: config.bkash.password || "",
				},
				body: JSON.stringify({
					app_key: config.bkash.app_key,
					app_secret: config.bkash.app_secret,
				}),
			},
		);

		if (!response.ok) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Bkash Access Token Grant Failed",
			);
		}

		const result = (await response.json()) as {
			id_token: string;
			refresh_token: string;
		};

		await redisClient.set(IdTokenKey, result.id_token, {
			expiration: {
				type: "EX",
				value: 60 * 60,
			},
		});

		await redisClient.set(RefreshTokenKey, result.refresh_token, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 * 28,
			},
		});

		bkashIdToken = result.id_token;

		return bkashIdToken;
	} catch (error: unknown) {
		if (error instanceof AppError) {
			throw error;
		}
		const message = error instanceof Error ? error.message : "Bkash Token Error";
		throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, message);
	}
};

export const createBkashPayment = async (data: {
	amount: number;
	payerReference: string;
	merchantInvoiceNumber: string;
}) => {
	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				authorization: idToken,
				"x-app-key": config.bkash.app_key || "",
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: data.payerReference,
				callbackURL: config.bkash.callback_url,
				amount: data.amount.toString(),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: data.merchantInvoiceNumber,
			}),
		},
	);

	if (!response.ok) {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to create bKash payment",
		);
	}

	return (await response.json()) as {
		paymentID: string;
		bkashURL: string;
		statusCode: string;
		statusMessage: string;
	};
};

export const executeBkashPayment = async (paymentID: string) => {
	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				authorization: idToken,
				"x-app-key": config.bkash.app_key || "",
			},
			body: JSON.stringify({
				paymentID,
			}),
		},
	);

	if (!response.ok) {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to execute bKash payment",
		);
	}

	return (await response.json()) as {
		paymentID: string;
		trxID: string;
		transactionStatus: string;
		amount: string;
		currency: string;
		intent: string;
		statusCode: string;
		statusMessage: string;
	};
};
