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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create adapter using DATABASE_URL connection string
// PrismaMariaDb works with both MariaDB and MySQL databases
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: [],
    errorFormat: 'minimal',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

