'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

import Cookies from 'js-cookie'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usuarios } from '@/data/usuarios'

const formSchema = z.object({
  user: z.string().min(1, 'Utilize um nome de usuário válido!'),
  senha: z.string().min(1, 'Utilize uma senha válida!'),
})

type FormType = z.infer<typeof formSchema>

export function LoginForm() {
  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  })
  const router = useRouter()

  // Substituir parâmentro de token pelo payload de usuário
  const salvaAutorizacao = (token: string): void => {
    Cookies.set('vca-tech-authorize', token, { expires: 7 })
  }

  const handleLogin = (data: FormType) => {
    const user = usuarios.find((user) => user.user === data.user)

    if (user && user.senha === data.senha) {
      salvaAutorizacao(user.token)
      router.push('/dashboard')

      return
    }

    setError('senha', { message: 'Erro nas credenciais' })
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Utilize credenciais autorizadas para acessar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleLogin)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user">Usuário</Label>
            <Input {...register('user')} placeholder="Usuário" required />
            {errors.user && (
              <span className="text-xs text-red-500">
                {errors.user.message}
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Equeceu sua senha?
              </Link>
            </div>
            <Input {...register('senha')} type="password" required />
            {errors.senha && (
              <span className="text-xs text-red-500">
                {errors.senha.message}
              </span>
            )}
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Não tem um acesso?{' '}
          <Link href="#" className="underline">
            Solicite
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
