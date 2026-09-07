import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

const router = Router();

router.post(
	"/register",
	validateRequest(AuthValidation.registerZodSchema),
	AuthController.register,
);

router.post(
	"/login",
	validateRequest(AuthValidation.loginZodSchema),
	AuthController.login,
);

router.post(
	"/google",
	validateRequest(AuthValidation.googleLoginZodSchema),
	AuthController.googleLogin,
);

router.post(
	"/google-login",
	validateRequest(AuthValidation.googleLoginZodSchema),
	AuthController.googleLogin,
);

router.post(
	"/refresh-token",
	validateRequest(AuthValidation.refreshTokenZodSchema),
	AuthController.refreshToken,
);

router.post(
	"/logout",
	auth(Role.TENANT, Role.OWNER, Role.ADMIN),
	AuthController.logout,
);

export const AuthRoutes = router;
