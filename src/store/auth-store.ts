/* eslint-disable camelcase */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

type AuthPayload = {
  token: string
}

type ApiResponseWithPagination = {
  total: number
  totalPages: number
  currentPage: number
}

type User = {
  id: string
  email: string
  role: 'MASTER' | 'ADMIN' | 'USER'
  permissions: Array<{ area: string; permissions: string[] }>
}

type AuthState = {
  user: User | null
  isLoading: boolean
  loadUser: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (area: string, permission: string) => boolean
  getAllUsers: (
    token: string,
    page?: number,
    pageSize?: number,
  ) => Promise<
    ApiResponseWithPagination & {
      data: User[]
    }
  >
}

function saveAccessToken({ token }: AuthPayload): void {
  Cookies.set('vca-tech-auth', JSON.stringify({ token }), {
    expires: 7,
  })
}

const TECH_API_URL = process.env.NEXT_PUBLIC_TECH_API_URL

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      getAllUsers: async (token: string, page = 1, pageSize = 20) => {
        try {
          const response = await fetch(
            `${TECH_API_URL}/users?page=${page}&pageSize=${pageSize}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          return await response.json()
        } catch (error) {
          console.error('Failed to fetch users:', error)
          throw error
        }
      },

      loadUser: async () => {
        try {
          const cookie = Cookies.get('vca-tech-auth')

          if (!cookie) {
            set({ isLoading: false })
            return
          }

          const { token } = JSON.parse(cookie)
          const decoded = jwtDecode<{ sub: string }>(token)

          const response = await fetch(`${TECH_API_URL}/users/${decoded.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          const userData = await response.json()
          set({ user: userData.data, isLoading: false })
        } catch (error) {
          console.log(error)
          set({ user: null, isLoading: false })
        }
      },

      login: async (email, password) => {
        try {
          const response = await fetch(`${TECH_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Erro de login')
          }

          const authResponse = await response.json()

          saveAccessToken({ token: authResponse.access_token })

          await get().loadUser()

          return true
        } catch (error) {
          console.error('Login failed:', error)
          return false
        }
      },

      logout: () => {
        Cookies.remove('vca-tech-auth')
        set({ user: null })
      },

      hasPermission: (area, permission) => {
        const { user } = get()
        if (!user) return false
        if (user.role === 'MASTER') return true

        return user.permissions.some(
          (p) => p.area === area && p.permissions.includes(permission),
        )
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
