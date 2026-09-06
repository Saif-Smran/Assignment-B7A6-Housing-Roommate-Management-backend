import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { MaintenanceController } from "../maintenance/maintenance.controller.js";
import { MaintenanceValidation } from "../maintenance/maintenance.validation.js";
import { RoomController } from "./room.controller.js";
import { RoomValidation } from "./room.validation.js";

const router = Router();

router.get("/:id", RoomController.getRoomById);

router.post(
	"/:id/maintenance",
	auth(Role.TENANT),
	validateRequest(MaintenanceValidation.createMaintenanceZodSchema),
	MaintenanceController.createMaintenance,
);

router.post(
	"/:id/assign",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(RoomValidation.assignTenantZodSchema),
	RoomController.assignTenantToRoom,
);

router.patch(
	"/:id/availability",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(RoomValidation.updateRoomAvailabilityZodSchema),
	RoomController.updateRoomAvailability,
);

router.patch(
	"/:id",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(RoomValidation.updateRoomZodSchema),
	RoomController.updateRoom,
);

router.delete(
	"/:id",
	auth(Role.OWNER, Role.ADMIN),
	RoomController.softDeleteRoom,
);

export const RoomRoutes = router;
