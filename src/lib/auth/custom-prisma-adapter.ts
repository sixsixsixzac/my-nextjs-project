import type { Adapter, AdapterAccount, AdapterUser } from 'next-auth/adapters'
import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

/**
 * Custom Prisma Adapter that uses userProfile instead of user
 * Fully standalone implementation that doesn't rely on the default PrismaAdapter
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, 'id'>) {
      // This is called when creating a new user via OAuth
      // We need to create a UserProfile instead
      const newUser = await prisma.userProfile.create({
        data: {
          email: user.email || '',
          uName: user.name || user.email || '',
          displayName: user.name || user.email || '',
          userImg: user.image || 'none.png',
          uuid: randomUUID(),
          pWord: '', // OAuth users don't have passwords
        },
      })

      return {
        id: newUser.id.toString(),
        name: newUser.displayName || newUser.uName,
        email: newUser.email,
        emailVerified: null,
        image: newUser.userImg !== 'none.png' ? newUser.userImg : null,
      }
    },
    async getUser(id) {
      const user = await prisma.userProfile.findUnique({
        where: { id: parseInt(id) },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id.toString(),
        name: user.displayName || user.uName,
        email: user.email,
        emailVerified: null,
        image: user.userImg !== 'none.png' ? user.userImg : null,
      }
    },
    async getUserByEmail(email: string) {
      const user = await prisma.userProfile.findFirst({
        where: { email },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id.toString(),
        name: user.displayName || user.uName,
        email: user.email,
        emailVerified: null,
        image: user.userImg !== 'none.png' ? user.userImg : null,
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          userProfile: true,
        },
      })

      if (!account?.userProfile) {
        return null
      }

      const user = account.userProfile

      return {
        id: user.id.toString(),
        name: user.displayName || user.uName,
        email: user.email,
        emailVerified: null,
        image: user.userImg !== 'none.png' ? user.userImg : null,
      }
    },
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      const updateData: {
        email?: string
        displayName?: string
        userImg?: string
      } = {}

      if (user.email !== undefined && user.email !== null) {
        updateData.email = user.email
      }
      if (user.name !== undefined && user.name !== null) {
        updateData.displayName = user.name
      }
      if (user.image !== undefined && user.image !== null) {
        updateData.userImg = user.image || 'none.png'
      }

      // Only update if there's data to update
      if (Object.keys(updateData).length === 0) {
        const existingUser = await prisma.userProfile.findUnique({
          where: { id: parseInt(user.id) },
        })
        if (!existingUser) {
          throw new Error('User not found')
        }

        return {
          id: existingUser.id.toString(),
          name: existingUser.displayName || existingUser.uName,
          email: existingUser.email,
          emailVerified: null,
          image: existingUser.userImg !== 'none.png' ? existingUser.userImg : null,
        }
      }

      const updatedUser = await prisma.userProfile.update({
        where: { id: parseInt(user.id) },
        data: updateData,
      })

      return {
        id: updatedUser.id.toString(),
        name: updatedUser.displayName || updatedUser.uName,
        email: updatedUser.email,
        emailVerified: null,
        image: updatedUser.userImg !== 'none.png' ? updatedUser.userImg : null,
      }
    },
    async deleteUser(userId) {
      await prisma.userProfile.delete({
        where: { id: parseInt(userId) },
      })
    },
    async linkAccount(account: AdapterAccount) {
      // Map the userId to userProfileId
      const userProfileId = parseInt(account.userId)

      await prisma.account.create({
        data: {
          id: typeof account.id === 'string' ? account.id : randomUUID(),
          userProfileId: userProfileId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token ? String(account.refresh_token) : undefined,
          access_token: account.access_token ? String(account.access_token) : undefined,
          expires_at: typeof account.expires_at === 'number' ? account.expires_at : undefined,
          token_type: account.token_type ? String(account.token_type) : undefined,
          scope: account.scope ? String(account.scope) : undefined,
          id_token: account.id_token ? String(account.id_token) : undefined,
          session_state: account.session_state ? String(account.session_state) : undefined,
        },
      })
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      })
    },
    // Session methods - not used with JWT strategy but required by interface
    async createSession() {
      throw new Error('Session methods not supported with JWT strategy')
    },
    async getSessionAndUser() {
      throw new Error('Session methods not supported with JWT strategy')
    },
    async updateSession() {
      throw new Error('Session methods not supported with JWT strategy')
    },
    async deleteSession() {
      throw new Error('Session methods not supported with JWT strategy')
    },
    // Verification token methods - optional, not used in this setup
    async createVerificationToken() {
      return null
    },
    async useVerificationToken() {
      return null
    },
  }
}
