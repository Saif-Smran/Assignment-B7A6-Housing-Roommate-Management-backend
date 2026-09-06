import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { ViewingController } from "./viewing.controller.js";
import { ViewingValidation } from "./viewing.validation.js";

const router = Router();

router.get(
	"/",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	ViewingController.getAllViewingRequests,
);

router.patch(
	"/:id/status",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	validateRequest(ViewingValidation.updateViewingStatusZodSchema),
	ViewingController.updateViewingStatus,
);

export const ViewingRequestRoutes = router;
