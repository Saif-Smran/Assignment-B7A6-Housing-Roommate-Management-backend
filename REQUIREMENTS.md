# Housing & Roommate Management Platform - Project Requirements

## 1. Overview
This project is a backend REST API for a Housing & Roommate Management Platform. It connects property owners, tenants, and administrators in a unified system. The platform handles property listings, room management, roommate matching, booking/application workflows, rent tracking, utility bill splitting, maintenance requests, and payment processing.

### Key Features
- Property listings with buildings, flats, and rooms
- Roommate profiles and preference matching
- Availability management and viewing requests
- Application/booking workflows with approval
- Rent tracking and utility bill splitting
- Maintenance requests and rental documents
- Notifications and dashboards
- Secure payment integration (bKash/Stripe/SSLCommerz)

## 2. Tech Stack
| Category | Technology | Purpose |
| --- | --- | --- |
| Runtime & Framework | Node.js, TypeScript, Express.js | REST API development with type safety |
| Database & ORM | PostgreSQL + Prisma | Relational database with relations, indexing, transactions |
| Validation | Zod | Strict API-level input validation |
| Linting & Formatting | Biome / ESLint / Prettier | Code quality and consistency |
| Caching & State | Redis (optional) | Caching, rate limiting, temporary state |
| Authentication | Custom JWT with bcrypt | Email/Password login, role-based access |
| Email (Optional) | Nodemailer / Resend | Transactional emails (notifications) |
| File Storage | Multer & Cloudinary | Upload property images, documents |
| Payments | bKash / Stripe / SSLCommerz | Real payment processing and status tracking |
| Documentation | Postman / Swagger (OpenAPI) | API testing and interactive documentation |
| Deployment | Vercel (Serverless) / Render | Production backend deployment |

## 3. Core Project Rules

### 3.1 Roles
The system has three fixed primary roles:
- **Owner** – Can create and manage properties, rooms, respond to applications, view own listings.
- **Tenant** – Can search properties, apply for rooms, pay rent, request maintenance, view own bookings.
- **Admin** – Can manage users, properties, audit logs, platform statistics, and enforce policies.

Role permissions must be strictly enforced via middleware.

### 3.2 Payment Integration (Mandatory)
- Integrate bKash, Stripe, or SSLCommerz.
- Implement payment initiation, success/cancellation callbacks, and status tracking.
- Rent payments, security deposits, and utility bills must be handled through real payment gateways.
- Cash on Delivery, Pay Later, or manual status updates are **NOT** accepted.

### 3.3 No Frontend Required
- This is a backend-only assignment.
- Use Postman, Thunder Client, or Swagger to demonstrate all APIs.

### 3.4 Security & Protection
- Passwords securely hashed with bcrypt.
- Environment variables for all secrets.
- All private routes protected with JWT Bearer token.
- Rate Limiting using `express-rate-limit` to prevent abuse.
- Security Headers via `helmet`.
- CORS properly configured.

### 3.5 Performance & Concurrency
- Database indexing on frequently queried fields (e.g., `userId`, `propertyId`, `status`).
- Efficient Prisma queries using `select` to limit returned fields.
- Use Redis for caching (optional but recommended).
- Use database transactions to handle concurrency and prevent race conditions (e.g., double-booking a room).

### 3.6 Soft Deletes & Audit Logs
- All deletable records use a `deletedAt` timestamp (soft delete).
- Audit logs track critical actions: who changed a status, updated a role, or modified sensitive data.

## 4. Database Schema (Prisma Models)
We define the following primary models. Foreign keys and indexes are included where appropriate.

