import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/client.js";
import config from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./AppError.js";

// Seed Tester Admin (Role: ADMIN)
export const seedTesterAdmin = async () => {
	try {
		const isTesterAdminExist = await prisma.user.findUnique({
			where: {
				email: config.tester_admin.email,
			},
		});

		if (isTesterAdminExist) {
			console.log("Tester Admin Already Exists!");
			return;
		}

		const name = config.tester_admin.name;
		const email = config.tester_admin.email;
		const password = config.tester_admin.password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Admin Name, Email, Password Missing In Env File!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerAdmin = await prisma.user.create({
			data: {
				fullName: name,
				email,
				passwordHash: hashedPassword,
				role: Role.ADMIN,
			},
		});

		console.log("Tester Admin Created : ", testerAdmin);
	} catch (error) {
		console.log("Error Seeding Tester Admin : ", error);

		if (config.tester_admin.email) {
			await prisma.user.deleteMany({
				where: {
					email: config.tester_admin.email,
				},
			});
		}
	}
};

// Seed Tester Owner (Role: OWNER)
export const seedTesterOwner = async () => {
	try {
		const isTesterOwnerExist = await prisma.user.findUnique({
			where: {
				email: config.tester_owner.email,
			},
		});

		if (isTesterOwnerExist) {
			console.log("Tester Owner Already Exists!");
			return;
		}

		const name = config.tester_owner.name;
		const email = config.tester_owner.email;
		const password = config.tester_owner.password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Owner Name, Email, Password Missing In Env File!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerOwner = await prisma.user.create({
			data: {
				fullName: name,
				email,
				passwordHash: hashedPassword,
				role: Role.OWNER,
			},
		});

		console.log("Tester Owner Created : ", testerOwner);
	} catch (error) {
		console.log("Error Seeding Tester Owner : ", error);

		if (config.tester_owner.email) {
			await prisma.user.deleteMany({
				where: {
					email: config.tester_owner.email,
				},
			});
		}
	}
};

// Seed Tester Tenant (Role: TENANT)
export const seedTesterTenant = async () => {
	try {
		const isTesterTenantExist = await prisma.user.findUnique({
			where: {
				email: config.tester_tenant.email,
			},
		});

		if (isTesterTenantExist) {
			console.log("Tester Tenant Already Exists!");
			return;
		}

		const name = config.tester_tenant.name;
		const email = config.tester_tenant.email;
		const password = config.tester_tenant.password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Tenant Name, Email, Password Missing In Env File!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerTenant = await prisma.user.create({
			data: {
				fullName: name,
				email,
				passwordHash: hashedPassword,
				role: Role.TENANT,
			},
		});

		console.log("Tester Tenant Created : ", testerTenant);
	} catch (error) {
		console.log("Error Seeding Tester Tenant : ", error);

		if (config.tester_tenant.email) {
			await prisma.user.deleteMany({
				where: {
					email: config.tester_tenant.email,
				},
			});
		}
	}
};

// Main Seeder Function
export const seedDatabase = async () => {
	console.log("🌱 Starting Database Seeding...");
	await seedTesterAdmin();
	await seedTesterOwner();
	await seedTesterTenant();
	console.log("✅ Database Seeding Completed.");
};
