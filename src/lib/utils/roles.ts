export type UserRole = "admin" | "writer" | "user"

export const ROLES = {
  ADMIN: "admin" as const,
  WRITER: "writer" as const,
  USER: "user" as const,
} as const

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    writer: 2,
    admin: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.ADMIN
}

export function isWriter(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.WRITER || userRole === ROLES.ADMIN
}

export function isUser(userRole: UserRole | undefined): boolean {
  return !!userRole
}

export function getRoleLabel(role: UserRole | undefined): string {
  switch (role) {
    case "admin":
      return "Admin"
    case "writer":
      return "Writer"
    case "user":
      return "User"
    default:
      return "Guest"
  }
}

export function getRoleBadgeVariant(role: UserRole | undefined): "default" | "secondary" | "destructive" {
  switch (role) {
    case "admin":
      return "destructive"
    case "writer":
      return "default"
    case "user":
      return "secondary"
    default:
      return "secondary"
  }
}

