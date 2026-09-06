import {
	PaymentGateway,
	PaymentStatus,
	type Prisma,
	Role,
} from "../../../generated/prisma/client.js";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { stripe } from "../../lib/stripe.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import type {
	TInitiatePaymentInput,
	TPaymentQueryFilters,
} from "./payment.interface.js";

const initiatePayment = async (
	userId: string,
	payload: TInitiatePaymentInput,
) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (payload.applicationId) {
		const application = await prisma.application.findUnique({
			where: { id: payload.applicationId },
		});
		if (!application) {
			throw new AppError(httpStatus.NOT_FOUND, "Application not found");
		}
		if (application.tenantId !== userId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"You can only initiate payment for your own application",
			);
		}
	}

	const payment = await prisma.payment.create({
		data: {
			userId,
			applicationId: payload.applicationId,
			amount: payload.amount,
			currency: "BDT",
			paymentMethod: PaymentGateway.STRIPE,
			status: PaymentStatus.PENDING,
			paymentType: payload.paymentType,
			description: payload.description,
		},
		include: {
			user: {
				select: {
					id: true,
					fullName: true,
					email: true,
				},
			},
			application: true,
		},
	});

	let checkoutUrl = `https://checkout.stripe.com/pay/mock_${payment.id}`;
	let transactionId = `pay_${payment.id}`;

	if (
		config.stripe.secret_key &&
		!config.stripe.secret_key.includes("placeholder")
	) {
		try {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				mode: "payment",
				customer_email: user.email,
				line_items: [
					{
						price_data: {
							currency: "bdt",
							product_data: {
								name: `${payload.paymentType} Payment`,
								description:
									payload.description || `Payment for ${payload.paymentType}`,
							},
							unit_amount: Math.round(payload.amount * 100),
						},
						quantity: 1,
					},
				],
				metadata: {
					paymentId: payment.id,
					userId,
					applicationId: payload.applicationId || "",
					paymentType: payload.paymentType,
				},
				success_url:
					payload.successUrl ||
					`http://localhost:3000/payment/success?payment_id=${payment.id}&session_id={CHECKOUT_SESSION_ID}`,
				cancel_url:
					payload.cancelUrl ||
					`http://localhost:3000/payment/cancel?payment_id=${payment.id}&session_id={CHECKOUT_SESSION_ID}`,
			});

			transactionId = session.id;
			if (session.url) {
				checkoutUrl = session.url;
			}
		} catch (_error) {
			// Fallback mock URL for dev/test environment if Stripe API call fails
			checkoutUrl = `https://checkout.stripe.com/pay/mock_${payment.id}`;
		}
	}

	const updatedPayment = await prisma.payment.update({
		where: { id: payment.id },
		data: {
			transactionId,
			metadata: {
				checkoutUrl,
				stripeSessionId: transactionId,
			},
		},
		include: {
			application: true,
			user: {
				select: {
					id: true,
					fullName: true,
					email: true,
				},
			},
		},
	});

	return {
		payment: updatedPayment,
		checkoutUrl,
	};
};

const getPaymentById = async (
	paymentId: string,
	userId: string,
	userRole: Role,
) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: {
			application: {
				include: {
					room: {
						include: {
							property: true,
						},
					},
				},
			},
			user: {
				select: {
					id: true,
					fullName: true,
					email: true,
					role: true,
				},
			},
		},
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
	}

	// Authorization Check
	const isTenantOwner = payment.userId === userId;
	const isPropertyOwner =
		payment.application?.room?.property?.ownerId === userId;
	const isAdmin = userRole === Role.ADMIN;

	if (!isAdmin && !isTenantOwner && !isPropertyOwner) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not have permission to view this payment",
		);
	}

	// Attempt real-time sync with Stripe if status is PENDING
	if (
		payment.status === PaymentStatus.PENDING &&
		payment.transactionId?.startsWith("cs_") &&
		config.stripe.secret_key &&
		!config.stripe.secret_key.includes("placeholder")
	) {
		try {
			const session = await stripe.checkout.sessions.retrieve(
				payment.transactionId,
			);
			if (session.payment_status === "paid") {
				const updated = await prisma.payment.update({
					where: { id: payment.id },
					data: { status: PaymentStatus.COMPLETED },
					include: {
						application: {
							include: {
								room: {
									include: {
										property: true,
									},
								},
							},
						},
						user: {
							select: {
								id: true,
								fullName: true,
								email: true,
								role: true,
							},
						},
					},
				});
				return updated;
			}
		} catch {
			// ignore Stripe API retrieval errors
		}
	}

	return payment;
};