```prisma
// User model
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  fullName      String
  phone         String?
  role          Role      @default(TENANT) // TENANT, OWNER, ADMIN
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  // Relations
  properties    Property[]  @relation("Owner")
  applications  Application[]
  payments      Payment[]
  maintenance   MaintenanceRequest[]
  auditLogs     AuditLog[]  @relation("Actor")
  notifications Notification[] @relation("Receiver")

  @@index([email])
  @@index([role])
}

enum Role {
  TENANT
  OWNER
  ADMIN
}

// Property model
model Property {
  id          String   @id @default(cuid())
  ownerId     String
  owner       User     @relation("Owner", fields: [ownerId], references: [id])
  title       String
  description String?
  address     String
  city        String
  state       String?
  country     String
  zipCode     String?
  propertyType String // e.g., Apartment, House, Condo
  amenities   String[] // e.g., ["WiFi", "Parking", "Gym"]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  rooms       Room[]
  images      PropertyImage[]
  viewings    ViewingRequest[]

  @@index([ownerId])
  @@index([city])
  @@index([isActive])
}

model PropertyImage {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  url         String   // Cloudinary URL
  isPrimary   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// Room model
model Room {
  id            String   @id @default(cuid())
  propertyId    String
  property      Property @relation(fields: [propertyId], references: [id])
  roomNumber    String?
  roomType      String   // e.g., Single, Double, Shared
  capacity      Int      // max number of tenants
  rentAmount    Float    // monthly rent
  securityDeposit Float?
  availableFrom DateTime?
  availableTo   DateTime?
  isAvailable   Boolean  @default(true)
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  applications  Application[]
  maintenance   MaintenanceRequest[]

  @@index([propertyId])
  @@index([isAvailable])
  @@index([rentAmount])
}

// Application (Booking Request)
model Application {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        User     @relation(fields: [tenantId], references: [id])
  roomId        String
  room          Room     @relation(fields: [roomId], references: [id])
  status        ApplicationStatus @default(PENDING) // PENDING, APPROVED, REJECTED, CANCELLED
  moveInDate    DateTime
  moveOutDate   DateTime?
  message       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  payments      Payment[]

  @@index([tenantId])
  @@index([roomId])
  @@index([status])
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

// Payment model
model Payment {
  id                String   @id @default(cuid())
  applicationId     String
  application       Application @relation(fields: [applicationId], references: [id])
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  amount            Float
  currency          String   @default("BDT")
  paymentMethod     String   // bKash, Stripe, SSLCommerz
  transactionId     String?  // from gateway
  status            PaymentStatus @default(PENDING)
  paymentType       PaymentType // RENT, DEPOSIT, UTILITY
  description       String?
  metadata          Json?    // gateway-specific data
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([applicationId])
  @@index([userId])
  @@index([status])
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum PaymentType {
  RENT
  DEPOSIT
  UTILITY
}

// Viewing Request
model ViewingRequest {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  tenantId    String
  tenant      User     @relation(fields: [tenantId], references: [id])
  scheduledAt DateTime
  status      ViewingStatus @default(PENDING) // PENDING, CONFIRMED, COMPLETED, CANCELLED
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([propertyId])
  @@index([tenantId])
  @@index([scheduledAt])
}

enum ViewingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

// Maintenance Request
model MaintenanceRequest {
  id          String   @id @default(cuid())
  roomId      String
  room        Room     @relation(fields: [roomId], references: [id])
  tenantId    String
  tenant      User     @relation(fields: [tenantId], references: [id])
  title       String
  description String
  status      MaintenanceStatus @default(SUBMITTED)
  priority    Priority @default(MEDIUM)
  assignedTo  String?  // staff/owner id
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([roomId])
  @@index([tenantId])
  @@index([status])
}

enum MaintenanceStatus {
  SUBMITTED
  IN_PROGRESS
  RESOLVED
  REJECTED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

// Utility Bill (for splitting)
model UtilityBill {
  id          String   @id @default(cuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  month       DateTime // billing month
  totalAmount Float
  status      BillStatus @default(UNPAID)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  splits      UtilitySplit[]
}

model UtilitySplit {
  id          String   @id @default(cuid())
  billId      String
  bill        UtilityBill @relation(fields: [billId], references: [id])
  tenantId    String
  tenant      User     @relation(fields: [tenantId], references: [id])
  amount      Float
  paid        Boolean  @default(false)
  paidAt      DateTime?
}

enum BillStatus {
  UNPAID
  PARTIALLY_PAID
  PAID
}

// Audit Log
model AuditLog {
  id          String   @id @default(cuid())
  actorId     String
  actor       User     @relation("Actor", fields: [actorId], references: [id])
  action      String   // e.g., "UPDATE_APPLICATION_STATUS", "CREATE_PROPERTY"
  targetType  String   // e.g., "Application", "Property"
  targetId    String
  changes     Json?    // before/after values
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}
```

