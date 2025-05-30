'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import LogoVcaTech from '../../../../public/assets/logo-vca-tech.png'
import LogoVca from '../../../../public/assets/logo-vca.png'

import { useRouter } from 'next/navigation'
import ReCAPTCHA from 'react-google-recaptcha'

import { useUser } from '@/hooks/use-user'

const NEXT_PUBLIC_GOOGLE_SITE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_KEY || ''

const formSchema = z.object({
  email: z.string().email('Informe um e-mail válido!'),
  senha: z.string().min(1, 'Utilize uma senha válida!'),
  recaptcha: z.boolean().refine((captcha) => captcha === true, {
    message: 'Validação reCAPTCHA necessária. Tente novamente.',
  }),
})

type FormType = z.infer<typeof formSchema>

export function LoginForm() {
  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
    setValue,
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  })
  const { login } = useUser()
  const router = useRouter()

  const handleLogin = async (data: FormType) => {
    try {
      const isLogged = await login(data.email, data.senha)

      if (isLogged) {
        router.refresh()
        router.push('/dashboard')
        return
      }

      setError('senha', {
        message: 'Credenciais inválidas',
      })
    } catch (error) {
      setError('senha', {
        message: error instanceof Error ? error.message : 'Erro inesperado',
      })
    }
  }

  return (
    <Card className="w-[95%] md:w-[600px] bg-neutral-50 px-2 md:px-16 h-full flex flex-col justify-between">
      <CardHeader className="flex flex-col gap-10">
        <CardTitle className="self-center">
          <Image width={250} src={LogoVca} alt="Logo da VCA Construtora" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex flex-col mb-10">
          <CardTitle className="text-2xl self-center">
            Plataforma de Soluções
          </CardTitle>
          <CardDescription className="self-center text-xs">
            Utilize credenciais autorizadas para acessar
          </CardDescription>
        </div>
        <form onSubmit={handleSubmit(handleLogin)} className="grid gap-4">
          <div className="grid gap-2 min-w-3">
            <Label htmlFor="email">E-mail</Label>
            <Input
              {...register('email')}
              placeholder="email@vcaconstrutora.com.br"
              required
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="grid gap-2 min-w-3">
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="https://teams.microsoft.com/l/chat/0/0?users=felipe.santos@vcaconstrutora.com.br"
                target="_blank"
                className="ml-auto inline-block text-xs underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <Input {...register('senha')} type="password" required />
            {errors.senha && (
              <span className="text-xs text-red-500">
                {errors.senha.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 items-center justify-center min-w-3">
            <ReCAPTCHA
              onChange={() =>
                setValue('recaptcha', true, { shouldValidate: true })
              }
              onExpired={() =>
                setValue('recaptcha', false, { shouldValidate: true })
              }
              sitekey={NEXT_PUBLIC_GOOGLE_SITE_KEY}
            />
            {errors.recaptcha?.message && (
              <span className="text-xs text-red-500">
                {errors.recaptcha.message}
              </span>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-azul-claro-vca font-semibold"
          >
            Acessar
          </Button>
        </form>
        <div className="mt-4 text-center text-xs">
          Não tem um acesso?{' '}
          <Link
            target="_blank"
            href="https://ac6oxj9qarv.typeform.com/to/J3FeBlEQ"
            className="underline"
          >
            Solicite
          </Link>
        </div>
      </CardContent>
      <CardFooter className="self-center flex gap-2 items-center justify-center">
        <span className="italic text-xs">Desenvolvido por:</span>
        <Image width={80} src={LogoVcaTech} alt="Logo do VCA Tech" />
      </CardFooter>
    </Card>
  )
}