const handleWebhook = async (
	rawBody: Buffer | string | Record<string, unknown>,
	signature?: string,
) => {
	let event: Record<string, unknown>;

	if (
		config.stripe.webhook_secret &&
		signature &&
		(Buffer.isBuffer(rawBody) || typeof rawBody === "string")
	) {
		try {
			event = stripe.webhooks.constructEvent(
				rawBody,
				signature,
				config.stripe.webhook_secret,
			) as unknown as Record<string, unknown>;
		} catch (err) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Webhook Error: ${(err as Error).message}`,
			);
		}
	} else if (Buffer.isBuffer(rawBody)) {
		try {
			event = JSON.parse(rawBody.toString());
		} catch {
			event = rawBody as unknown as Record<string, unknown>;
		}
	} else if (typeof rawBody === "string") {
		try {
			event = JSON.parse(rawBody);
		} catch {
			event = { payload: rawBody };
		}
	} else {
		event = (rawBody as Record<string, unknown>) || {};
	}

	const eventType = event?.type || event?.event;
	const eventData = event?.data as Record<string, unknown> | undefined;
	const sessionOrIntent = (eventData?.object || event?.payload || {}) as Record<
		string,
		unknown
	>;
	const metadata = sessionOrIntent.metadata as
		| Record<string, string>
		| undefined;

	if (
		eventType === "checkout.session.completed" ||
		eventType === "payment_intent.succeeded"
	) {
		const paymentId =
			metadata?.paymentId ||
			(sessionOrIntent.client_reference_id as string | undefined);
		const transactionId = sessionOrIntent.id as string | undefined;

		let payment = null;
		if (paymentId) {
			payment = await prisma.payment.findUnique({
				where: { id: paymentId },
			});
		} else if (transactionId) {
			payment = await prisma.payment.findFirst({
				where: { transactionId },
			});
		}

		if (payment && payment.status !== PaymentStatus.COMPLETED) {
			await prisma.payment.update({
				where: { id: payment.id },
				data: {
					status: PaymentStatus.COMPLETED,
					transactionId: transactionId || payment.transactionId,
				},
			});
		}
	} else if (
		eventType === "payment_intent.payment_failed" ||
		eventType === "checkout.session.expired"
	) {
		const paymentId = metadata?.paymentId;
		const transactionId = sessionOrIntent.id as string | undefined;

		let payment = null;
		if (paymentId) {
			payment = await prisma.payment.findUnique({
				where: { id: paymentId },
			});
		} else if (transactionId) {
			payment = await prisma.payment.findFirst({
				where: { transactionId },
			});
		}

		if (payment && payment.status === PaymentStatus.PENDING) {
			await prisma.payment.update({
				where: { id: payment.id },
				data: { status: PaymentStatus.FAILED },
			});
		}
	}

	return { received: true };
};

const getMyPayments = async (
	userId: string,
	userRole: Role,
	query: TPaymentQueryFilters & { userId?: string },
) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
	const skip = (page - 1) * limit;

	const whereConditions: Prisma.PaymentWhereInput = {};

	if (query.status) {
		whereConditions.status = query.status;
	}
	if (query.paymentType) {
		whereConditions.paymentType = query.paymentType;
	}

	if (userRole === Role.TENANT) {
		whereConditions.userId = userId;
	} else if (userRole === Role.OWNER) {
		whereConditions.OR = [
			{ userId },
			{
				application: {
					room: {
						property: {
							ownerId: userId,
						},
					},
				},
			},
		];
	} else if (userRole === Role.ADMIN && query.userId) {
		whereConditions.userId = query.userId;
	}

	const allowedSortFields = ["createdAt", "updatedAt", "amount", "status"];
	const sortBy = allowedSortFields.includes(query.sortBy || "")
		? (query.sortBy as string)
		: "createdAt";
	const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

	const total = await prisma.payment.count({
		where: whereConditions,
	});

	const payments = await prisma.payment.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			application: {
				include: {
					room: {
						include: {
							property: true,
						},
					},
				},
			},
			user: {
				select: {
					id: true,
					fullName: true,
					email: true,
					role: true,
				},
			},
		},
	});

	const totalPages = Math.ceil(total / limit);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages,
		},
		data: payments,
	};
};

export const PaymentService = {
	initiatePayment,
	getPaymentById,
	handleWebhook,
	getMyPayments,
};
