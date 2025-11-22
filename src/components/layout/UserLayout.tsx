
import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { MobileMenu, type MenuItem } from "@/components/common/MobileMenu"
import { DesktopMenu } from "@/components/DesktopMenu"
import { NotificationDropdown } from "@/components/common/NotificationDropdown"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { UserDropdownMenu } from "@/components/common/UserDropdownMenu"
import { getCurrentUser } from "@/lib/auth/session"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { UserRoleEnum } from "@/lib/utils/roles"
import { NavbarWrapper } from "./NavbarWrapper"
// import { isAdmin, isWriter } from "@/lib/utils/roles"

interface UserLayoutProps {
  children: ReactNode
}

/**
 * UserLayout - Server Component
 * 
 * This component determines menu items server-side based on user roles.
 * Only menu items the user has access to are passed to client components.
 * This ensures sensitive routes (e.g., admin routes) are never exposed to unauthorized users.
 */
export async function UserLayout({ children }: UserLayoutProps) {
  // Get user session server-side
  const sessionUser = await getCurrentUser()

  // Fetch full user data from database if user is logged in
  let userData = null
  if (sessionUser?.id) {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: parseInt(sessionUser.id) },
      select: {
        id: true,
        displayName: true,
        email: true,
        userImg: true,
        point: true,
        level: true,
      },
    })

    if (userProfile) {
      // Map level to UserRoleEnum (0 = User, 6 = Writer, 7 = Admin)
      const role = userProfile.level === 7 
        ? UserRoleEnum.ADMIN 
        : userProfile.level === 6 
        ? UserRoleEnum.WRITER 
        : UserRoleEnum.USER

      userData = {
        display_name: userProfile.displayName,
        email: userProfile.email,
        avatar: userProfile.userImg !== 'none.png' ? `/images/${userProfile.userImg}` : undefined,
        points: userProfile.point,
        role: role,
      }
    }
  }

  // Base menu items available to all users
  const baseMenuItems: MenuItem[] = [
    { href: "/", label: "หน้าแรก", icon: "Home" },
    { href: "/search", label: "ค้นหา", icon: "Search" },
    { href: "/announcement", label: "ประกาศ", icon: "Megaphone" },
    { href: "/contact", label: "ติดต่อ", icon: "Mail" },
  ]

  // Example: Add role-specific menu items (uncomment when auth is implemented)
  // const adminMenuItems: MenuItem[] = [
  //   { href: "/admin", label: "จัดการระบบ", icon: "Shield" },
  // ]
  // const writerMenuItems: MenuItem[] = [
  //   { href: "/writer", label: "เขียน", icon: "FileText" },
  // ]

  // Filter menu items based on user role (server-side filtering)
  // const menuItems: MenuItem[] = [
  //   ...baseMenuItems,
  //   ...(isWriter(userRole) ? writerMenuItems : []),
  //   ...(isAdmin(userRole) ? adminMenuItems : []),
  // ]

  // For now, use base menu items only
  const menuItems: MenuItem[] = baseMenuItems

  return (
    <>
      {/* Navbar - Hidden on reading pages */}
      <NavbarWrapper
        sessionUser={sessionUser}
        userData={userData}
        menuItems={menuItems}
      />
      {children}
    </>
  )
}

