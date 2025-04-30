'use client'

import { GiKickScooter } from 'react-icons/gi'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Reservar Patinete',
    descricao: 'Reserva de patinete para os colaboradores VCA.',
    Icon: GiKickScooter,
    href: 'reserva-patinete?title=Reserva de Patinete',
    area: 'publico',
    permission: 'reservar-patinete',
  },
]
// 8
const Publico = () => {
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

export default Publico
