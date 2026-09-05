import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { RoomController } from "../room/room.controller.js";
import { RoomValidation } from "../room/room.validation.js";
import { PropertyController } from "./property.controller.js";
import { PropertyValidation } from "./property.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(PropertyValidation.createPropertyZodSchema),
	PropertyController.createProperty,
);

router.get("/", PropertyController.getAllProperties);

// /search route MUST be registered before /:id route
router.get("/search", PropertyController.searchProperties);

// Nested Room routes for a property
router.post(
	"/:propertyId/rooms",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(RoomValidation.createRoomZodSchema),
	RoomController.createRoom,
);

router.get("/:propertyId/rooms", RoomController.getRoomsByProperty);

router.get("/:id", PropertyController.getPropertyById);

router.patch(
	"/:id",
	auth(Role.OWNER, Role.ADMIN),
	validateRequest(PropertyValidation.updatePropertyZodSchema),
	PropertyController.updateProperty,
);

router.delete(
	"/:id",
	auth(Role.OWNER, Role.ADMIN),
	PropertyController.softDeleteProperty,
);

export const PropertyRoutes = router;
