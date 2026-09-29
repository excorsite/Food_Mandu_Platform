# DigitalMandu Platform

> Food ordering & eCommerce platform — from university MIS project to production-oriented full-stack system.

DigitalMandu Platform evolved from a university eCommerce and Management Information System project into an independently developed full stack platform.

What started as an academic project became an opportunity to continue learning, improving, and applying real world software engineering practices beyond the university environment.

Over time, the system was continuously refined through multiple development iterations. The frontend and backend were restructured, dependencies were cleaned up, performance was improved, and outdated implementations were replaced with more maintainable solutions. Security, reliability, code organization, and long term maintainability also became major areas of focus during the evolution of the project.

Rather than treating the original submission as a finished product, the project was gradually improved to address technical debt, architectural limitations, and implementation weaknesses that became apparent through experience and continued development.

Today, this repository represents more than the original academic project. It reflects a long term effort to understand an existing system, identify its limitations, and systematically improve it through engineering decisions and practical experience.

The current platform is the result of continuous refinement, architectural improvements, backend and frontend modernization, performance optimization, and ongoing independent development. The goal has always been to build a more reliable, maintainable, and production oriented system while creating a stronger foundation for future growth.

### Engineering Evolution

The project evolved through several major stages:

- Initial university MIS and eCommerce project
- Architecture review and system redesign
- Backend modernization and optimization
- Frontend re-engineering and UI improvements
- Technical debt reduction and codebase cleanup
- Performance and reliability improvements
- Production readiness and maintainability enhancements
- Continued independent development and refinement

As a result, DigitalMandu Platform is not simply a refreshed version of an older project. It represents the progression of a system that has been continuously improved through practical experience, iteration, and long term ownership.

---

## Stack

| Layer    | Tech                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Frontend | React 19 + Vite 6, React Router 7, Zustand 4, TanStack Query 5, Tailwind CSS 3, Axios, React Hot Toast |
| Backend  | Node.js + Express 4, Mongoose 8, JWT, bcryptjs, Multer, Nodemailer, Socket.IO                          |
| Database | MongoDB (local `digitalmandu` / Atlas)                                                                 |

## Monorepo Layout

```
Food-Order/
├── Backend/               # Express API
│   ├── controller/        # auth / product / order / cart / payment / review
│   ├── routes/            # /api/* routes
│   ├── models/            # User, Product, Order, Review
│   ├── middlewares/       # isAuthenticated (user_auth_token), restrict, multer
│   ├── database/          # mongoose connect
│   ├── seed.js            # local DB seeder
│   └── .env.example
├── Frontend/              # Vite + React
│   ├── src/api/           # client.js, config.js, endpoints/*, hooks.js
│   ├── src/store/         # authStore, cartStore, uiStore (Zustand)
│   ├── src/pages/         # buyer / seller / admin / payment
│   ├── src/components/layout/ # AppShell, Header, Sidebar, Footer
│   ├── src/components/common/ # Button, InputField, Modal, etc.
│   ├── src/routes.jsx     # createBrowserRouter + lazy + ProtectedRoute
│   └── .env.example
└── README.md
```

## Features

- **Buyer:** browse products, cart, checkout (COD / Khalti), order history, profile, reviews.
- **Seller/Admin:** product CRUD (multer upload), order management (`/getOrdersAsAnAdmin`, `/updateOrdersAsAnAdmin`), user management.
- **Auth:** JWT via `user_auth_token` header, role guard (`customer` / `admin`), OTP flow.
- **Realtime:** Authenticated Socket.IO events refresh buyer, seller, and admin order views when order status changes.

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ running locally (`mongod --dbpath <path>` or MongoDB Compass / service)

### 1. Backend

```bash
cd Backend
cp .env.example .env   # edit MONGO_URI, SECRET_KEY, EMAIL_*
npm install
npm run seed           # creates admin/customer/seller + 8 products + demo order
# npm run seed:reset  # drop & reseed
npm run dev            # http://localhost:3000
```

