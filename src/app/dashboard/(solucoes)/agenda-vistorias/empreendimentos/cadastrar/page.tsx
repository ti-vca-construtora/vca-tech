/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'

const optionsVca = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    email: process.env.NEXT_PUBLIC_EMAIL_CV_API_VCA || '',
    token: process.env.NEXT_PUBLIC_TOKEN_CV_API_VCA || '',
  },
}

const optionsLotear = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    email: process.env.NEXT_PUBLIC_EMAIL_CV_API_LOTEAR || '',
    token: process.env.NEXT_PUBLIC_TOKEN_CV_API_LOTEAR || '',
  },
}

const fetchCustomerData = async (
  vendidaId: string,
  isVca: boolean
): Promise<string> => {
  if (!vendidaId) return 'SEM CLIENTE'

  try {
    const baseUrl = isVca
      ? 'https://vca.cvcrm.com.br'
      : 'https://vcalotear.cvcrm.com.br'
    const options = isVca ? optionsVca : optionsLotear

    const response = await fetch(
      `${baseUrl}/api/v1/comercial/reservas/${vendidaId}`,
      options
    )

    if (!response.ok) {
      console.warn(
        `Erro ao buscar dados do cliente para vendidaId: ${vendidaId}`
      )
      return 'SEM CLIENTE'
    }

    const data = await response.json()
    const clientName = data[vendidaId]?.titular?.nome

    return clientName && clientName.trim() !== '' ? clientName : 'SEM CLIENTE'
  } catch (error) {
    console.error(`Erro ao buscar cliente para vendidaId ${vendidaId}:`, error)
    return 'SEM CLIENTE'
  }
}

