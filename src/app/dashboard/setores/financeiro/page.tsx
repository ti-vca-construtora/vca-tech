import React from 'react'
import { IconType } from 'react-icons/lib'
import { CiCalculator1 } from 'react-icons/ci'
import Link from 'next/link'

type Solucoes = {
  titulo: string
  descricao: string
  href: string
  Icon: IconType
}

const solucoesData: Solucoes[] = [
  {
    titulo: 'Calculadora de Antecipação de Parcelas',
    descricao: 'Efetua o cálculo de juros para antecipação de parcelas.',
    Icon: CiCalculator1,
    href: 'calculadora-juros',
  },
]

const SolucoesCard = ({ titulo, descricao, Icon, href }: Solucoes) => {
  return (
    <Link
      href={`/dashboard/${href}`}
      className="w-[600px] h-28 border rounded flex items-center gap-3 p-2"
    >
      <div className="text-6xl border rounded p-4">
        <Icon />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold text-neutral-700">{titulo}</span>
        <span className="text-sm text-neutral-600">{descricao}</span>
      </div>
    </Link>
  )
}

const Financeiro = () => {
  return (
    <div className="flex flex-col gap-3 h-full w-full p-4">
      {solucoesData.map((item, index) => (
        <SolucoesCard
          titulo={item.titulo}
          descricao={item.descricao}
          Icon={item.Icon}
          key={index}
          href={item.href}
        />
      ))}
    </div>
  )
}

export default Financeiro
