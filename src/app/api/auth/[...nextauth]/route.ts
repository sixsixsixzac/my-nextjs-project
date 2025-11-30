import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'

// Force dynamic rendering - API routes should never be statically generated
export const dynamic = 'force-dynamic'
export const revalidate = 0

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }

