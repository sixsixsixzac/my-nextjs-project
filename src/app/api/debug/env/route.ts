import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check which environment variables are being used
 * Only shows non-sensitive variables for security
 */
export async function GET() {
  // Only allow in development or if explicitly enabled
  const isDev = process.env.NODE_ENV === 'development'
  const allowDebug = process.env.ALLOW_ENV_DEBUG === 'true'
  
  if (!isDev && !allowDebug) {
    return NextResponse.json(
      { error: 'Environment debug is disabled in production' },
      { status: 403 }
    )
  }

  // List of safe environment variables to show (non-sensitive)
  const safeEnvVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_URL',
    'APP_PORT',
    'TZ',
    'NEXT_PUBLIC_API_URL',
    'DOCKER_BUILD',
  ]

  const envInfo: Record<string, string | undefined> = {}
  
  safeEnvVars.forEach((key) => {
    const value = process.env[key]
    envInfo[key] = value || '(not set)'
  })

  // Show if sensitive vars exist (but not their values)
  const sensitiveVars = [
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'PAYMENT_USERNAME',
    'PAYMENT_PASSWORD',
    'PROMPTPAY_ID',
  ]

  const sensitiveInfo: Record<string, boolean> = {}
  sensitiveVars.forEach((key) => {
    sensitiveInfo[key] = !!process.env[key]
  })

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    safeVariables: envInfo,
    sensitiveVariables: sensitiveInfo,
    note: 'Sensitive variables are shown as true/false (exists/not exists) for security',
  })
}

