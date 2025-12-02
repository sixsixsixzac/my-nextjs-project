import { cache } from 'react'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/api/auth/[...nextauth]/route'

/**
 * Cached session getter - ensures getServerSession is only called once per request
 * React's cache() function deduplicates calls within the same request
 */
const getCachedSession = cache(async () => {
  return await getServerSession(authConfig)
})

/**
 * Server-side auth helper class - Similar to Laravel's Auth facade
 * 
 * All methods use a cached session to avoid multiple getServerSession calls per request.
 * 
 * Usage in Server Components:
 * ```ts
 * import { Auth } from '@/lib/auth/auth'
 * 
 * const isAuthenticated = await Auth.isAuthenticated()
 * const user = await Auth.user()
 * ```
 */
export class Auth {
  /**
   * Check if user is authenticated (similar to Laravel's Auth::check())
   * @returns Promise<boolean>
   */
  static async check(): Promise<boolean> {
    const session = await getCachedSession()
    return !!session?.user
  }

  /**
   * Check if user is authenticated (alias for check())
   * @returns Promise<boolean>
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await getCachedSession()
    return !!session?.user
  }

  /**
   * Get current authenticated user (similar to Laravel's Auth::user())
   * @returns Promise<User | null>
   */
  static async user() {
    const session = await getCachedSession()
    return session?.user || null
  }

  /**
   * Get the full session object (useful when you need both user and session data)
   * @returns Promise<Session | null>
   */
  static async session() {
    return await getCachedSession()
  }

  /**
   * Require authentication, throw error if not authenticated
   * @returns Promise<User>
   * @throws Error if not authenticated
   */
  static async require() {
    const session = await getCachedSession()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }
    return session.user
  }
}