Seeded accounts:

| Email                       | Password     | Role     |
| --------------------------- | ------------ | -------- |
| admin@digitalmandu.local    | Admin@123    | admin    |
| customer@digitalmandu.local | Customer@123 | customer |
| seller@digitalmandu.local   | Seller@123   | seller   |

`Backend/.env` for local dev:

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/digitalmandu
SECRET_KEY=local_dev_secret_change_in_production
```

### 2. Frontend

```bash
cd Frontend
cp .env.example .env.local   # set VITE_API_BASE_URL if needed
npm install --legacy-peer-deps
npm run dev                  # http://localhost:5173 (proxies /api -> :3000)
npm run build                # production build -> dist/
```

`Frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Environment Variables

Never commit `.env` / `.env.local`. Commit only `.env.example`.

**Backend** (`Backend/.env`): `PORT`, `MONGO_URI` (or `Mongo_URI` legacy), `SECRET_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `DOMAIN`, `BACKEND_URL`, `FRONTEND_URL`

**Frontend** (`Frontend/.env.local`): `VITE_API_BASE_URL`, `VITE_KHALTI_PUBLIC_KEY`, `VITE_SESSION_TIMEOUT`

Root + subproject `.gitignore` already cover `node_modules/`, `.env*`, `dist/`, `uploads/`, `logs`.

## API Overview

Base: `http://localhost:3000/api`

| Method       | Path                 | Auth     | Description                |
| ------------ | -------------------- | -------- | -------------------------- |
| POST         | /register            | no       | Register                   |
| POST         | /login               | no       | Login -> token             |
| GET          | /products            | no       | List products              |
| GET          | /products/:id        | no       | Product detail             |
| POST         | /add_product         | admin    | Create product (multipart) |
| PATCH/DELETE | /products/:id        | admin    | Update/delete              |
| GET/POST     | /cart                | customer | Cart                       |
| POST         | /orders              | customer | Place order                |
| GET          | /orders              | customer | My orders                  |
| GET          | /getOrdersAsAnAdmin  | admin    | All orders                 |
| POST         | /payment/khalti/init | customer | Khalti init                |
| GET          | /profile/:id         | auth     | Profile                    |

Auth header: `user_auth_token: <jwt>` (see `Backend/middlewares/isAuthenticated.js`).

## Scripts

| Location | Command              | Purpose       |
| -------- | -------------------- | ------------- |
| Backend  | `npm run dev`        | nodemon       |
| Backend  | `npm run seed`       | seed local DB |
| Backend  | `npm run seed:reset` | drop & reseed |
| Frontend | `npm run dev`        | Vite dev      |
| Frontend | `npm run build`      | Vite build    |

## Security Notes

- `.env` files are gitignored at root, Backend and Frontend. Rotate any previously exposed Atlas URI / Gmail app password.
- `SECRET_KEY` must be a strong random string in production.
- HTTP and Socket.IO CORS use `FRONTEND_URL`; configure it to the exact frontend origin in production.
- Uploaded files in `Backend/uploads/` are gitignored and served statically.

## Cleanup Performed (2026-09)

- Removed dead legacy frontend: `src/http`, `src/globals`, duplicate pages (`Cart`, `Home`, `Place Order`, `checkout`, `khalti`, `orders`, `productDetails`, `profile`, `success`), legacy `AppDownload/ExploreMenu/FoodDisplay/FoodItem/Footer/Header/LoginPopup/Navbar` wrappers and `PopMessage/SEO` stubs.
- Migrated API layer to `src/api/*` + Zustand + TanStack Query, `src/routes.jsx` with lazy + `ProtectedRoute`.
- Hardened `.gitignore` (root + Backend + Frontend) and sanitized `Backend/.env` to local MongoDB.

## License

ISC — for learning / portfolio use.
