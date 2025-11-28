import 'next-auth'
import { SocialLinks } from '@/types/models'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'admin' | 'writer' | 'user'
      socialMedia?: SocialLinks | null
    }
  }

  interface User {
    id: string
    role?: 'admin' | 'writer' | 'user'
    socialMedia?: SocialLinks | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: 'admin' | 'writer' | 'user'
    socialMedia?: SocialLinks | null
  }
}

