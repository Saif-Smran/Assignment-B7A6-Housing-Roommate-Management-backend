import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { MaintenanceController } from "./maintenance.controller.js";
import { MaintenanceValidation } from "./maintenance.validation.js";

const router = Router();

router.get(
	"/",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	MaintenanceController.getAllMaintenanceRequests,
);

router.patch(
	"/:id/status",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(MaintenanceValidation.updateMaintenanceStatusZodSchema),
	MaintenanceController.updateMaintenanceStatus,
);

export const MaintenanceRequestRoutes = router;
