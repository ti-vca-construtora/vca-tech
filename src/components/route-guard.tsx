'use client'

import { memo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export const RouteGuard = memo(
  ({
    children,
    requiredArea,
    requiredPermission,
  }: {
    children: React.ReactNode
    requiredArea: string
    requiredPermission: string
  }) => {
    const router = useRouter()
    const { user, isLoading, hasPermission } = useAuthStore()

    useEffect(() => {
      if (!isLoading && !hasPermission(requiredArea, requiredPermission)) {
        router.push('/dashboard/unauthorized')
      }
    }, [user, isLoading, router, requiredArea, requiredPermission])

    if (isLoading) return <div>Carregando...</div>
    if (!hasPermission(requiredArea, requiredPermission)) return null

    return <>{children}</>
  },
)

RouteGuard.displayName = 'RouteGuard'
