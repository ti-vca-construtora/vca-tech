import React from 'react'
import { CiCalculator1 } from 'react-icons/ci'
import { PiPixLogo, PiCalendarCheckDuotone } from 'react-icons/pi'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Calculadora de Antecipação de Parcelas',
    descricao: 'Efetua o cálculo de juros para antecipação de parcelas.',
    Icon: CiCalculator1,
    href: 'calculadora-juros?title=AVP - Calculadora de Juros de Parcelas',
  },
  {
    titulo: 'Gerador de Pix',
    descricao: 'Gera QR Codes individuais ou em massa identificáveis.',
    Icon: PiPixLogo,
    href: 'gerador-pix?title=Gerador de Pix',
  },
  {
    titulo: 'Agenda de Vistorias',
    descricao: 'Configura e relaciona a agenda de vistorias do cliente.',
    Icon: PiCalendarCheckDuotone,
    href: 'agenda-vistorias?title=Agenda de Vistorias',
  },
]

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
