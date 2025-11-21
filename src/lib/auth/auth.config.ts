import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { SocialLinks } from '@/app/(frontend)/settings/components/SocialMediaSection'

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Find user in UserProfile table by email or username
        const user = await prisma.userProfile.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { uName: credentials.identifier }
            ]
          }
        })

        if (!user || !user.pWord) {
          throw new Error('Invalid credentials')
        }

        const password = credentials.password
        const storedPassword = user.pWord

        // Check if it's an old password format (plain text or base64 encoded)
        const isOldPassword = 
          storedPassword === password || 
          storedPassword === Buffer.from(password).toString('base64')

        let isPasswordValid = false

        if (isOldPassword) {
          // Old password format detected - upgrade to bcrypt hash
          isPasswordValid = true
          
          // Upgrade password to bcrypt hash
          const hashedPassword = await bcrypt.hash(password, 10)
          
          await prisma.userProfile.update({
            where: { id: user.id },
            data: { pWord: hashedPassword }
          })
        } else {
          // Check against bcrypt hash (new password format)
          isPasswordValid = await bcrypt.compare(password, storedPassword)
        }

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Parse social media from JSON string
        let socialMedia: SocialLinks | null = null
        if (user.socialMedia) {
          try {
            const parsed = JSON.parse(user.socialMedia)
            // Ensure all required fields exist with defaults
            socialMedia = {
              x: parsed.x || '',
              instagram: parsed.instagram || '',
              youtube: parsed.youtube || '',
              tiktok: parsed.tiktok || '',
              discord: parsed.discord || '',
              facebook: parsed.facebook || ''
            }
          } catch (error) {
            // If parsing fails, use default empty values
            socialMedia = {
              x: '',
              instagram: '',
              youtube: '',
              tiktok: '',
              discord: '',
              facebook: ''
            }
          }
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.displayName || user.uName,
          image: user.userImg !== 'none.png' ? `/images/${user.userImg}` : null,
          socialMedia
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign-in - set user data from user object
      if (user) {
        token.id = user.id
        token.socialMedia = user.socialMedia || null
      }
      
      // For Google sign-in on first login, fetch user data including social media
      if (account?.provider === 'google' && user) {
        try {
          const dbUser = await prisma.userProfile.findFirst({
            where: {
              OR: [
                { googleId: account.providerAccountId },
                { email: user.email || '' }
              ]
            },
            select: {
              id: true,
              socialMedia: true
            }
          })

          if (dbUser?.socialMedia) {
            try {
              const parsed = JSON.parse(dbUser.socialMedia)
              token.socialMedia = {
                x: parsed.x || '',
                instagram: parsed.instagram || '',
                youtube: parsed.youtube || '',
                tiktok: parsed.tiktok || '',
                discord: parsed.discord || '',
                facebook: parsed.facebook || ''
              }
            } catch (error) {
              token.socialMedia = {
                x: '',
                instagram: '',
                youtube: '',
                tiktok: '',
                discord: '',
                facebook: ''
              }
            }
          } else {
            token.socialMedia = {
              x: '',
              instagram: '',
              youtube: '',
              tiktok: '',
              discord: '',
              facebook: ''
            }
          }
        } catch (error) {
          console.error('Error fetching social media for Google user:', error)
        }
      }
      
      // On subsequent requests, if socialMedia is not in token, fetch it
      if (token.id && !token.socialMedia) {
        try {
          const dbUser = await prisma.userProfile.findUnique({
            where: { id: parseInt(token.id as string) },
            select: {
              socialMedia: true
            }
          })

          if (dbUser?.socialMedia) {
            try {
              const parsed = JSON.parse(dbUser.socialMedia)
              token.socialMedia = {
                x: parsed.x || '',
                instagram: parsed.instagram || '',
                youtube: parsed.youtube || '',
                tiktok: parsed.tiktok || '',
                discord: parsed.discord || '',
                facebook: parsed.facebook || ''
              }
            } catch (error) {
              token.socialMedia = {
                x: '',
                instagram: '',
                youtube: '',
                tiktok: '',
                discord: '',
                facebook: ''
              }
            }
          } else {
            token.socialMedia = {
              x: '',
              instagram: '',
              youtube: '',
              tiktok: '',
              discord: '',
              facebook: ''
            }
          }
        } catch (error) {
          console.error('Error fetching social media:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.socialMedia = token.socialMedia || null
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

