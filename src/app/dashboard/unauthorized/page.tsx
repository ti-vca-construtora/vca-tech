'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="size-full flex flex-col items-center justify-center p-6">
      <h1 className="font-bold">Acesso não autorizado</h1>
      <p className="text-xs text-neutral-600">
        Você não possui permissão para acessar este recurso
      </p>
      <Button onClick={() => router.back()} className="mt-10">
        Voltar
      </Button>
    </div>
  )
}
