import 'dotenv/config'

// Fallback if prisma/config doesn't work
// DATABASE_URL is optional during build time (prisma generate doesn't need it)
const getEnv = (key: string, required: boolean = true): string | undefined => {
  const value = process.env[key]
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// During Docker build, DATABASE_URL may not be available for prisma generate
// Provide a dummy value that won't be used (generate doesn't connect to DB)
const databaseUrl = getEnv('DATABASE_URL', false) || 'mysql://dummy:dummy@localhost:3306/dummy'

export default {
  datasource: {
    url: databaseUrl,
  },
}

