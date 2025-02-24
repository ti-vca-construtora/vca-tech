'use client'

import { Usuario, usuarios } from '@/data/usuarios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

type UserPayload = {
  user: string
  token: string
}

type UseUser = {
  user: Usuario
  logout: () => void
  login: ({
    username,
    password,
  }: {
    username: string
    password: string
  }) => boolean
}

export function useUser(): UseUser {
  const router = useRouter()

  const login = ({
    username,
    password,
  }: {
    username: string
    password: string
  }) => {
    const userFound = usuarios.find((user) => user.user === username)

    if (userFound && userFound.senha === password) {
      saveAuthCookie({ user: userFound.user, token: userFound.token })
      router.push('/dashboard')

      return true
    }

    return false
  }

  function saveAuthCookie({ user, token }: UserPayload): void {
    Cookies.set('vca-tech-authorize', JSON.stringify({ user, token }), {
      expires: 7,
    })
  }

  function getUserFromCookie(): string | null {
    const payload = Cookies.get('vca-tech-authorize')

    if (!payload) {
      console.log('Cookie não encontrado.')
      return null
    }

    try {
      const { user } = JSON.parse(payload)

      const userFound = usuarios.find((usuario) => usuario.user === user)

      if (userFound) {
        return userFound
      } else {
        console.log('Usuário não encontrado no payload do cookie.')
        return null
      }
    } catch (error) {
      console.error('Erro ao analisar o payload do cookie:', error)
      return null
    }
  }

  function logout(): void {
    Cookies.remove('vca-tech-authorize')

    window.location.href = '/login'
  }

  return {
    user: getUserFromCookie(),
    logout,
    login,
  }
}
