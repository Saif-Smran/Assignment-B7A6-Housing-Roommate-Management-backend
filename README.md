# Housing & Roommate Management Platform - Backend REST API

A scalable, secure backend REST API for a **Housing & Roommate Management Platform** built with Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Stripe.

The platform connects property owners, tenants, and administrators in a unified ecosystem handling property listings, room management, application & booking workflows, rent tracking, maintenance requests, viewing requests, audit logging, Vercel Cron background automation, and secure payment processing.

---

## 🚀 Tech Stack

| Category | Technology | Description / Usage |
| --- | --- | --- |
| **Runtime & Language** | Node.js, TypeScript | Type-safe REST API development |
| **Framework** | Express.js v5 | Modern routing and HTTP middleware |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational data layer with transactions & indexing |
| **Build & Bundle** | TSUP | Fast, zero-config TypeScript bundler targeting ESNext ESM |
| **Validation** | Zod | Strict schema validation for incoming requests |
| **Code Quality** | Biome (`@biomejs/biome`) | Linting and code formatting |
| **Auth & Security** | JWT (`jsonwebtoken`), `bcryptjs`, Google OAuth 2.0 (`google-auth-library`), CORS, `cookie-parser` | Role-based access control & OAuth authentication |
| **Automation & Cron** | Vercel Cron Jobs | Stateless background payment cleanup (`/api/cron`) |
| **Caching & Store** | Redis (`redis`) | External state store & caching |
| **File Storage** | Multer (`memoryStorage`) & Cloudinary | Ephemeral memory uploads directly to Cloudinary cloud storage |
| **Payments** | Stripe (`stripe`) | Payment processing & raw webhook handling for rent and security deposits |
| **PDF Generation** | PDFKit (`pdfkit`) | Document & invoice generation |
| **Email Service** | Nodemailer (`nodemailer`) | Transactional email notifications |

---

## ✨ Key Features

- **Multi-Role Access Control**: Strictly enforced `TENANT`, `OWNER`, and `ADMIN` permissions via custom JWT middleware.
- **Google OAuth 2.0 Integration**: Single Sign-On (SSO) login/registration via Google ID tokens.
- **Property & Room Management**: Full CRUD operations for properties and individual rooms with filtering, search (`ILIKE`), and pagination.
- **Booking & Application Workflow**: Tenants apply for rooms; owners approve or reject applications with atomic database transactions to prevent double-booking.
- **Stripe Payment Gateway Integration**: Automated checkout sessions and raw webhook event handler (`/api/payments/webhook`) for rent & deposit transactions.
- **Vercel Cron Automation**: Serverless background task (`/api/cron`) executed daily to automatically fail stale pending payments older than 24 hours.
- **Maintenance Requests**: Booked tenants submit maintenance requests with priority levels and tracking.
- **Viewing Requests**: Schedule property viewings with status confirmation workflows.
- **Audit Logging & Soft Deletes**: Deletable models support `deletedAt` soft deletes; critical state changes generate structured audit logs.

---

## 🛠️ Project Structure

```text
├── src/
│   ├── app.ts                  # Express application setup, middlewares, global error handler
│   ├── server.ts               # Server entry point & graceful shutdown handlers
│   ├── generated/              # Generated Prisma Client exports
│   └── app/
│       ├── config/             # Environment & configuration loader
│       ├── lib/                # Utility clients (cron, prisma, cloudinary, stripe, multer)
│       ├── middleware/         # Auth, validation & global error handling middlewares
│       ├── modules/            # Domain API modules
│       │   ├── admin/          # Admin management & system stats
│       │   ├── application/    # Room application workflow
│       │   ├── auth/           # Login, register, Google OAuth, tokens
│       │   ├── maintenance/    # Maintenance request management
│       │   ├── payment/        # Stripe payments & webhooks
│       │   ├── property/       # Property listings & search
│       │   ├── room/           # Room management
│       │   ├── user/           # User profile & roles
│       │   └── viewing/        # Viewing schedule requests
│       └── utils/              # Shared helpers (catchAsync, sendResponse, seed)
├── prisma/                     # Database schema & migrations
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore definitions
├── biome.json                  # Biome linting and formatting configuration
├── vercel.json                 # Vercel serverless build & cron job configuration
├── tsup.config.ts              # TSUP build configuration
├── package.json                # Package dependencies & scripts
├── tsconfig.json               # TypeScript compiler options
└── REQUIREMENTS.md             # Full API specifications document
```

---

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher

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
   Copy `.env.example` to `.env` and fill in your variables:
   ```bash
   cp .env.example .env
   ```

4. **Run Prisma Migrations & Generation**:
   ```bash
   npx prisma db push
   # or for migration history:
   npx prisma migrate dev
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

The API will start at `http://localhost:5000`.

---

## ⚙️ NPM Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `tsx watch src/server.ts` | Runs the API in watch mode for development |
| `npm run build` | `tsup` | Bundles TypeScript source to `./dist` using TSUP |
| `npm run start` | `node dist/server.js` | Runs the compiled production code |
| `npm run lint:check` | `npx @biomejs/biome lint ./src` | Checks code against Biome linter rules |
| `npm run lint:fix` | `npx @biomejs/biome lint --write ./src` | Fixes linting errors automatically |
| `npm run format:check` | `npx @biomejs/biome format ./src` | Checks code formatting |
| `npm run format:fix` | `npx @biomejs/biome format --write ./src` | Formats source files with Biome |

---

## 🔑 Environment Variables Reference

| Variable | Description |
| --- | --- |
| `PORT` | Port for the Express server (default `5000`) |
| `NODE_ENV` | Environment (`development` or `production`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token duration (e.g. `1d`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token duration (e.g. `7d`) |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds (default `10`) |
| `BACKEND_URL` | Absolute URL of backend API |
| `FRONTEND_URL` | Allowed frontend origin for CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Redis connection configuration |
| `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_SENDER` | Nodemailer SMTP details |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Cloudinary account credentials |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLIC_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe API credentials and webhook secret |
| `CRON_SECRET` | Secret token to authorize manual cron executions |

---

## ⚡ Vercel Cron & Serverless Deployment

This repository is optimized for Vercel Serverless Functions:
- **Build Output**: `tsup` bundles `src/server.ts` into a single ESM file at `dist/server.js`, exporting the Express `app`.
- **Vercel Cron Setup**: Configured in `vercel.json` to trigger `/api/cron` daily at `00:00 UTC`:
  ```json
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 0 * * *"
    }
  ]
  ```
- **Deployment**:
  ```bash
  vercel --prod
  ```

---

## 📄 License

This project is licensed under the ISU / Academic Assignment License.
