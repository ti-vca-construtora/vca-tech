/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

const CadastrarEmpreendimento = () => {
  const [empreendimentoId, setEmpreendimentoId] = useState<number>(0)
  const [empreendimentosCV, setEmpreendimentosCV] = useState<
    { id: number; nome: string }[]
  >([])
  const [isActive, setIsActive] = useState<string | boolean>('')

  const buscaCv = async () => {
    if (empreendimentoId === 0 || isActive === '') {
      window.alert('Campos obrigatórios não preenchidos!')
      return
    }

    const empreendimento: { nome: string; id: string } = {
      nome: '',
      id: '',
    }
    const unitsOfEmp: { nome: string; id: string }[] = []

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
    unitsOf: { nome: string; id: string }[]
  ) => {
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
      return
    }
    const data = await response.json()
    const apiId: string = data.data.id
    await createUnits(apiId, unitsOf)
    console.log('Empreendimento criado:', data)
  }

  const createUnits = async (
    apiId: string,
    unitsOf: { nome: string; id: string }[]
  ) => {
    console.log('FUNÇÃO DE CRIAR UNIDADES CHAMADA!')

    if (!apiId) {
      console.error('apiId não foi fornecido!')
      return
    }

    if (unitsOf.length === 0) {
      console.error('unitsOf não foi fornecido!')
      return
    }

    console.log('segundo:', unitsOf)

    for (const unit of unitsOf) {
      try {
        const response = await fetch('/api/vistorias/unidades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            developmentId: apiId,
            unit: unit.nome,
            externalId: unit.id,
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
            <Button variant="destructive">Cancelar</Button>
          </Link>
          <Button
            onClick={buscaCv}
            variant="default"
            className="bg-azul-claro-vca hover:bg-verde-vca"
          >
            Salvar
          </Button>
        </div>
      </Card>
    </section>
  )
}
export default CadastrarEmpreendimento
