import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Find user in UserProfile table (matches the PHP member table)
        const user = await prisma.userProfile.findFirst({
          where: { email: credentials.email }
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

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.displayName || user.uName,
          image: user.userImg !== 'none.png' ? `/images/${user.userImg}` : null
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

