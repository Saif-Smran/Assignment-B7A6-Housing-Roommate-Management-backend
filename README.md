# Housing & Roommate Management Platform - Backend REST API

A scalable, secure backend REST API for a **Housing & Roommate Management Platform** built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

The platform connects property owners, tenants, and administrators in a unified ecosystem handling property listings, room management, roommate preference matching, booking workflows, rent tracking, utility bill splitting, maintenance requests, audit logging, and secure payment processing.

---

## 🚀 Tech Stack

| Category | Technology | Description / Usage |
| --- | --- | --- |
| **Runtime & Language** | Node.js, TypeScript | Type-safe REST API development |
| **Framework** | Express.js v5 | Modern routing and HTTP middleware |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational data layer with transactions & indexing |
| **Validation** | Zod | Strict schema validation for incoming requests |
| **Code Quality** | Biome | Linting and code formatting |
| **Auth & Security** | JWT (jsonwebtoken), bcryptjs, Helmet, CORS | Role-based authentication & route protection |
| **Rate Limiting** | express-rate-limit | Abuse prevention & security throttling |
| **Caching** | Redis (optional) | Caching and temporary state storage |
| **File Storage** | Multer & Cloudinary | Property image & document uploads |
| **Payments** | bKash / Stripe / SSLCommerz | Payment processing for rent, deposits & utilities |
| **Email Service** | Nodemailer | Transactional email notifications |

---

## ✨ Key Features

- **Multi-Role Access Control**: Strictly enforced `TENANT`, `OWNER`, and `ADMIN` permissions via custom middleware.
- **Property & Room Management**: Full CRUD operations for buildings, flats, and individual rooms with filtering, search (ILIKE), and pagination.
- **Booking & Application Workflow**: Tenants apply for rooms; owners approve or reject applications with atomic database transactions to prevent double-booking.
- **Real Payment Processing**: Gateway integrations for bKash, Stripe, and SSLCommerz handling rent, security deposits, and utility bills.
- **Utility Bill Splitting**: Create monthly utility bills for properties and track split payments per tenant.
- **Maintenance Requests**: Booked tenants can submit maintenance requests with priority levels and tracking.
- **Viewing Requests**: Schedule property viewings with status confirmation workflows.
- **Audit Logging & Soft Deletes**: Deletable models support `deletedAt` soft deletes; critical state changes generate structured audit logs.

---

## 🛠️ Project Structure

```text
├── src/
│   ├── app.ts            # Express application setup, middlewares, global error handler
│   ├── server.ts         # Server entry point & graceful shutdown process handlers
│   └── config/
│       └── index.ts      # Centralized environment configuration loader
├── prisma/               # Database schema & migrations
├── .env.example          # Template for environment variables
├── .gitignore            # Git ignore definitions
├── biome.json            # Biome linting and formatting configuration
├── package.json          # Package dependencies & scripts
├── tsconfig.json         # TypeScript compiler options
└── REQUIREMENTS.md       # Full API specifications document
```

---

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher
- **Redis** *(optional, for caching)*

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd B7A6
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and adjust your variables:
   ```bash
   cp .env.example .env
   ```

4. **Run Prisma Migrations**:
   ```bash
   npx prisma db push
   # or for migration history:
   npx prisma migrate dev
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`.

---

## ⚙️ NPM Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `tsx watch src/server.ts` | Runs the API in watch mode for development |
| `npm run build` | `tsc` | Compiles TypeScript source to `./dist` |
| `npm run start` | `node dist/src/server.js` | Runs the compiled production code |
| `npm run lint:check` | `npx @biomejs/biome lint ./src` | Checks code against Biome linter rules |
| `npm run lint:fix` | `npx @biomejs/biome lint --write ./src` | Fixes linting errors automatically |
| `npm run format:check` | `npx @biomejs/biome format ./src` | Checks code formatting |
| `npm run format:fix` | `npx @biomejs/biome format --write ./src` | Formats source files with Biome |

---

## 🔑 Environment Variables Reference

| Variable | Default Value | Description |
| --- | --- | --- |
| `PORT` | `5000` | Port for the Express server |
| `NODE_ENV` | `development` | Environment (`development` or `production`) |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | — | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | — | Secret key for JWT refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | `1d` | Token validity duration |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token validity duration |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed origin for CORS |

---

## 📄 Documentation & API Specification

For detailed endpoint documentation, schema definitions, and request/response payloads, please refer to:
- [`REQUIREMENTS.md`](file:///d:/NEXT%20LEVEL%20WEB%20DEVELOPMENT/Assignment/B7A6/REQUIREMENTS.md)

---

## 📄 License

This project is licensed under the ISU / Academic Assignment License.