## 5. API Endpoints (20+)
All endpoints are prefixed with `/api/v1` and return a standard JSON response format:

**Success:**
```json
{ "success": true, "message": "Operation successful", "data": {} }
```

**Error:**
```json
{ "success": false, "message": "Error message", "errors": [] }
```

### 5.1 Authentication
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login, get tokens | Public |
| POST | `/auth/refresh-token` | Refresh JWT token | Public |
| POST | `/auth/logout` | Logout (invalidate token) | Authenticated |

*Permissions: Any authenticated user can logout; registration/login public.*

### 5.2 User / Profile
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/users/me` | Get own profile | Authenticated |
| PATCH | `/users/me` | Update own profile | Authenticated |
| GET | `/users/:id` | Get user by ID (public info) | Public (limited) |
| PATCH | `/users/:id/role` | Change user role (Admin only) | Admin |

*Permissions: Only Admin can change roles; users can update own profile.*

### 5.3 Properties (Core Resource)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/properties` | Create a new property | Owner |
| GET | `/properties` | List properties with pagination & filters | Public |
| GET | `/properties/:id` | Get property details | Public |
| PATCH | `/properties/:id` | Update property details | Owner (own) |
| DELETE | `/properties/:id` | Soft delete property | Owner (own) |
| GET | `/properties/search?q=` | Search properties by keyword | Public |

*Filters: `?page=1&limit=10&city=Dhaka&minRent=5000&maxRent=15000&sortBy=createdAt&sortOrder=desc`*

*Permissions: Owner can manage their own properties; Admin can manage any; Tenant can view all (including active).*

### 5.4 Rooms (Nested under Properties)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/properties/:propertyId/rooms` | Add a room to property | Owner (own) |
| GET | `/properties/:propertyId/rooms` | List rooms in property | Public |
| GET | `/rooms/:id` | Get room details | Public |
| PATCH | `/rooms/:id` | Update room | Owner (own) |
| DELETE | `/rooms/:id` | Soft delete room | Owner (own) |
| PATCH | `/rooms/:id/availability` | Update room availability dates | Owner (own) |

*Permissions: Owner can manage rooms of their properties; Admin can manage all.*

### 5.5 Applications (Booking Workflow)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/applications` | Apply for a room (tenant) | Tenant |
| GET | `/applications` | List applications (with filters) | Tenant/Owner |
| GET | `/applications/:id` | Get application details | Tenant/Owner |
| PATCH | `/applications/:id/status` | Approve/Reject (Owner) or Cancel (Tenant) | Owner/Tenant |
| GET | `/applications/my` | Get applications for logged-in tenant | Tenant |
| GET | `/applications/for-property/:propertyId` | List applications for a property | Owner (own) |

*Permissions: Tenant can create and view own; Owner can view applications for own properties and change status.*

### 5.6 Business Operations (State Changes)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/properties/:id/viewing-requests` | Request a viewing | Tenant |
| GET | `/viewing-requests` | List viewing requests | Tenant/Owner |
| PATCH | `/viewing-requests/:id/status` | Confirm/Cancel viewing | Owner (own)/Tenant(own) |
| POST | `/rooms/:id/maintenance` | Submit maintenance request | Tenant (booked) |
| GET | `/maintenance-requests` | List maintenance requests | Owner/Admin/Tenant |
| PATCH | `/maintenance-requests/:id/status` | Update status | Owner/Admin |
| POST | `/rooms/:id/assign` | Assign tenant to room (after approval) | Owner (own) |

*Permissions: Only tenants with an approved application can submit maintenance for that room; owners can assign.*

