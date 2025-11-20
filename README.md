# Next.js Full Stack Project

A modern full-stack Next.js application with authentication, database, caching, and API documentation.

## Tech Stack

### Frontend
- **Next.js** (App Router) - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **next/image** - Optimized images
- **React Query** - Data fetching and caching

### Backend
- **Prisma ORM** - Database management
- **Redis** - Caching layer

### Caching & Storage
- **Redis** - Caching layer
- **/public/uploads** - File storage

### Runtime & Package Manager
- **Bun** - Fast JavaScript runtime and package manager

### Infrastructure
- **Docker** - Containerization for easy deployment

## Getting Started

### Prerequisites

Make sure you have the following installed:
- **Bun** - JavaScript runtime and package manager
- MySQL (or use Docker)
- Redis (or use Docker)

#### Installing Bun

```bash
# macOS, Linux, or WSL
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Or visit [bun.sh](https://bun.sh) for more installation options.

### Installation

1. **Install dependencies:**

```bash
bun install
```

2. **Configure environment variables:**

Copy `.env.local` and update with your actual values:

```env
# Database
DATABASE_URL="mysql://admin_web:admin_web@localhost:3307/mydb"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# Optional: JWT Secret
JWT_SECRET="your-jwt-secret-change-this-in-production"
```

3. **Set up the database:**

```bash
# Generate Prisma client (runs automatically after install)
bunx prisma generate

# Run migrations
bunx prisma migrate dev --name init

# Optional: Open Prisma Studio
bunx prisma studio
```

4. **Start Redis:**

Make sure Redis is running on your system:
```bash
# Linux/Mac
redis-server

# Windows (if installed via WSL)
sudo service redis-server start
```

5. **Run the development server:**

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Docker Setup

### Quick Start with Docker

1. **Create environment file:**

Copy `.env.docker.example` to `.env.local` and update the values:

```bash
cp .env.docker.example .env.local
```

2. **Start all services:**

```bash
# Start PostgreSQL and Redis only (for local development)
docker-compose -f docker-compose.dev.yml up -d

# Or start everything including the app (production)
docker-compose up -d
```

3. **Run database migrations:**

```bash
# If using docker-compose.dev.yml (services only)
bunx prisma migrate dev

# Or from inside the app container
docker-compose exec app bunx prisma migrate dev
```

4. **Access the application:**

- **App:** [http://localhost:3000](http://localhost:3000)
- **phpMyAdmin:** [http://localhost:8080](http://localhost:8080)
- **MySQL:** `localhost:3307` (mapped from container port 3306)
- **Redis:** `localhost:6379`

### Docker Commands

```bash
# Start services (development - MySQL + Redis + phpMyAdmin)
docker-compose -f docker-compose.dev.yml up -d

# Start all services (production)
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f app

# Rebuild containers
docker-compose build

# Execute commands in container
docker-compose exec app bunx prisma studio
docker-compose exec mysql mysql -u root -proot -e "USE mydb; SHOW TABLES;"
```

### Development vs Production

- **Development:** Use `docker-compose.dev.yml` to run MySQL, Redis, and phpMyAdmin. Run the Next.js app locally with `bun run dev` for hot reload.
- **Production:** Use `docker-compose.yml` to run everything in containers.

### phpMyAdmin Access

After starting Docker services, access phpMyAdmin at [http://localhost:8080](http://localhost:8080)

**Login credentials:**
- **Server:** `mysql` (or `localhost:3307` if connecting from host)
- **Username:** `root` or `admin_web`
- **Password:** `root` or `admin_web`

## Project Structure

```
my-nextjs-project/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # File uploads storage
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── lib/
│   │   ├── auth/              # Auth configuration
│   │   ├── providers/         # React Query provider
│   │   ├── redis/             # Redis client
│   │   ├── validations/       # Zod schemas
│   │   └── prisma.ts          # Prisma client
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth types
│   └── middleware.ts          # Next.js middleware
├── .env.local                 # Environment variables
├── .env.docker.example        # Docker environment template
├── Dockerfile                 # Docker image configuration
├── docker-compose.yml         # Production Docker setup
├── docker-compose.dev.yml     # Development Docker setup
├── .dockerignore              # Docker ignore patterns
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── tsconfig.json              # TypeScript config
```

## Features

✅ **Database**
- Prisma ORM with MySQL
- Type-safe database queries
- Easy migrations
- phpMyAdmin for database management

✅ **Caching**
- Redis integration
- Helper functions for cache operations

✅ **UI Components**
- shadcn/ui components
- Tailwind CSS styling
- Dark mode support (shadcn/ui)

✅ **Developer Experience**
- TypeScript for type safety
- ESLint for code quality
- Hot reload for development

## Commands

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bunx prisma generate  # Generate Prisma client
bunx prisma migrate dev # Run migrations
bunx prisma studio    # Open Prisma Studio
bunx prisma db push   # Push schema changes

# Linting
bun run lint         # Run ESLint

# Docker
docker-compose up -d  # Start all services
docker-compose down   # Stop all services
docker-compose logs -f # View logs
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [TanStack Query Documentation](https://tanstack.com/query)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)
- [Docker Documentation](https://docs.docker.com)
- [Bun Documentation](https://bun.sh/docs)

## License

MIT
