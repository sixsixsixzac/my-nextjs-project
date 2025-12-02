import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { constructAuthorAvatarUrl } from '@/lib/utils/image-url'
import type { SocialLinks } from '@/types/models'
import type { JWT } from 'next-auth/jwt'
import type { Session, User } from 'next-auth'

// Force dynamic rendering - API routes should never be statically generated
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Constants
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
const DEFAULT_SOCIAL_MEDIA: SocialLinks = {
    x: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    discord: '',
    facebook: '',
}

// Extended types
interface ExtendedUser extends User {
    id: string
    socialMedia: SocialLinks
}

interface ExtendedToken extends JWT {
    id: string
    socialMedia: SocialLinks
}

interface ExtendedSession extends Session {
    user: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        socialMedia: SocialLinks
    }
}

// Helper functions
const parseSocialMedia = (socialMediaJson: string | null): SocialLinks => {
    if (!socialMediaJson) return { ...DEFAULT_SOCIAL_MEDIA }
    
    try {
        const parsed = JSON.parse(socialMediaJson)
        return {
            x: parsed.x || '',
            instagram: parsed.instagram || '',
            youtube: parsed.youtube || '',
            tiktok: parsed.tiktok || '',
            discord: parsed.discord || '',
            facebook: parsed.facebook || '',
        }
    } catch {
        return { ...DEFAULT_SOCIAL_MEDIA }
    }
}

const isOldPasswordFormat = (storedPassword: string, plainPassword: string): boolean => {
    return (
        storedPassword === plainPassword ||
        storedPassword === Buffer.from(plainPassword).toString('base64')
    )
}

const verifyPassword = async (
    plainPassword: string,
    storedPassword: string,
    userId: number
): Promise<boolean> => {
    // Check old password format first
    if (isOldPasswordFormat(storedPassword, plainPassword)) {
        // Upgrade to bcrypt asynchronously (don't block login)
        const hashedPassword = await bcrypt.hash(plainPassword, 10)
        prisma.userProfile
            .update({
                where: { id: userId },
                data: { pWord: hashedPassword },
            })
            .catch((error) => console.error('Error upgrading password:', error))
        
        return true
    }
    
    // Verify bcrypt hash
    return bcrypt.compare(plainPassword, storedPassword)
}

const fetchUserSocialMedia = async (userId: number): Promise<SocialLinks> => {
    try {
        const dbUser = await prisma.userProfile.findUnique({
            where: { id: userId },
            select: { socialMedia: true },
        })
        
        return parseSocialMedia(dbUser?.socialMedia || null)
    } catch (error) {
        console.error('Error fetching social media:', error)
        return { ...DEFAULT_SOCIAL_MEDIA }
    }
}

export const authConfig: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Email or Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials): Promise<ExtendedUser | null> {
                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error('Invalid credentials')
                }

                // Find user by email or username
                const user = await prisma.userProfile.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier },
                            { uName: credentials.identifier },
                        ],
                    },
                })

                if (!user?.pWord) {
                    throw new Error('Invalid credentials')
                }

                // Verify password (handles upgrade automatically)
                const isPasswordValid = await verifyPassword(
                    credentials.password,
                    user.pWord,
                    user.id
                )

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials')
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.displayName || user.uName,
                    image: constructAuthorAvatarUrl(user.userImg) || null,
                    socialMedia: parseSocialMedia(user.socialMedia),
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: SESSION_MAX_AGE,
        updateAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }): Promise<JWT> {
            // Initial sign-in - set user data from user object
            if (user) {
                const extendedUser = user as ExtendedUser
                const extendedToken = token as ExtendedToken
                extendedToken.id = extendedUser.id
                extendedToken.socialMedia = extendedUser.socialMedia || DEFAULT_SOCIAL_MEDIA
                return extendedToken
            }

            const extendedToken = token as ExtendedToken

            // Lazy-load social media if missing
            if (extendedToken.id && !extendedToken.socialMedia) {
                const userId = parseInt(extendedToken.id)
                extendedToken.socialMedia = await fetchUserSocialMedia(userId)
            }

            return token
        },
        async session({ session, token }): Promise<Session> {
            const extendedToken = token as ExtendedToken
            const extendedSession = session as ExtendedSession
            
            if (session.user) {
                extendedSession.user.id = extendedToken.id
                extendedSession.user.socialMedia = extendedToken.socialMedia || DEFAULT_SOCIAL_MEDIA
            }
            
            return extendedSession
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    cookies: {
        sessionToken: {
            name: 'session',
            options: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: SESSION_MAX_AGE,
            },
        },
        csrfToken: {
            name: 'csrfToken',
            options: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: SESSION_MAX_AGE,
            },
        },
    },
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }