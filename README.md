# SewMumbai

Full-stack marketplace to discover and book Mumbai-based tailors by locality.

## Stack

- **Monorepo:** `client/` + `server/`
- **Client:** Vite, React 18, React Router, Axios, Tailwind CSS
- **Server:** Express (ES modules), Mongoose, JWT, bcryptjs, express-validator
- **Database:** MongoDB

Brand: navy `#0B1D36` + saffron `#E07A3D`, fonts Outfit + Fraunces.

## Prerequisites

- Node.js 18+
- MongoDB running locally (default `mongodb://127.0.0.1:27017/sew-mumbai`)

## Setup

```bash
# From repo root
npm run install:all

# Or separately:
npm install
npm install --prefix server
npm install --prefix client
```

Copy env if needed (a local `.env` is already provided for development):

```bash
cp server/.env.example server/.env
```

### Environment (`server/.env`)

| Variable       | Description                          | Example                                      |
|----------------|--------------------------------------|----------------------------------------------|
| `PORT`         | API port                             | `5000`                                       |
| `MONGODB_URI`  | Mongo connection string             | `mongodb://127.0.0.1:27017/sew-mumbai`       |
| `JWT_SECRET`   | Secret for signing JWTs              | long random string                           |
| `CLIENT_URL`   | CORS origin for the Vite app         | `http://localhost:5173`                      |

## Seed data

```bash
npm run seed
npm run seed:live          # scrape/seed live tailor directory listings
```

### Seed accounts

| Role     | Email                         | Password       | Notes                |
|----------|-------------------------------|----------------|----------------------|
| Admin    | `admin@sewmumbai.com`         | `Admin123!`    | Approvals dashboard  |
| Customer | `customer@sewmumbai.com`      | `Customer123!` | Bookings + reviews   |
| Tailor   | `tailor@sewmumbai.com`        | `Tailor123!`   | Approved in Bandra   |
| Tailor   | `pending.tailor@sewmumbai.com`| `Tailor123!`   | Pending approval     |

Seed also creates sample services, bookings, and one review.

## Run

```bash
# API + Vite together
npm run dev

# Or individually
npm run dev:server
npm run dev:client
```

- App: http://localhost:5173  
- API: http://localhost:5000/api  
- Vite proxies `/api` → `http://localhost:5000`

## Deploy to Vercel (demo)

The app is configured for a **single Vercel project**: static React build + `/api` serverless Express.

### 1. MongoDB Atlas
1. Create a free Atlas cluster and database user
2. Allow network access `0.0.0.0/0` (or Vercel IPs)
3. Copy the connection string, e.g. `mongodb+srv://USER:PASS@cluster/.../sew-mumbai`

### 2. Seed Atlas (from your machine)
```bash
# In server/.env point MONGODB_URI at Atlas, then:
npm run seed --prefix server
```

### 3. Vercel project env vars
| Name | Value |
|------|--------|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | long random secret |
| `CLIENT_URL` | your Vercel URL (e.g. `https://sew-mumbai.vercel.app`) |

Optional: `VITE_API_URL` — leave unset so the client uses same-origin `/api`.

### 4. Deploy
```bash
npx vercel
# production:
npx vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard (root directory = repo root; `vercel.json` is already set).

## Roles & flows

1. **Customer** — search by locality, book approved services, cancel, review completed jobs  
2. **Tailor** — manage profile/portfolio/services (new services pending), accept/reject/complete bookings  
3. **Admin** — approve or reject pending tailor profiles and services  

## API overview (`/api`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/register` | Public | Register customer or tailor |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/become-tailor` | Customer | Upgrade account to tailor + create profile |
| GET | `/auth/me` | Auth | Current user (+ tailor profile) |
| GET | `/localities` | Public | Mumbai localities list |
| GET | `/tailors/search?locality=&specialty=&q=` | Public | Locality aggregation search |
| GET | `/tailors?locality=&specialty=&q=` | Public | Same search (compat) |
| GET | `/tailors/:id` | Public | Profile + approved services + reviews |
| POST | `/tailors/profile` | Tailor | Create profile (pending approval) |
| GET/PUT | `/tailors/me` | Tailor | Own profile |
| POST | `/tailors/me/portfolio` | Tailor | Add portfolio item (file upload as base64 `imageData`) |
| PUT | `/tailors/me/photo` | Tailor | Upload workshop profile photo (`imageData`) |
| DELETE | `/tailors/me/portfolio/:itemId` | Tailor | Remove portfolio item |
| GET/POST | `/services` | Tailor | List / create (pending) |
| PUT/DELETE | `/services/:id` | Tailor | Update (re-pending) / delete |
| POST | `/bookings` | Customer | Create booking request (optional `measurementId`) |
| GET | `/measurements/templates` | Public | Blouse, shirt, pants measurement guides |
| GET/POST | `/measurements/me` | Customer | List / save measurement profiles |
| PUT/DELETE | `/measurements/me/:id` | Customer | Update / delete saved profile |
| GET | `/bookings/me` | Auth | Role-aware booking list |
| PUT/PATCH | `/bookings/:id/status` | Auth | Accept/reject/complete/cancel |
| POST | `/reviews` | Customer | Review completed booking |
| GET | `/admin/pending` | Admin | Pending tailors & services |
| PATCH | `/admin/tailors/:id/approve` | Admin | `{ approved: true\|false }` |
| PATCH | `/admin/services/:id/approve` | Admin | `{ approved: true\|false }` |
| GET | `/users` | Admin | List users |
| GET | `/health` | Public | Health check |

Send `Authorization: Bearer <token>` for protected routes.

## Project layout

```
sew-mumbai/
├── .cursorrules
├── package.json          # concurrently scripts
├── README.md
├── client/               # Vite React + Tailwind
└── server/
    ├── .env.example
    └── src/
        ├── index.js          # boot: DB + listen
        ├── server.js         # Express app + route registration
        ├── seed.js
        ├── scripts/
        │   └── seedLiveTailors.js
        ├── config/
        ├── constants/
        ├── models/
        ├── middleware/
        ├── controllers/
        └── routes/
            ├── authRoutes.js
            ├── tailorRoutes.js
            ├── bookingRoutes.js
            └── …
```

## Notes

- Tailor registration creates a `TailorProfile` with `approvalStatus: pending`
- Only approved tailors/services appear in public search and booking flows
- One review per booking; completing a booking unlocks the review form
