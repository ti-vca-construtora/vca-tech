'use client'

import React from 'react'
import { CiCalculator1 } from 'react-icons/ci'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Calculadora de Antecipação de Parcelas',
    descricao: 'Efetua o cálculo de juros para antecipação de parcelas.',
    Icon: CiCalculator1,
    href: 'calculadora-juros?title=AVP - Calculadora de Juros de Parcelas',
    area: 'financeiro',
    permission: 'avp',
  },
]

const Relacionamento = () => {
  return (
    <div className="flex flex-col gap-3 h-full w-full p-4">
      {solucoesData.map((item, index) => (
        <SolucoesCard
          titulo={item.titulo}
          descricao={item.descricao}
          Icon={item.Icon}
          key={index}
          href={item.href}
          area={item.area}
          permission={item.permission}
        />
      ))}
    </div>
  )
}

export default Relacionamento
