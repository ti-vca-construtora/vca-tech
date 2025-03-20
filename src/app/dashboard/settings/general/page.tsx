'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UsersTable } from './_components/users-table'
import { useUser } from '@/hooks/use-user'
import { useEffect, useState } from 'react'
import { User } from '@/store/auth-store'

export default function Page() {
  const { getAllUsers, getToken } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const token = getToken()

        if (!token) throw new Error('Não autenticado')

        const data = await getAllUsers(token, 1, 20)

        setUsers(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  if (loading) return <div>Carregando...</div>

  if (error) return <div>Erro: {error}</div>

  return (
    <section className="flex flex-col items-start gap-6 w-full h-full p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerenciamento geral de usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </section>
  )
}
