'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoaderCircle, Trash } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'

const EditarEmpreendimento = () => {
  const idParam = useParams()
  const route = useRouter()

  const [empreendimentoNome, setEmpreendimentoNome] = useState('')
  const [isActive, setIsActive] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const toastConfig = {
    position: 'top-right' as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
  }

  const errorNotifDelete = () => toast.error('Falha na exclusão.', toastConfig)

  const sucessNotifDelete = () =>
    toast.success('Exclusão realizada.', toastConfig)

  const errorNotifEdit = () => toast.error('Falha na edição.', toastConfig)

  const sucessNotifEdit = () =>
    toast.success('Empreendimento editado.', toastConfig)

  const patchDevelopment = async () => {
    if (empreendimentoNome === '' || isActive === '') {
      window.alert('Campos obrigatórios não preenchidos!')
      return
    }

    const booleanActive = isActive === 'true'

    const response = await fetch(
      `/api/vistorias/empreendimentos?id=${idParam.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: empreendimentoNome.toUpperCase(),
          isActive: booleanActive,
        }),
        // eslint-disable-next-line prettier/prettier
      }
    )

    if (!response.ok) {
      console.error('Erro ao editar o empreendimento')
      errorNotifEdit()
      return
    }

    const data = await response.json()
    console.log('Empreendimento editado:', data)
    sucessNotifEdit()
    setTimeout(() => {
      route.push('/dashboard/agenda-vistorias/empreendimentos')
    }, 3000)
  }

  const deleteDevelopment = async () => {
    const response = await fetch(
      `/api/vistorias/empreendimentos?id=${idParam.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        // eslint-disable-next-line prettier/prettier
      }
    )

    if (!response.ok) {
      console.error('Erro ao excluir o empreendimento')
      errorNotifDelete()
      return
    }

    const data = await response.json()
    console.log('Empreendimento excluído:', data)
    sucessNotifDelete()
    setTimeout(() => {
      route.push('/dashboard/agenda-vistorias/empreendimentos')
    }, 3000)
  }

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpreendimentoNome(e.target.value)
  }

  const getEmpreendimento = async () => {
    const response = await fetch(
      `/api/vistorias/empreendimentos?id=${idParam.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // eslint-disable-next-line prettier/prettier
      }
    )

    if (!response.ok) {
      console.error('Erro ao carregar empreendimentos')
      return
    }

    const data = await response.json()
    setEmpreendimentoNome(data.data.name)
    setIsActive(data.data.isActive ? 'true' : 'false')
  }

  useEffect(() => {
    const componentRender = async () => {
      await getEmpreendimento()
      setIsLoading(false)
    }

    componentRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="flex flex-col items-start gap-6 w-full h-full p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Card className="size-full p-8">
        {isLoading ? (
          <Card>
            <div className="flex w-full h-full justify-center items-center">
              <LoaderCircle className="flex animate-spin duration-700 self-center text-neutral-500" />
            </div>
          </Card>
        ) : (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="empreendimento">Empreendimento</Label>
              <Input
                value={empreendimentoNome}
                type="text"
                id="empreendimento"
                placeholder="Nome"
                onChange={handleName}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mt-6">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={setIsActive} value={isActive}>
                <SelectTrigger id="status" className="w-[260px] cursor-pointer">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  <SelectItem className="cursor-pointer" value="true">
                    Ativo
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="false">
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-1.5 mt-6">
              <Trash
                onClick={deleteDevelopment}
                className="bg-red-600 text-neutral-100 p-1 rounded cursor-pointer hover:scale-110 duration-100"
                width={30}
                height={30}
              />
            </div>
            <div className="w-full flex justify-end gap-2">
              <Link href="/dashboard/agenda-vistorias/empreendimentos">
                <Button variant="destructive">Cancelar</Button>
              </Link>
              <Button
                onClick={patchDevelopment}
                variant="default"
                className="bg-azul-claro-vca hover:bg-verde-vca"
              >
                Salvar
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  )
}
export default EditarEmpreendimento
