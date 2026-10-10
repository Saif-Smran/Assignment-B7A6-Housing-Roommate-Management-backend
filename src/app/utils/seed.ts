import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import {
	ApplicationStatus,
	AuthProvider,
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
				provider: AuthProvider.CREDENTIAL,
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
					provider: AuthProvider.CREDENTIAL,
					role: Role.OWNER,
				},
			});

			console.log("Tester Owner Created : ", testerOwner);
		}

		// Properties seed data (at least 6-7 properties with 2-4 rooms each)
		const propertiesSeedList = [
			{
				title: "Sunset Heights Luxury Apartment",
				description:
					"Modern 3-bedroom apartment with panoramic city views, high ceilings, modular kitchen, and top-tier amenities.",
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
					"Balcony",
					"CCTV",
				],
				isActive: true,
				images: [
					{
						url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
						isPrimary: true,
					},
					{
						url: "https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb",
						isPrimary: false,
					},
					{
						url: "https://res.cloudinary.com/demo/image/upload/kitchen.jpg",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "A-101",
						roomType: "Master Bedroom",
						capacity: 2,
						rentAmount: 15000,
						securityDeposit: 30000,
						isAvailable: true,
						description:
							"Spacious master bedroom with attached bath and private balcony.",
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
					{
						roomNumber: "A-103",
						roomType: "Double Bedroom",
						capacity: 2,
						rentAmount: 12000,
						securityDeposit: 24000,
						isAvailable: true,
						description:
							"Well-lit double bedroom with built-in wooden closet and window view.",
					},
				],
			},
			{
				title: "Greenwood Lakeview Residence",
				description:
					"Scenic condo overlooking the serene lake, equipped with marble floors, smart home controls, and lush greenery.",
				address: "12 Lake Circus, Kalabagan",
				city: "Dhaka",
				state: "Dhaka Division",
				country: "Bangladesh",
				zipCode: "1205",
				propertyType: "Condo",
				amenities: [
					"WiFi",
					"Air Conditioning",
					"Lake View",
					"Swimming Pool",
					"Rooftop Garden",
					"Elevator",
					"24/7 Security",
				],
				isActive: true,
				images: [
					{
						url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
						isPrimary: true,
					},
					{
						url: "https://plus.unsplash.com/premium_photo-1684338795288-097525d127f0",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
						isPrimary: false,
					},
					{
						url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "B-201",
						roomType: "Deluxe Suite",
						capacity: 2,
						rentAmount: 18000,
						securityDeposit: 36000,
						isAvailable: true,
						description:
							"Deluxe suite with expansive lake-facing glass windows and en-suite bath.",
					},
					{
						roomNumber: "B-202",
						roomType: "Single Room",
						capacity: 1,
						rentAmount: 11500,
						securityDeposit: 23000,
						isAvailable: true,
						description:
							"Bright single room with ergonomic workstation and garden view.",
					},
					{
						roomNumber: "B-203",
						roomType: "Studio Room",
						capacity: 1,
						rentAmount: 13500,
						securityDeposit: 27000,
						isAvailable: true,
						description:
							"Self-contained studio room with mini-pantry and soundproof walls.",
					},
				],
			},
			{
				title: "Gulshan Skyline Penthouse",
				description:
					"Top-floor ultra-luxury penthouse featuring 360-degree city views, private elevator access, and rooftop terrace.",
				address: "Road 71, Gulshan-2",
				city: "Dhaka",
				state: "Dhaka Division",
				country: "Bangladesh",
				zipCode: "1212",
				propertyType: "Penthouse",
				amenities: [
					"WiFi",
					"Private Elevator",
					"Gym",
					"Concierge",
					"Jacuzzi",
					"Generator",
					"Parking",
					"Smart Lock",
				],
				isActive: true,
				images: [
					{
						url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
						isPrimary: true,
					},
					{
						url: "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
						isPrimary: false,
					},
					{
						url: "https://res.cloudinary.com/demo/image/upload/painting.jpg",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "PH-01",
						roomType: "Presidential Suite",
						capacity: 2,
						rentAmount: 32000,
						securityDeposit: 64000,
						isAvailable: true,
						description:
							"Top-floor presidential suite with private rooftop terrace access and walk-in closet.",
					},
					{
						roomNumber: "PH-02",
						roomType: "Executive Room",
						capacity: 2,
						rentAmount: 24000,
						securityDeposit: 48000,
						isAvailable: true,
						description:
							"Executive room with skyline view, kingsize plush bed, and private lounge.",
					},
					{
						roomNumber: "PH-03",
						roomType: "Standard Room",
						capacity: 1,
						rentAmount: 16000,
						securityDeposit: 32000,
						isAvailable: true,
						description:
							"Quiet standard room with acoustic insulation and floor-to-ceiling windows.",
					},
					{
						roomNumber: "PH-04",
						roomType: "Guest Bedroom",
						capacity: 1,
						rentAmount: 14000,
						securityDeposit: 28000,
						isAvailable: true,
						description:
							"Chic guest bedroom with sleek modern finish and dedicated workspace.",
					},
				],
			},
			{
				title: "Banani Gardenia Modern House",
				description:
					"Two-story contemporary house with a private landscaped front yard, peaceful surroundings, and gated perimeter.",
				address: "House 28, Road 11, Block D, Banani",
				city: "Dhaka",
				state: "Dhaka Division",
				country: "Bangladesh",
				zipCode: "1213",
				propertyType: "House",
				amenities: [
					"WiFi",
					"Private Lawn",
					"Car Parking",
					"Generator",
					"Air Conditioning",
					"CCTV",
					"Pet Friendly",
				],
				isActive: true,
				images: [
					{
						url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
						isPrimary: true,
					},
					{
						url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
						isPrimary: false,
					},
					{
						url: "https://plus.unsplash.com/premium_photo-1678297269980-16f4be3a15a6",
						isPrimary: false,
					},
					{
						url: "https://res.cloudinary.com/demo/image/upload/chair.jpg",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "G-101",
						roomType: "Garden View Master",
						capacity: 2,
						rentAmount: 19000,
						securityDeposit: 38000,
						isAvailable: true,
						description:
							"Ground floor master bedroom opening directly to the landscaped lawn.",
					},
					{
						roomNumber: "G-102",
						roomType: "Studio Suite",
						capacity: 1,
						rentAmount: 14500,
						securityDeposit: 29000,
						isAvailable: true,
						description:
							"Peaceful studio room with reading nook and abundant natural daylight.",
					},
				],
			},
			{
				title: "Uttara Rosewood Duplex Villa",
				description:
					"Exclusive duplex villa near Dhaka airport, offering serene suburban living with high-end designer fittings.",
				address: "Sector 4, Road 7, Uttara",
				city: "Dhaka",
				state: "Dhaka Division",
				country: "Bangladesh",
				zipCode: "1230",
				propertyType: "Villa",
				amenities: [
					"WiFi",
					"Dedicated Garage",
					"Solar Power",
					"Central AC",
					"24/7 Guard",
					"Intercom",
					"Balcony",
				],
				isActive: true,
				images: [
					{
						url: "https://plus.unsplash.com/premium_photo-1661883964999-c1bcb57a7357",
						isPrimary: true,
					},
					{
						url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "V-1",
						roomType: "Grand Master Room",
						capacity: 2,
						rentAmount: 22000,
						securityDeposit: 44000,
						isAvailable: true,
						description:
							"Expansive upstairs bedroom with walk-in wardrobe and private open balcony.",
					},
					{
						roomNumber: "V-2",
						roomType: "Double Bedroom",
						capacity: 2,
						rentAmount: 16500,
						securityDeposit: 33000,
						isAvailable: true,
						description:
							"Spacious double bedroom with polished hardwood flooring and natural sunlight.",
					},
					{
						roomNumber: "V-3",
						roomType: "Compact Single",
						capacity: 1,
						rentAmount: 11000,
						securityDeposit: 22000,
						isAvailable: true,
						description:
							"Cozy single bedroom ideal for university students or remote professionals.",
					},
				],
			},
			{
				title: "Bashundhara Crystal Court",
				description:
					"Brand-new residential complex minutes away from university campuses, featuring fast fiber WiFi and fitness center.",
				address: "Block C, Road 5, Bashundhara R/A",
				city: "Dhaka",
				state: "Dhaka Division",
				country: "Bangladesh",
				zipCode: "1229",
				propertyType: "Apartment",
				amenities: [
					"WiFi",
					"Fitness Center",
					"Elevator",
					"Standby Generator",
					"CCTV",
					"Fire Safety",
					"Community Hall",
				],
				isActive: true,
				images: [
					{
						url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
						isPrimary: true,
					},
					{
						url: "https://plus.unsplash.com/premium_photo-1682377521697-bc598b52b08a",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "C-301",
						roomType: "Master Bedroom",
						capacity: 2,
						rentAmount: 15500,
						securityDeposit: 31000,
						isAvailable: true,
						description:
							"Master suite with attached bathroom and South-facing sunny balcony.",
					},
					{
						roomNumber: "C-302",
						roomType: "Single Room",
						capacity: 1,
						rentAmount: 9500,
						securityDeposit: 19000,
						isAvailable: true,
						description:
							"Single private room with study table, bookshelf, and high-speed LAN port.",
					},
					{
						roomNumber: "C-303",
						roomType: "Double Shared Room",
						capacity: 2,
						rentAmount: 12500,
						securityDeposit: 25000,
						isAvailable: true,
						description:
							"Roomy shared space with twin single beds and dual study desks.",
					},
					{
						roomNumber: "C-304",
						roomType: "Single Room",
						capacity: 1,
						rentAmount: 9000,
						securityDeposit: 18000,
						isAvailable: true,
						description:
							"Quiet inner room with custom storage wardrobe and overhead fan.",
					},
				],
			},
			{
				title: "Agrabad Harborview Suites",
				description:
					"Coastal city condo near the bustling commercial district of Chittagong with sea-breeze balconies and modern security.",
				address: "Commercial Area, Sheikh Mujib Road, Agrabad",
				city: "Chittagong",
				state: "Chittagong Division",
				country: "Bangladesh",
				zipCode: "4100",
				propertyType: "Condo",
				amenities: [
					"WiFi",
					"Elevator",
					"Parking",
					"Sea Breeze Balcony",
					"Power Backup",
					"Security Guard",
					"Water Purifier",
				],
				isActive: true,
				images: [
					{
						url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
						isPrimary: true,
					},
					{
						url: "https://plus.unsplash.com/premium_photo-1661915661139-5b6a4e4a6fcc",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
						isPrimary: false,
					},
					{
						url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0",
						isPrimary: false,
					},
				],
				rooms: [
					{
						roomNumber: "H-401",
						roomType: "Harbor View Master",
						capacity: 2,
						rentAmount: 14000,
						securityDeposit: 28000,
						isAvailable: true,
						description:
							"Master room featuring sweeping port and city views with cool coastal breeze.",
					},
					{
						roomNumber: "H-402",
						roomType: "Deluxe Single Room",
						capacity: 1,
						rentAmount: 8500,
						securityDeposit: 17000,
						isAvailable: true,
						description:
							"Compact deluxe single room with modern furnishings and attached washroom.",
					},
				],
			},
		];

		for (const propData of propertiesSeedList) {
			const existingProperty = await prisma.property.findFirst({
				where: {
					ownerId: testerOwner.id,
					title: propData.title,
					deletedAt: null,
				},
				include: {
					rooms: true,
					images: true,
				},
			});

			if (!existingProperty) {
				const createdProperty = await prisma.property.create({
					data: {
						ownerId: testerOwner.id,
						title: propData.title,
						description: propData.description,
						address: propData.address,
						city: propData.city,
						state: propData.state,
						country: propData.country,
						zipCode: propData.zipCode,
						propertyType: propData.propertyType,
						amenities: propData.amenities,
						isActive: propData.isActive,
						images: {
							create: propData.images,
						},
						rooms: {
							create: propData.rooms,
						},
					},
				});
				console.log("Tester Property Created : ", createdProperty.title);
			} else {
				console.log(
					`Tester Property Already Exists : ${existingProperty.title}`,
				);

				// If existing property has fewer images than seed definition, enrich with new images
				if (existingProperty.images.length < propData.images.length) {
					const existingUrls = new Set(
						existingProperty.images.map((img) => img.url),
					);
					const missingImages = propData.images.filter(
						(img) => !existingUrls.has(img.url),
					);

					if (missingImages.length > 0) {
						await prisma.propertyImage.createMany({
							data: missingImages.map((img) => ({
								propertyId: existingProperty.id,
								url: img.url,
								isPrimary: img.isPrimary,
							})),
						});
						console.log(
							`Enriched ${missingImages.length} additional images for ${existingProperty.title}`,
						);
					}
				}

				// If existing property is missing any rooms from the seed data, add them
				const existingRoomNumbers = new Set(
					existingProperty.rooms.map((r) => r.roomNumber),
				);
				const missingRooms = propData.rooms.filter(
					(r) => !existingRoomNumbers.has(r.roomNumber),
				);

				for (const roomItem of missingRooms) {
					await prisma.room.create({
						data: {
							...roomItem,
							propertyId: existingProperty.id,
						},
					});
					console.log(
						`Added missing room ${roomItem.roomNumber} to ${existingProperty.title}`,
					);
				}
			}
		}
	} catch (error) {
		console.log("Error Seeding Tester Owner Properties : ", error);
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
				provider: AuthProvider.CREDENTIAL,
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

// Seed Tester Google User (Role: TENANT, AuthProvider: GOOGLE)
export const seedTesterGoogleUser = async () => {
	try {
		const googleEmail = "testergoogle@example.com";
		const isTesterGoogleUserExist = await prisma.user.findUnique({
			where: { email: googleEmail },
		});

		if (isTesterGoogleUserExist) {
			console.log("Tester Google User Already Exists!");
			return;
		}

		const googleUser = await prisma.user.create({
			data: {
				fullName: "Tester Google User",
				email: googleEmail,
				googleId: "109876543210987654321",
				provider: AuthProvider.GOOGLE,
				profileImage: "https://lh3.googleusercontent.com/a/default-user-avatar",
				role: Role.TENANT,
			},
		});

		console.log("Tester Google User Created : ", googleUser);
	} catch (error) {
		console.log("Error Seeding Tester Google User : ", error);
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
	await seedTesterGoogleUser();
	await seedTesterApplications();
	await seedTesterBusinessOps();
	console.log("✅ Database Seeding Completed.");
};
