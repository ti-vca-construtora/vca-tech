'use client'

import {
  PiBuildingApartmentLight,
  PiCalendar,
  PiCalendarCheckDuotone,
  PiCalendarXDuotone,
  PiHouseLineLight,
} from 'react-icons/pi'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Agendamentos',
    descricao: 'Visualizar agendamentos realizados.',
    Icon: PiCalendarCheckDuotone,
    href: 'agenda-vistorias/agendamentos?title=Agendamentos',
    area: 'entregas',
    permission: 'agendamentos',
  },
  {
    titulo: 'Disponibilizar unidades',
    descricao: 'Disponibiliza a unidade para a vistoria.',
    Icon: PiHouseLineLight,
    href: 'agenda-vistorias/unidades?title=Disponibilizar unidades',
    area: 'entregas',
    permission: 'disponibilizar-unidades',
  },
  {
    titulo: 'Disponibilizar horários',
    descricao:
      'Disponibiliza horários para que o cliente realize agendamentos.',
    Icon: PiCalendar,
    href: 'agenda-vistorias/horarios?title=Configurar horários',
    area: 'entregas',
    permission: 'disponibilizar-horarios',
  },
  {
    titulo: 'Empreendimentos',
    descricao: 'Gerencia empreendimentos.',
    Icon: PiBuildingApartmentLight,
    href: 'agenda-vistorias/empreendimentos?title=Gerenciar empreendimentos',
    area: 'entregas',
    permission: 'gerenciar-empreendimentos',
  },
  {
    titulo: 'Recusas',
    descricao: 'Gerencia recusas.',
    Icon: PiCalendarXDuotone,
    href: 'agenda-vistorias/recusas?title=Gerenciar recusas',
    area: 'entregas',
    permission: 'gerenciar-recusas',
  },
]

const AgendamentoTools = () => {
  return (
    <div className="flex flex-col gap-3 h-full w-full p-4 a">
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

export default AgendamentoTools
