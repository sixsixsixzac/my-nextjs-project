import 'dotenv/config'

// Fallback if prisma/config doesn't work
const getEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export default {
  datasource: {
    url: getEnv('DATABASE_URL'),
  },
}