### 5.7 Payment Integration
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/payments/initiate` | Initiate payment (rent/deposit) | Tenant |
| GET | `/payments/:id` | Get payment status | Tenant/Owner |
| POST | `/payments/webhook` | Webhook for payment gateway | Public (gateway) |
| GET | `/payments/my` | List payments for logged-in user | Authenticated |

*Permissions: Tenant initiates payments; Owner can view payments for their properties; Admin can view all.*

### 5.8 Admin Operations
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/admin/users` | List all users | Admin |
| PATCH | `/admin/users/:id/role` | Update user role | Admin |
| GET | `/admin/dashboard-stats` | Platform statistics | Admin |
| GET | `/admin/audit-logs` | Retrieve audit logs | Admin |
| GET | `/admin/properties` | List all properties (with filters) | Admin |
| DELETE | `/admin/properties/:id` | Hard delete (if needed) | Admin |

### 5.9 Utility Bills (Advanced)
| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/utility-bills` | Create utility bill (Owner/Admin) | Owner/Admin |
| GET | `/utility-bills` | List utility bills | Owner/Tenant/Admin |
| GET | `/utility-bills/:id/splits` | Get splits | Owner/Tenant |
| POST | `/utility-bills/:id/pay-split` | Pay a split (Tenant) | Tenant |

## 6. Minimum API Coverage Summary
- **Authentication**: 4 endpoints (register, login, refresh, logout)
- **User/Profile**: 4 endpoints (me, update, get, role update)
- **Core Resources (Properties & Rooms)**: 10+ endpoints (CRUD, search, filtering)
- **Business Operations**: 8+ endpoints (applications, viewing, maintenance, assignment)
- **Payment**: 4 endpoints (initiate, status, webhook, my payments)
- **Admin**: 5 endpoints (users, role, stats, logs, properties)
- **Utility**: 4 endpoints (create, list, splits, pay)

*Total exceeds 20 distinct endpoints.*

## 7. Additional Technical Requirements

### 7.1 Validation & Error Handling
- All request bodies validated with Zod schemas.
- Return structured errors with field-specific messages.
- Global error handler for uncaught exceptions.

### 7.2 Pagination, Filtering, Sorting
- List endpoints support `page`, `limit`, `sortBy`, `sortOrder`, and filters like `status`, `city`, `minRent`, etc.
- Search endpoints (e.g., `/properties/search?q=keyword`) using `ILIKE` for text search.

### 7.3 Rate Limiting & Security
- Apply `express-rate-limit` (e.g., 100 requests per 15 minutes) globally, stricter for auth endpoints.
- Helmet for security headers.
- CORS configured to allow only trusted origins (set in env).

### 7.4 Audit Logs
- Log all state-changing actions (status updates, role changes, property modifications).
- Store actor, target type, target ID, changes (JSON diff), IP, user-agent.

### 7.5 Database Transactions
- Use Prisma transactions for operations that involve multiple models (e.g., approving an application and updating room availability concurrently to avoid double-booking).

### 7.6 Soft Deletes
- All deletable models include `deletedAt`; queries exclude soft-deleted records by default using Prisma middleware or filter.

### 7.7 Documentation
- Provide Postman collection or Swagger/OpenAPI spec.
- Include sample request/response for each endpoint.

### 7.8 Deployment
- Deploy to Vercel (Serverless) or Render.
- Provide environment variables configuration.

## 8. Example API Request/Response

### POST `/api/v1/auth/login`
**Request:**
```json
{ "email": "john@example.com", "password": "securepass" }
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "usr_123", "email": "john@example.com", "role": "TENANT" },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### GET `/api/v1/properties?page=1&limit=10&city=Dhaka&minRent=5000`
**Response:**
```json
{
  "success": true,
  "message": "Properties retrieved",
  "data": {
    "items": [ ... ],
    "pagination": { "page": 1, "limit": 10, "total": 35, "pages": 4 }
  }
}
```

## 9. Final Notes
- Ensure all endpoints are tested with Postman/Thunder Client.
- All code must be typed (TypeScript).
- Follow RESTful naming conventions.
- Commit code regularly and provide a clear README.
