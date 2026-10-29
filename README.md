# RideX — Advanced Indian Ride-Hailing Platform 🛵🚕

![RideX Mobility Platform](https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80)

**RideX** is a complete, production-grade ride-booking web application inspired by the convenience and agility of Indian bike taxi platforms such as Rapido, alongside auto rickshaws and cabs. It features its own original brand identity, real Leaflet OpenStreetMap integrations, OSRM live routing, configurable Indian rupee fare formula (stored internally in paise), Socket.IO live tracking, a 7-palette theme customizer, Razorpay payment simulation adapter, customer/captain/admin portals, and a Prisma ORM database.

---

## 🚀 Key Features

### 1. Original Brand & Visual Design System
- **Brand Identity**: Electric Yellow (`#FFD500`), Deep Charcoal (`#151515`), crisp typography (`Outfit` & `Plus Jakarta Sans`).
- **7-Theme Customizer**:
  1. *Rapido Yellow & Dark* (Default Indian signature palette)
  2. *Ocean Blue & White*
  3. *Emerald Green & Cream*
  4. *Midnight Purple & Dark*
  5. *Sunset Orange & White*
  6. *Premium OLED Dark Mode*
  7. *Minimal Light Mode*
- Dynamic CSS variables with `localStorage` persistence and WCAG AA accessible contrast.
- Reduced-motion preference toggle.

### 2. High-Performance Indian Ride Booking Engine
- **9-Step Booking Workflow**: Pickup search, Drop search, Vehicle Category, OSRM live route calculation, Upfront Fare estimation in Rupees (`₹`), Payment selection, Review, Confirmation, and Live Ride Tracking.
- **4 Mobility Categories**:
  - 🛵 **Bike Taxi**: Fastest through peak Bengaluru traffic, 1 seat, sanitized helmet provided.
  - 🛺 **Auto Rickshaw**: Doorstep pickup, guaranteed standard rates, no meter haggling.
  - 🚗 **Cab Mini**: Compact AC hatchbacks for pocket-friendly comfort.
  - 🚘 **Prime Sedan**: Top-rated captains in premium sedans with extra legroom.
- **Configurable Fare Formula**:
  $$\text{estimated fare} = \max(\text{minimum fare}, \text{base fare} + \text{distance} \times \text{per-km rate} + \text{waiting charge}) \times \text{surge multiplier}$$
  - Handled safely on the backend with values stored as integer **paise** ($1\text{ INR} = 100\text{ paise}$).
- **Coupon & Promo Engine**:
  - `RIDEX50`: 50% OFF up to ₹50 on any ride
  - `FIRSTFREE`: Flat ₹60 OFF welcome credit
  - `RAPIDPASS`: 20% OFF office-hour commute pass
  - `WEEKEND30`: Flat ₹30 OFF auto rides

### 3. Live Maps & Telemetry
- Interactive Leaflet map with OpenStreetMap tiles.
- Nominatim geocoding autocomplete with curated Indian hubs (MG Road, Koramangala, Indiranagar, Bellandur, Whitefield, Kempegowda Airport, Majestic).
- GPS Locate Me button with browser permission handling.
- Real-time animated nearby vehicle markers in demo mode.
- Automatic route bounds fit-to-screen.

### 4. Live Ride Tracking & Captain Experience
- Real-time status progression:
  `REQUESTED` ➔ `SEARCHING` ➔ `DRIVER_ASSIGNED` ➔ `DRIVER_ARRIVING` ➔ `ARRIVED` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `CANCELLED`.
- Secure 4-digit ride OTP verification before starting trip.
- Contact captain interface (encrypted phone call & chat simulator).
- Safety SOS modal with official Indian emergency numbers: National Police Emergency (`112`), Women's Safety Helpline (`1090`), and RideX 24x7 desk (`1800-RIDEX-247`).
- Live trip URL sharing for family members.
- Instant fare receipt download & star rating submission.
- **Demo progression simulator**: Step through the entire ride lifecycle in real time.

### 5. Captain / Driver Console (`/driver`)
- Online/offline availability toggle.
- Incoming ride request queue with pickup/drop locations, distances, and 85% net earnings calculation.
- Trip management with OTP verification to start.
- External Google Maps navigation link.
- Daily & weekly earnings dashboard and ratings.

