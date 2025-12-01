/**
 * Prisma Client - Server Only
 * 
 * This module should ONLY be imported in:
 * - Server Components
 * - Server Actions (files with "use server")
 * - API Routes
 * 
 * NEVER import this in Client Components ("use client")
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import '@/lib/config/timezone' // Initialize timezone early

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use DATABASE_URL from .env only (no per-field fallbacks)
// Example: mysql://admin_web:pinkjung1234@localhost:3306/pekotoon_db
// Falls back to a local 3306 connection for development if not set.
const databaseUrl =
  process.env.DATABASE_URL ||
  'mysql://admin_web:pinkjung1234@localhost:3306/pekotoon_db'

// Always create adapter - Prisma requires it when using MariaDB adapter
// The actual database connection won't happen until Prisma is actually used
const adapter = new PrismaMariaDb(databaseUrl)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: [],
    errorFormat: 'minimal',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

