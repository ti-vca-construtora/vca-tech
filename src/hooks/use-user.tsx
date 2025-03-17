/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const TECH_API_URL = process.env.NEXT_PUBLIC_TECH_API_URL

type User = {
  id: string
  createdAt: Date
  email: string
  name?: string
  role: string
  permissions: any[]
}

type AuthPayload = {
  token: string
}

type UseUser = {
  user: User | null
  logout: () => void
  login: ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => Promise<boolean>
}

export function useUser(): UseUser {
  const [user, setUser] = useState<User | null>(null)

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

  function logout(): void {
    Cookies.remove('vca-tech-authorize')
    setUser(null)
    window.location.href = '/login'
  }

  useEffect(() => {
    const loadUser = async () => {
      const userFound = await getUserFromCookie()
      if (userFound) setUser(userFound)
    }

    loadUser()
  }, [])

  return {
    user,
    logout,
    login,
  }
}
