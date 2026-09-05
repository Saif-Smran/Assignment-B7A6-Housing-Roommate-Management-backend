import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { ApplicationController } from "./application.controller.js";
import { ApplicationValidation } from "./application.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.TENANT, Role.ADMIN),
	validateRequest(ApplicationValidation.createApplicationZodSchema),
	ApplicationController.createApplication,
);

router.get(
	"/",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	ApplicationController.getAllApplications,
);

router.get(
	"/my",
	auth(Role.TENANT, Role.ADMIN),
	ApplicationController.getMyApplications,
);

router.get(
	"/for-property/:propertyId",
	auth(Role.OWNER, Role.ADMIN),
	ApplicationController.getApplicationsForProperty,
);

router.get(
	"/:id",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	ApplicationController.getApplicationById,
);

router.patch(
	"/:id/status",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	validateRequest(ApplicationValidation.updateApplicationStatusZodSchema),
	ApplicationController.updateApplicationStatus,
);

export const ApplicationRoutes = router;
