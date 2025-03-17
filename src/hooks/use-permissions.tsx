'use client'

import { useUser } from '@/hooks/use-user'

import { User } from '@/contexts/auth-context.context'

export type UserPermission = {
  area: string
  permissions: string[]
}

export const checkPermissions = (
  user: User,
  requiredArea: string,
  requiredPermission: string,
): boolean => {
  if (user.role === 'MASTER') return true

  const areaPermissions = user.permissions.find(
    (perm) => perm.area === requiredArea,
  )

  return !!areaPermissions?.permissions.includes(requiredPermission)
}

export const normalizePermissions = (
  permissions: UserPermission[],
): Record<string, Set<string>> => {
  return permissions.reduce(
    (acc, curr) => {
      acc[curr.area] = new Set(curr.permissions)
      return acc
    },
    {} as Record<string, Set<string>>,
  )
}

export const usePermissions = () => {
  const { user } = useUser()

  const normalizedPermissions = user
    ? normalizePermissions(user.permissions)
    : {}

  const hasPermission = (area: string, permission: string): boolean => {
    if (!user) return false
    return checkPermissions(user, area, permission)
  }

  return {
    hasPermission,
    normalizedPermissions,
    userRole: user?.role || 'USER',
  }
}
