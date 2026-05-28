# MOVEBOX API

A comprehensive movie marketplace REST API built with NestJS, TypeORM, and MySQL. The platform supports multiple user roles, wallet transactions, movie purchases with revenue splitting, and automated background workers.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Wallet System](#wallet-system)
- [Movie Purchase Flow](#movie-purchase-flow)
- [Background Workers](#background-workers)

---

## Overview

MOVEBOX is a movie marketplace where:

- **Superadmin** manages the platform and other admins
- **Admins** upload and manage movies on behalf of the platform
- **Authors** upload and sell their own movies
- **Customers** browse, purchase, and watch movies using their wallet

---

## Tech Stack

- **Framework:** NestJS
- **Database:** MySQL
- **ORM:** TypeORM
- **Authentication:** JWT (Passport.js)
- **Documentation:** Swagger/OpenAPI
- **Scheduling:** @nestjs/schedule (node-cron)
- **Validation:** class-validator, class-transformer
- **Security:** helmet, compression, bcrypt

---

## Architecture

```
src/
├── common/               # Shared utilities, guards, decorators
│   ├── decorators/       # Custom decorators (Roles, CurrentUser)
│   ├── guards/           # JWT guards, RolesGuard
│   ├── error/            # AppError class
│   └── utils/            # Helpers, ResponseFormat
├── database/
│   ├── entities/         # TypeORM entities
│   ├── repositories/     # Custom repositories
│   ├── enums/            # Database enums
│   └── seeder/           # Database seeders
└── modules/
    ├── admin-auth/       # Admin authentication
    ├── user-auth/        # User authentication
    ├── manage-admin/     # Admin management
    ├── user/             # User management
    ├── wallet/           # Wallet operations
    ├── ledger/           # Transaction ledger
    ├── movie/            # Movie management & purchases
    └── cron-job/         # Background workers
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- MySQL 8+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/danssy93/movie-marketplace-api.git
cd movie-marketplace-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database seeder
npx ts-node src/database/seeder/seed-up.ts seed-up

# Start the development server
npm run start:dev
```

---

## Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=movie_api

# JWT Secrets
ACCESS_SECRET=your_access_secret
REFRESH_SECRET=your_refresh_secret
ACCESS_EXPIRY_TIME=1d
REFRESH_EXPIRY_TIME=7d

# App
PORT=3000
```

---

## Database Setup

### Run Seeder

The seeder creates the superadmin account and platform wallet:

```bash
npx ts-node src/database/seeder/seed-up.ts seed-up
```

### Default Superadmin Credentials

### Wipe Database

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE movie_transactions;
TRUNCATE TABLE movies;
TRUNCATE TABLE ledger;
TRUNCATE TABLE wallet;
TRUNCATE TABLE users;
TRUNCATE TABLE admin;
SET FOREIGN_KEY_CHECKS = 1;
```

Then re-run the seeder.

---

## API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api
```

### Authorization

The API uses two separate JWT auth schemes:

- **AdminJWT** — for admin routes (superadmin, admin)
- **CustomerJWT** — for user routes (author, customer)

---

## Modules

### Admin Auth (`/api/auth/admin`)

| Method | Endpoint         | Description         | Auth     |
| ------ | ---------------- | ------------------- | -------- |
| POST   | `/login`         | Admin login         | Public   |
| POST   | `/refresh-token` | Refresh admin token | AdminJWT |
| POST   | `/logout`        | Admin logout        | AdminJWT |

### User Auth (`/api/auth/user`)

| Method | Endpoint         | Description        | Auth        |
| ------ | ---------------- | ------------------ | ----------- |
| POST   | `/login`         | User login         | Public      |
| POST   | `/refresh_token` | Refresh user token | CustomerJWT |
| POST   | `/logout`        | User logout        | CustomerJWT |

### Manage Admin (`/api/admin`)

| Method | Endpoint  | Description      | Auth     | Role              |
| ------ | --------- | ---------------- | -------- | ----------------- |
| POST   | `/create` | Create new admin | AdminJWT | ADMIN, SUPERADMIN |
| GET    | `/id`     | Get admin by ID  | AdminJWT | ADMIN             |
| PATCH  | `/:id`    | Update admin     | AdminJWT | ADMIN             |

### Users (`/api/users`)

| Method | Endpoint    | Description                 | Auth        |
| ------ | ----------- | --------------------------- | ----------- |
| POST   | `/register` | Register customer or author | Public      |
| GET    | `/profile`  | Get user profile            | CustomerJWT |

### Wallet (`/api/wallet`)

| Method | Endpoint  | Description | Auth        | Role     |
| ------ | --------- | ----------- | ----------- | -------- |
| POST   | `/credit` | Fund wallet | CustomerJWT | CUSTOMER |

### Movies (`/api/movies`)

| Method | Endpoint           | Description              | Auth        | Role     |
| ------ | ------------------ | ------------------------ | ----------- | -------- |
| POST   | `/upload/admin`    | Upload movie as admin    | AdminJWT    | ADMIN    |
| POST   | `/upload/author`   | Upload movie as author   | CustomerJWT | AUTHOR   |
| GET    | `/movies`          | Get all published movies | Public      |
| PATCH  | `/status/:movieId` | Update movie status      | AdminJWT    | ADMIN    |
| POST   | `/purchase`        | Purchase a movie         | CustomerJWT | CUSTOMER |

---

## Authentication

The API uses two separate JWT strategies:

### Admin JWT Strategy (`admin-jwt`)

- Used for all admin-related endpoints
- Validates against the `admin` table
- Requires `AdminJWT` bearer token

### Customer JWT Strategy (`customer-jwt`)

- Used for all user-related endpoints (authors and customers)
- Validates against the `users` table
- Requires `CustomerJWT` bearer token

---

## Role-Based Access Control

The platform has two separate role systems:

### Admin Roles (`AdministratorType`)

```
SUPERADMIN → full access to everything
ADMIN      → manage movies, create other admins
CASHIER    → financial operations
SUPPORT    → customer support
ACCOUNT    → accounting
```

### User Roles (`Role`)

```
AUTHOR   → upload movies, receive earnings
CUSTOMER → purchase and watch movies
```

### How it works

```
Request comes in
      ↓
JWT Guard validates token
      ↓
RolesGuard checks user roles
      ↓
SUPERADMIN? → allow everything
      ↓
Has required role? → allow
      ↓
No role match → 403 Forbidden
```

---

## Wallet System

Every user has a wallet created automatically on registration:

```
Customer registers → Customer wallet created (balance: 0)
Author registers   → Author wallet created (balance: 0)
Platform           → Platform wallet created via seeder
```

### Wallet Operations

**Credit Wallet (Fund)**

```json
POST /api/wallet/credit
{
  "amount": 5000
}
```

**Debit Wallet** — happens automatically during movie purchase.

### Transaction Safety

All wallet operations use database transactions with rollback on failure:

```
Start Transaction
      ↓
Debit customer wallet
      ↓
Credit author wallet
      ↓
Credit platform wallet
      ↓
All success? → Commit ✅
Any failure? → Rollback ❌ (all changes undone)
```

---

## Movie Purchase Flow

```
Customer requests purchase
      ↓
Validate: movie exists & is PUBLISHED
      ↓
Validate: not already purchased
      ↓
Validate: sufficient wallet balance
      ↓
Calculate revenue split:
  Author uploaded  → Author: 70%, Platform: 30%
  Admin uploaded   → Platform: 100%
      ↓
Debit customer wallet
      ↓
Credit author wallet (if applicable)
      ↓
Credit platform wallet
      ↓
Create MovieTransaction record
      ↓
Record in Ledger (3 entries)
      ↓
Return purchase receipt ✅
```

### Revenue Split Example

```
Movie price: ₦2000

Author uploaded:
  Customer pays:    ₦2000
  Author receives:  ₦1400 (70%)
  Platform receives: ₦600 (30%)

Admin uploaded:
  Customer pays:    ₦2000
  Platform receives: ₦2000 (100%)
```

---

## Background Workers

The platform runs two cron jobs every 2 minutes:

### 1. Refund Failed Transactions

Finds all failed movie transactions and refunds the customer:

```
Find failed transactions (status: FAILED, is_resolved: false)
      ↓
Check if already refunded
      ↓
Credit customer wallet with original amount
      ↓
Mark transaction as REFUNDED & is_resolved: true
```

### 2. Requery In-Progress Transactions

Finds all stuck IN_PROGRESS transactions and retries them.

---

## Entities

| Entity             | Description                               |
| ------------------ | ----------------------------------------- |
| `Admin`            | Platform administrators                   |
| `User`             | Authors and customers                     |
| `Wallet`           | User wallets (customer, author, platform) |
| `Ledger`           | All financial transaction records         |
| `Movie`            | Movie catalog                             |
| `MovieTransaction` | Movie purchase records                    |

---

## Error Handling

All errors are returned in a consistent format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:

- `400` Bad Request (validation errors, insufficient balance)
- `401` Unauthorized (invalid or expired token)
- `403` Forbidden (insufficient permissions)
- `404` Not Found
- `409` Conflict (duplicate purchase, existing user)
- `500` Internal Server Error

---

## License

MIT
