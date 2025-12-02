import { Auth } from './auth'

/**
 * Get current authenticated user
 * Uses cached session from Auth class to avoid duplicate calls
 * @returns Promise<User | null>
 */
export async function getCurrentUser() {
  return await Auth.user()
}

/**
 * Require authentication, throw error if not authenticated
 * Uses cached session from Auth class to avoid duplicate calls
 * @returns Promise<User>
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  return await Auth.require()
}

