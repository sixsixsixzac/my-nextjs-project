"use client"

import { ReactNode } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import { AdminLayout } from "./AdminLayout"
import { WriterLayout } from "./WriterLayout"
import { UserLayout } from "./UserLayout"

type UserRole = "admin" | "writer" | "user"

interface LayoutWrapperProps {
  children: ReactNode
}

function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

//   if (!session) {
//     return <>{children}</>
//   }

  const userRole: UserRole = (session.user as any)?.role || "user"

  switch (userRole) {
    case "admin":
      return <AdminLayout>{children}</AdminLayout>
    case "writer":
      return <WriterLayout>{children}</WriterLayout>
    case "user":
    default:
      return <UserLayout>{children}</UserLayout>
  }
}

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SessionProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </SessionProvider>
  )
}