### 6. Admin Command Center (`/admin`)
- Operations KPI cards: Total users, drivers, rides, gross GMV, 15% platform commission, and payouts.
- Driver verification queue: Inspect driver documents (Driving License, RC book, Aadhaar) and approve or reject.
- Dynamic Fare Rules editor: Adjust base fare, per-km rate, min fare, and surge multiplier ($1.0\times$, $1.25\times$, $1.5\times$).
- Promotion & Coupon creation tool.
- Support tickets desk with status tracking.
- System activity audit logs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, React Router, Lucide React, Leaflet |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO, Helmet, CORS, Zod, bcryptjs, jsonwebtoken |
| **Database** | Prisma ORM, SQLite (`dev.db` for instant zero-config local run) and full PostgreSQL production schema (`schema.postgresql.prisma`) |
| **Testing** | Vitest, React Testing Library, Supertest, JSDOM |
| **Third-Party** | OSRM Routing, OpenStreetMap Nominatim, Razorpay Test Adapter |

---

## 🔑 Demo Accounts & Credentials

The database includes pre-seeded demo accounts ready for testing:

| Role | Email | Password | Details |
|---|---|---|---|
| **Customer** | `customer@ridex.in` | `Password123!` | Aarav Sharma (Saved addresses: Home, Work, Gym) |
| **Captain (Bike)** | `driver@ridex.in` | `Password123!` | Rajesh Kumar (Honda Activa 6G, KA-01-EQ-4421, 4.92⭐) |
| **Captain (Auto)** | `auto.driver@ridex.in` | `Password123!` | Suresh Gowda (Bajaj RE Auto, KA-03-AA-9988, 4.88⭐) |
| **Admin** | `admin@ridex.in` | `AdminPass123!` | RideX Operations Admin |

> 💡 **Quick Switcher**: Click the **⚡ Demo: Guest** pill in the top navbar to log in as any role with a single click!

---

## 📦 Getting Started

### Prerequisites
- Node.js `v18+` (Tested on `v22.20.0`)
- npm `v9+` (Tested on `v10.9.3`)

### 1. Installation
Clone the repository and install all root and workspace dependencies:
```bash
npm install
```

### 2. Environment Setup
The repository includes `.env.example` and configured `.env` files:
```bash
# Server configuration (server/.env)
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=ridex_super_secret_jwt_key_2026_production_grade_token
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_ridex_demo_key
RAZORPAY_KEY_SECRET=rzp_test_ridex_demo_secret
ENABLE_DEMO_MODE=true
OSRM_ROUTING_URL=https://router.project-osrm.org
NOMINATIM_GEOCODE_URL=https://nominatim.openstreetmap.org
```

### 3. Database Initialization & Seeding
Generate Prisma client and seed the local database:
```bash
# Push Prisma schema to SQLite database (dev.db)
npm run db:push

# Populate sample Indian mobility catalog, captains, and coupons
npm run db:seed
```

### 4. Running the Development Server
Start both backend (Port `5000`) and frontend (Port `5173`) concurrently:
```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Testing & Quality Assurance

Run the test suite across both server and client:
```bash
# Run all tests (Supertest API integration + Vitest React components)
npm run test

# Run backend API tests only
npm run test:server

# Run frontend tests only
npm run test:client

# Run TypeScript type checks
npm run lint
```

---

## 🏗️ Production Build

To produce optimized, minified production assets:
```bash
# Compiles server TypeScript and bundles Vite client into dist/
npm run build
```

To run the production server:
```bash
cd server
npm run start
```

---

## 🐘 PostgreSQL Production Migration

To point the backend to a production PostgreSQL database:
1. In `server/prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   *(A reference PostgreSQL schema is provided at `server/prisma/schema.postgresql.prisma`)*.
2. In `server/.env`, set your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ridex?schema=public"
   ```
3. Run migrations and seed:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed --workspace=server
   ```

---

## 💳 Payment Architecture & Razorpay Demo

- **Cash on Delivery**: Drivers collect cash upon trip completion.
- **Razorpay Sandbox / Simulated Mode**:
  - If live Razorpay API keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are present, server generates real Razorpay orders.
  - When test/demo keys are used (`ENABLE_DEMO_MODE=true`), the system generates deterministic order IDs and receipts (`RCPT-RX-...`), maintaining strict validation without storing raw card information.

---

## 📄 License
RideX Mobility Technologies India Pvt Ltd © 2026. Built with modern web standards for urban commuters.
#   R i d e X  
 