# GuitarShop - Guitar Accessories E-Commerce

A full-stack e-commerce application for guitar accessories, pedals, strings, and parts.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, React Router v7
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT with HttpOnly cookies
- **Security**: Helmet, rate limiting, CORS, compression
- **SEO**: react-helmet-async, Open Graph, sitemap, robots.txt

## Project Structure

```
projectv1/
  client/              # React frontend (Vite)
    public/            # Static assets (robots.txt, sitemap.xml, favicon)
    src/
      components/      # Reusable UI components (SEO, PageLoader, etc.)
      pages/           # Route pages
        admin/         # Admin dashboard pages
      hooks/           # Custom React hooks
      stores/          # Zustand state stores
      lib/             # API client, validators
      types/           # TypeScript type definitions
    Dockerfile         # Multi-stage Docker build (nginx)
    nginx.conf         # Production nginx configuration
  server/              # Express backend
    src/
      controllers/     # Route handlers
      routes/          # API route definitions
      middleware/       # Auth, validation, error handling
      utils/           # Prisma client singleton
    prisma/            # Database schema, migrations & seeds
    Dockerfile         # Multi-stage Docker build
  docker-compose.yml   # Full-stack Docker Compose
  README.md
```

## Getting Started

### Prerequisites

- Node.js 22+ (LTS recommended)
- PostgreSQL running locally (or a connection string)

### 1. Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 2. Set up the database

```bash
cd server

# Copy environment template and fill in your values
cp .env.example .env
# Edit .env with your PostgreSQL connection string and secrets

# Run migrations and seed:
npx prisma migrate dev --name init
npm run prisma:seed
```

### 3. Start development servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to the backend at `http://localhost:3000`.

## Docker Deployment

### Quick Start (Docker Compose)

```bash
# Start the entire stack (PostgreSQL + Backend + Frontend)
docker compose up --build -d

# Run database migrations
docker compose exec server npx prisma migrate deploy

# Seed the database (optional)
docker compose exec server npx prisma db seed
```

The app will be available at `http://localhost` (port 80).

### Individual Containers

```bash
# Build and run the backend
cd server
docker build -t guitarshop-server .
docker run -p 3000:3000 --env-file .env guitarshop-server

# Build and run the frontend
cd client
docker build -t guitarshop-client .
docker run -p 80:80 guitarshop-client
```

### Cloud Deployment

**Recommended platforms:**

| Service | Use for | Notes |
|---------|---------|-------|
| **Vercel** | Frontend | Connect your repo; auto-deploys on push |
| **Railway / Render** | Backend | Supports Dockerfile; add env vars in dashboard |
| **Neon / Supabase** | PostgreSQL | Serverless Postgres with generous free tiers |

**Environment variables for production:**

```bash
DATABASE_URL=postgresql://...        # Your cloud PostgreSQL URL
JWT_SECRET=<random-32-char-string>   # Generate with: openssl rand -hex 32
JWT_REFRESH_SECRET=<random-string>   # Generate with: openssl rand -hex 32
PORT=3000
NODE_ENV=production
CLIENT_URL=https://your-domain.com   # Comma-separated if multiple
```

## Available Scripts

### Client

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Server

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run prisma:migrate` | Run database migrations (dev) |
| `npm run prisma:migrate:prod` | Deploy migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed the database |

## Security

- **Helmet.js** — sets HTTP security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
- **Rate limiting** — 100 req/15min general, 20 req/15min for auth endpoints
- **CORS** — origin whitelist with credential support
- **Compression** — gzip/brotli response compression
- **JWT** — short-lived access tokens (15 min) + refresh tokens (7 days) via HttpOnly cookies
- **Input validation** — Zod schemas on all endpoints
- **Environment validation** — server refuses to start without required env vars

## Performance

- **Route-based code splitting** — React.lazy + Suspense for all page components
- **Vendor chunk splitting** — Vite manual chunks (react, query, UI, forms)
- **Response compression** — gzip via Express compression middleware and nginx
- **Static asset caching** — immutable hashed assets cached for 1 year (nginx)
- **React Query caching** — 5-minute stale time, 30-minute garbage collection
