import React from 'react'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'
import { PiCalculator } from 'react-icons/pi'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Simulação de Quitação de Contrato',
    descricao: 'Efetua o cálculo de juros para quitação de contrato.',
    Icon: PiCalculator,
    href: 'quitacao-contrato?title=Simulação de Quitação de Contrato',
  },
]

const Diretoria = () => {
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

export default Diretoria
