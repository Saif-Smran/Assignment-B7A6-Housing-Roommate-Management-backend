import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import {
	ApplicationStatus,
	MaintenanceStatus,
	PaymentGateway,
	PaymentStatus,
	PaymentType,
	Priority,
	Role,
	ViewingStatus,
} from "../../generated/prisma/client.js";
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

// Seed Applications for Tester Tenant
export const seedTesterApplications = async () => {
	try {
		const tenant = await prisma.user.findUnique({
			where: { email: config.tester_tenant.email },
		});

		if (!tenant) {
			console.log("Tester tenant not found for application seeding!");
			return;
		}

		const owner = await prisma.user.findUnique({
			where: { email: config.tester_owner.email },
		});

		if (!owner) {
			console.log("Tester owner not found for application seeding!");
			return;
		}

		const property = await prisma.property.findFirst({
			where: { ownerId: owner.id, deletedAt: null },
			include: { rooms: true },
		});

		if (!property || property.rooms.length === 0) {
			console.log("No property or rooms found for application seeding!");
			return;
		}

		const room101 =
			property.rooms.find((r) => r.roomNumber === "A-101") || property.rooms[0];
		const room102 =
			property.rooms.find((r) => r.roomNumber === "A-102") ||
			property.rooms[1] ||
			property.rooms[0];

		// Check if pending application exists
		const isApp1Exist = await prisma.application.findFirst({
			where: { tenantId: tenant.id, roomId: room101.id, deletedAt: null },
		});

		if (!isApp1Exist) {
			const app1 = await prisma.application.create({
				data: {
					tenantId: tenant.id,
					roomId: room101.id,
					status: ApplicationStatus.PENDING,
					moveInDate: new Date("2026-10-01T00:00:00.000Z"),
					moveOutDate: new Date("2027-10-01T00:00:00.000Z"),
					message:
						"I am interested in renting this Master Bedroom (A-101) for 12 months.",
				},
			});
			console.log("Pending Application Seeded : ", app1.id);
		} else {
			console.log("Pending Application Already Exists!");
		}

		// Check if approved application exists
		if (room102 && room102.id !== room101.id) {
			const isApp2Exist = await prisma.application.findFirst({
				where: { tenantId: tenant.id, roomId: room102.id, deletedAt: null },
			});

			if (!isApp2Exist) {
				const app2 = await prisma.application.create({
					data: {
						tenantId: tenant.id,
						roomId: room102.id,
						status: ApplicationStatus.APPROVED,
						moveInDate: new Date("2026-09-15T00:00:00.000Z"),
						moveOutDate: new Date("2027-09-15T00:00:00.000Z"),
						message: "Applying for Single Room (A-102).",
					},
				});
				console.log("Approved Application Seeded : ", app2.id);
			} else {
				console.log("Approved Application Already Exists!");
			}
		}
	} catch (error) {
		console.log("Error Seeding Tester Applications : ", error);
	}
};

// Seed Business Operations (Viewing Requests, Maintenance Requests, Payments)
export const seedTesterBusinessOps = async () => {
	try {
		const tenant = await prisma.user.findUnique({
			where: { email: config.tester_tenant.email },
		});

		const owner = await prisma.user.findUnique({
			where: { email: config.tester_owner.email },
		});

		if (!tenant || !owner) {
			return;
		}

		const property = await prisma.property.findFirst({
			where: { ownerId: owner.id, deletedAt: null },
			include: { rooms: true },
		});

		if (!property) {
			return;
		}

		// 1. Seed Viewing Request
		const isViewingExist = await prisma.viewingRequest.findFirst({
			where: { propertyId: property.id, tenantId: tenant.id },
		});

		if (!isViewingExist) {
			const viewing = await prisma.viewingRequest.create({
				data: {
					propertyId: property.id,
					tenantId: tenant.id,
					scheduledAt: new Date("2026-09-25T15:00:00.000Z"),
					status: ViewingStatus.PENDING,
					notes:
						"Would like to inspect room A-101 and overall apartment amenities.",
				},
			});
			console.log("Viewing Request Seeded : ", viewing.id);
		} else {
			console.log("Viewing Request Already Exists!");
		}

		// 2. Seed Maintenance Request for Room with Approved Application
		const approvedApp = await prisma.application.findFirst({
			where: {
				tenantId: tenant.id,
				status: ApplicationStatus.APPROVED,
				deletedAt: null,
			},
		});

		if (approvedApp) {
			const isMaintenanceExist = await prisma.maintenanceRequest.findFirst({
				where: { roomId: approvedApp.roomId, tenantId: tenant.id },
			});

			if (!isMaintenanceExist) {
				const maintenance = await prisma.maintenanceRequest.create({
					data: {
						roomId: approvedApp.roomId,
						tenantId: tenant.id,
						title: "Air Conditioner Maintenance",
						description:
							"The split AC unit in Room A-102 requires servicing and filter replacement.",
						status: MaintenanceStatus.SUBMITTED,
						priority: Priority.HIGH,
					},
				});
				console.log("Maintenance Request Seeded : ", maintenance.id);
			} else {
				console.log("Maintenance Request Already Exists!");
			}
		}

		// 3. Seed Payment for Approved Application
		if (approvedApp) {
			const isPaymentExist = await prisma.payment.findFirst({
				where: { applicationId: approvedApp.id, userId: tenant.id },
			});

			if (!isPaymentExist) {
				const payment = await prisma.payment.create({
					data: {
						applicationId: approvedApp.id,
						userId: tenant.id,
						amount: 10000.0,
						currency: "BDT",
						paymentMethod: PaymentGateway.STRIPE,
						transactionId: "TRX_STRIPE_SEED_998877",
						status: PaymentStatus.COMPLETED,
						paymentType: PaymentType.RENT,
						description: "Initial rent payment for Room A-102 via Stripe",
					},
				});
				console.log("Payment Record Seeded : ", payment.id);
			} else {
				console.log("Payment Record Already Exists!");
			}
		}
	} catch (error) {
		console.log("Error Seeding Business Operations : ", error);
	}
};

// Main Seeder Function
export const seedDatabase = async () => {
	console.log("🌱 Starting Database Seeding...");
	await seedTesterAdmin();
	await seedTesterOwner();
	await seedTesterTenant();
	await seedTesterApplications();
	await seedTesterBusinessOps();
	console.log("✅ Database Seeding Completed.");
};
