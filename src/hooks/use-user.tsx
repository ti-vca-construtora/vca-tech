'use client'

import { AuthContext } from '@/contexts/auth-context.context'
import { useContext } from 'react'

export function useUser() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useUser must be used within an AuthProvider')
  }

  return {
    user: context.user,
    isLoading: context.isLoading,
    login: context.login,
    logout: context.logout,
    getToken: context.getToken,
    getAllUsers: context.getAllUsers,
  }
}
