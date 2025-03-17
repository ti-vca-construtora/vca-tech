'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/use-permissions'
import { useUser } from '@/hooks/use-user'

type RouteGuardProps = {
  children: React.ReactNode
  requiredArea: string
  requiredPermission: string
}

export const RouteGuard = ({
  children,
  requiredArea,
  requiredPermission,
}: RouteGuardProps) => {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const { user } = useUser()

  useEffect(() => {
    if (user && !hasPermission(requiredArea, requiredPermission)) {
      router.replace('/dashboard/unauthorized')
    }
  }, [user, hasPermission, requiredArea, requiredPermission, router])

  if (!user || !hasPermission(requiredArea, requiredPermission)) {
    return null
  }

  return <>{children}</>
}