const CadastrarEmpreendimento = () => {
  const [empreendimentoId, setEmpreendimentoId] = useState<number>(0)
  const [empreendimentosCV, setEmpreendimentosCV] = useState<
    { id: number; nome: string }[]
  >([])
  const [isActive, setIsActive] = useState<string | boolean>('')
  const [submiting, setSubmiting] = useState(false)
  const [submitingProgress, setSubmitingProgress] = useState(0)

  const sucessNotif = () =>
    toast.success('Empreendimento cadastrado.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const warnNotif = () =>
    toast.warn('Preencha os campos!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const errorNotif = () =>
    toast.error('Falha no cadastro.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const buscaCv = async () => {
    if (empreendimentoId === 0 || isActive === '') {
      warnNotif()
      return
    }

    const empreendimento: { nome: string; id: string } = {
      nome: '',
      id: '',
    }
    const unitsOfEmp: {
      nome: string
      id: string
      bloco: string
      vendidaId: string | null
      isVca: boolean
    }[] = []

    try {
      const responseVca = await fetch(
        `https://vca.cvcrm.com.br/api/cvio/empreendimento/${empreendimentoId}?limite_dados_unidade=1000&pagina_unidade=1`,
        optionsVca
      )
      const dataVca = await responseVca.json()

      if (dataVca?.idempreendimento) {
        empreendimento.nome = dataVca.nome
        empreendimento.id = dataVca.idempreendimento.toString()

        if (dataVca?.etapas) {
          dataVca.etapas.forEach((etapa: any) => {
            etapa.blocos?.forEach((bloco: any) => {
              if (bloco.unidades) {
                unitsOfEmp.push(
                  ...bloco.unidades.map((u: any) => ({
                    nome: u.nome,
                    id: u.idunidade.toString(),
                    bloco: bloco.nome,
                    vendidaId: u.situacao?.vendida?.toString() || null,
                    isVca: true,
                  }))
                )
              }
            })
          })
        }
        await createDevelopment(empreendimento, unitsOfEmp)
        return
      } else {
        throw new Error('Empreendimento não encontrado na base VCA')
      }
    } catch (e) {
      console.warn('Tentativa na base VCA falhou, tentando na base Lotear...')
    }

    try {
      const responseLotear = await fetch(
        `https://vcalotear.cvcrm.com.br/api/cvio/empreendimento/${empreendimentoId}?limite_dados_unidade=1000&pagina_unidade=1`,
        optionsLotear
      )
      const dataLotear = await responseLotear.json()

      if (dataLotear?.idempreendimento) {
        empreendimento.nome = dataLotear.nome
        empreendimento.id = dataLotear.idempreendimento.toString()

        if (dataLotear?.etapas) {
          dataLotear.etapas.forEach((etapa: any) => {
            etapa.blocos?.forEach((bloco: any) => {
              if (bloco.unidades) {
                unitsOfEmp.push(
                  ...bloco.unidades.map((u: any) => ({
                    nome: u.nome,
                    id: u.idunidade.toString(),
                    bloco: bloco.nome,
                    vendidaId: u.situacao?.vendida?.toString() || null,
                    isVca: false,
                  }))
                )
              }
            })
          })
        }
      } else {
        console.error('Empreendimento não encontrado em nenhuma das bases.')
      }
    } catch (e) {
      console.error('Erro ao carregar unidades do CV Lotear', e)
    }
    await createDevelopment(empreendimento, unitsOfEmp)
  }

  const createDevelopment = async (
    empreendimento: {
      nome: string
      id: string
    },
    unitsOf: {
      nome: string
      id: string
      bloco: string
      vendidaId: string | null
      isVca: boolean
    }[]
  ) => {
    setSubmiting(true)
    setSubmitingProgress(0)

    const isActiveBoolean = isActive === 'true'

    const response = await fetch('/api/vistorias/empreendimentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: empreendimento.nome,
        externalId: empreendimento.id,
        isActive: isActiveBoolean,
      }),
    })
    if (!response.ok) {
      console.error('Erro ao criar o empreendimento')
      errorNotif()
      return
    }
    const data = await response.json()

    if (!data?.data?.id) {
      console.error(
        'Erro: ID do empreendimento não encontrado na resposta',
        data
      )
      errorNotif()
      setSubmiting(false)
      return
    }

    const apiId: string = data.data.id
    await createUnits(apiId, unitsOf)
    console.log('Empreendimento criado:', data)
    setSubmiting(false)
    sucessNotif()
    setTimeout(() => {
      window.location.href = '/dashboard/agenda-vistorias/empreendimentos'
    }, 3000)
  }

  const createUnits = async (
    apiId: string,
    unitsOf: {
      nome: string
      id: string
      bloco: string
      vendidaId: string | null
      isVca: boolean
    }[]
  ) => {
    if (!apiId) {
      console.error('apiId não foi fornecido!')
      return
    }

    if (unitsOf.length === 0) {
      console.error('unitsOf não foi fornecido!')
      return
    }

    for (const unit of unitsOf) {
      const progressQuantity = 100 / unitsOf.length
      setSubmitingProgress((prev) => prev + progressQuantity)

      try {
        // Buscar dados do cliente se houver vendidaId
        const customerName = unit.vendidaId
          ? await fetchCustomerData(unit.vendidaId, unit.isVca)
          : 'SEM CLIENTE'

        const response = await fetch('/api/vistorias/unidades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            developmentId: apiId,
            unit: unit.nome,
            externalId: unit.id,
            block: unit.bloco,
            customerName,
          }),
        })

        if (!response.ok) {
          console.error('Erro ao criar unidade:', unit.nome)
          continue
        }

        const data = await response.json()
        console.log('Unidade criada:', unit.nome, data)
      } catch (error) {
        console.error('Erro ao criar unidade:', unit.nome, error)
      }
    }
  }

  const retornaEmpreendimentos = async () => {
    try {
      const responseVca = await fetch(
        'https://vca.cvcrm.com.br/api/cvio/empreendimento',
        optionsVca
      )
      const dataVca = await responseVca.json()

      const responseLotear = await fetch(
        'https://vcalotear.cvcrm.com.br/api/cvio/empreendimento',
        optionsLotear
      )
      const dataLotear = await responseLotear.json()

      const empreendimentos = [
        ...dataVca.map((item: any) => ({
          id: item.idempreendimento,
          nome: item.nome,
        })),
        ...dataLotear.map((item: any) => ({
          id: item.idempreendimento,
          nome: item.nome,
        })),
      ].sort((a, b) => a.nome.localeCompare(b.nome))

      setEmpreendimentosCV(empreendimentos)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    retornaEmpreendimentos()
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
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="empreendimento">Empreendimento</Label>
          {/* <Input
            type="text"
            id="empreendimento"
            placeholder="Nome"
            onChange={handleName}
          /> */}
          <Select onValueChange={(value) => setEmpreendimentoId(Number(value))}>
            <SelectTrigger
              id="empreendimento"
              className="w-full cursor-pointer"
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {empreendimentosCV.map((empreendimento) => (
                <SelectItem
                  key={empreendimento.id}
                  className="cursor-pointer"
                  value={String(empreendimento.id)}
                >
                  {empreendimento.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-6">
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={setIsActive}>
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
        <div className="w-full flex justify-end gap-2">
          <Link href="/dashboard/agenda-vistorias/empreendimentos">
            <Button
              variant="destructive"
              onClick={(e) => {
                if (submiting) {
                  e.preventDefault()
                  window.location.reload()
                }
              }}
            >
              {submiting ? 'Abortar' : 'Cancelar'}
            </Button>
          </Link>
          {!submiting && (
            <Button
              onClick={buscaCv}
              variant="default"
              className="bg-azul-claro-vca hover:bg-verde-vca"
            >
              Salvar
            </Button>
          )}
        </div>

        {submiting ? (
          <div className="mt-20">
            <h2 className="text-lg font-semibold">Progresso do Cadastro</h2>
            <p className="text-sm text-muted-foreground">
              Cadastrando empreendimento e unidades ...
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Progress value={submitingProgress} className="flex-1" />
              <span className="text-sm font-medium text-azul-vca min-w-[50px]">
                {Math.round(submitingProgress)}%
              </span>
            </div>
          </div>
        ) : (
          ''
        )}
      </Card>
    </section>
  )
}
export default CadastrarEmpreendimento
