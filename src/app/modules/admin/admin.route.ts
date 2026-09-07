import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { AdminController } from "./admin.controller.js";
import { AdminValidation } from "./admin.validation.js";

const router = Router();

// All admin endpoints require ADMIN role authorization
router.use(auth(Role.ADMIN));

router.get("/users", AdminController.getAllUsers);

router.patch(
	"/users/:id/role",
	validateRequest(AdminValidation.changeUserRoleZodSchema),
	AdminController.updateUserRole,
);

router.get("/dashboard-stats", AdminController.getDashboardStats);

router.get("/properties", AdminController.getAllPropertiesAdmin);

router.delete("/properties/:id", AdminController.hardDeleteProperty);

export const AdminRoutes = router;
