/**
 * Migration script to move Google account data from UserProfile to Account model
 * 
 * This script should be run BEFORE applying the schema migration that removes
 * googleId and googleToken columns.
 * 
 * Run with: npx tsx prisma/migrate-google-accounts.ts
 * Or: node --loader tsx prisma/migrate-google-accounts.ts
 * 
 * Note: If using Bun, you may need to use tsx instead due to Prisma compatibility
 */

import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { randomUUID } from 'crypto'

// Create Prisma client with MariaDB adapter
// Use the same configuration as src/lib/prisma.ts
const databaseUrl = process.env.DATABASE_URL || 'mysql://admin_web:pinkjung1234@localhost:3306/pekotoon_db'

// Initialize adapter and Prisma client
const adapter = new PrismaMariaDb(databaseUrl)

// Create PrismaClient - works with both Node.js and Bun
const prisma = new PrismaClient({
  adapter,
  log: [],
  errorFormat: 'minimal',
})

async function migrateGoogleAccounts() {
  console.log('Starting Google account migration...')

  try {
    // Find all users with googleId set using raw query
    // Note: We use raw query because googleId/googleToken are being removed from schema
    const usersWithGoogle = await prisma.$queryRaw<Array<{
      id: number
      google_id: string | null
      google_token: string | null
      email: string
    }>>`
      SELECT id, google_id, google_token, email
      FROM user_profile
      WHERE google_id IS NOT NULL AND google_id != ''
    `

    if (usersWithGoogle.length === 0) {
      console.log('No users with Google accounts found. Migration not needed.')
      return
    }

    console.log(`Found ${usersWithGoogle.length} users with Google accounts to migrate`)

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const user of usersWithGoogle) {
      try {
        // Check if account already exists
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: user.google_id!,
            },
          },
        })

        if (existingAccount) {
          console.log(`  ✓ User ${user.id} (${user.email}) already has Account record, skipping`)
          skipped++
          continue
        }

        // Create Account record
        await prisma.account.create({
          data: {
            id: randomUUID(),
            userProfileId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: user.google_id!,
            // Store the token in access_token field
            // Note: google_token might be a refresh token or access token
            // We'll store it as access_token, but it may need to be refreshed
            access_token: user.google_token || undefined,
            // Set a default expires_at (tokens will be refreshed on next login)
            expires_at: undefined,
            token_type: 'Bearer',
          },
        })

        console.log(`  ✓ Migrated user ${user.id} (${user.email})`)
        migrated++
      } catch (error) {
        console.error(`  ✗ Error migrating user ${user.id} (${user.email}):`, error)
        errors++
      }
    }

    console.log('\nMigration complete!')
    console.log(`  Migrated: ${migrated}`)
    console.log(`  Skipped (already exists): ${skipped}`)
    console.log(`  Errors: ${errors}`)
    console.log('\nYou can now run: npx prisma migrate dev --name remove_google_fields')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateGoogleAccounts()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
