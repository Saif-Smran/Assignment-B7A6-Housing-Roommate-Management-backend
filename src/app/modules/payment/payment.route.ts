import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PaymentController } from "./payment.controller.js";
import { PaymentValidation } from "./payment.validation.js";

const router = Router();

router.post(
	"/initiate",
	auth(Role.TENANT),
	validateRequest(PaymentValidation.initiatePaymentZodSchema),
	PaymentController.initiatePayment,
);

router.get(
	"/my",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	PaymentController.getMyPayments,
);

router.get(
	"/:id",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	PaymentController.getPaymentById,
);

router.post("/webhook", PaymentController.handleWebhook);

export const PaymentRoutes = router;
