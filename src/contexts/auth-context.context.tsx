'use client'

import { createContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const TECH_API_URL = process.env.NEXT_PUBLIC_TECH_API_URL

export interface User {
  id: string
  createdAt: Date
  email: string
  name?: string
  role: 'MASTER' | 'ADMIN' | 'USER'
  permissions: { area: string; permissions: string[] }[]
}

interface ApiResponse {
  data: User[]
  total: number
  page: number
  pageSize: number
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => Promise<boolean>
  getAllUsers: (
    token: string,
    page: number,
    pageSize: number,
  ) => Promise<User[]>
  logout: () => void
  getToken: () => string | null
}

type AuthPayload = {
  token: string
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const user = await getUserFromCookie()
      setUser(user)
      setIsLoading(false)
    }
    loadUser()
  }, [])

  async function login({
    email,
    password,
  }: {
    email: string
    password: string
  }) {
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

      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  function saveAccessToken({ token }: AuthPayload): void {
    Cookies.set('vca-tech-authorize', JSON.stringify({ token }), {
      expires: 7,
    })
  }

  function logout(): void {
    Cookies.remove('vca-tech-authorize')
    setUser(null)
    window.location.href = '/login'
  }

  function getToken(): string | null {
    const cookieValue = Cookies.get('vca-tech-authorize')

    if (!cookieValue) {
      console.log('Cookie não encontrado')
      return null
    }

    let token: string
    try {
      const tokenData = JSON.parse(cookieValue)
      token = tokenData.token
    } catch (error) {
      console.log('Definindo cookie como JSON puro: ', error)
      token = cookieValue
    }

    if (!token) {
      console.log('Token não encontrado')
      return null
    }

    return token
  }

  async function getAllUsers(
    token: string,
    page = 1,
    pageSize = 20,
  ): Promise<User[]> {
    try {
      const response = await fetch(
        `${TECH_API_URL}/users?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar usuários')
      }

      const data: ApiResponse = await response.json()

      return data.data
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, getToken, getAllUsers }}
    >
      {children}
    </AuthContext.Provider>
  )
}

async function getUserFromCookie(): Promise<User | null> {
  try {
    const cookieValue = Cookies.get('vca-tech-authorize')

    if (!cookieValue) {
      console.log('Cookie não encontrado')
      return null
    }

    let token: string
    try {
      const tokenData = JSON.parse(cookieValue)
      token = tokenData.token
    } catch (error) {
      console.log('Definindo cookie como JSON puro: ', error)
      token = cookieValue
    }

    if (!token) {
      console.log('Token não encontrado')
      return null
    }

    const decoded = jwtDecode<{ sub?: string }>(token)
    const userId = decoded.sub

    if (!userId) {
      console.log('sub não encontrado no token')
      return null
    }

    const response = await fetch(`${TECH_API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`)
    }

    const payload = await response.json()

    return payload.data
  } catch (error) {
    console.error('Erro ao processar autenticação:', error)
    return null
  }
}
