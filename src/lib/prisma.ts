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

// Create adapter using DATABASE_URL connection string
// PrismaMariaDb works with both MariaDB and MySQL databases
// Note: MySQL/MariaDB timezone is set via --default-time-zone='+07:00' in docker-compose
// During build time, DATABASE_URL might not be available, so we use a fallback
// The adapter is just a wrapper - actual connection only happens when Prisma is used
const databaseUrl = process.env.DATABASE_URL || 'mysql://dummy:dummy@localhost:3306/dummy'

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

