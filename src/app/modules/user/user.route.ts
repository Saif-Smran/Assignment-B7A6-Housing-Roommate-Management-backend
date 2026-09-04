import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";

const router = Router();

// /me endpoints must be defined before /:id routes to avoid route param collisions
router.get(
	"/me",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	UserController.getOwnProfile,
);

router.patch(
	"/me",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	validateRequest(UserValidation.updateProfileZodSchema),
	UserController.updateOwnProfile,
);

router.get("/:id", UserController.getUserById);

router.patch(
	"/:id/role",
	auth(Role.ADMIN),
	validateRequest(UserValidation.changeRoleZodSchema),
	UserController.changeUserRole,
);

export const UserRoutes = router;
