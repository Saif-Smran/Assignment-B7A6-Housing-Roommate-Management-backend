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
		let testerOwner = await prisma.user.findUnique({
			where: {
				email: config.tester_owner.email,
			},
		});

		if (testerOwner) {
			console.log("Tester Owner Already Exists!");
		} else {
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

			testerOwner = await prisma.user.create({
				data: {
					fullName: name,
					email,
					passwordHash: hashedPassword,
					role: Role.OWNER,
				},
			});

			console.log("Tester Owner Created : ", testerOwner);
		}

		// Seed Property under the Owner
		const isPropertyExist = await prisma.property.findFirst({
			where: {
				ownerId: testerOwner.id,
				deletedAt: null,
			},
		});

		if (isPropertyExist) {
			console.log("Tester Property Already Exists!");
			return;
		}

		const testerProperty = await prisma.property.create({
			data: {
				ownerId: testerOwner.id,
				title: "Sunset Heights Luxury Apartment",
				description:
					"Modern 3-bedroom apartment with panoramic city views and top-tier amenities.",
				address: "45 Green Road, Dhanmondi",
				city: "Dhaka",
				state: "Dhaka Division",
				country: "Bangladesh",
				zipCode: "1205",
				propertyType: "Apartment",
				amenities: [
					"WiFi",
					"Parking",
					"Gym",
					"Elevator",
					"Generator",
					"24/7 Security",
				],
				isActive: true,
				images: {
					create: [
						{
							url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
							isPrimary: true,
						},
					],
				},
				rooms: {
					create: [
						{
							roomNumber: "A-101",
							roomType: "Master Bedroom",
							capacity: 2,
							rentAmount: 15000,
							securityDeposit: 30000,
							isAvailable: true,
							description:
								"Spacious master bedroom with attached bath and balcony.",
						},
						{
							roomNumber: "A-102",
							roomType: "Single Room",
							capacity: 1,
							rentAmount: 10000,
							securityDeposit: 20000,
							isAvailable: true,
							description:
								"Cozy single room with study desk and modern furniture.",
						},
					],
				},
			},
		});

		console.log("Tester Property Created : ", testerProperty);
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
