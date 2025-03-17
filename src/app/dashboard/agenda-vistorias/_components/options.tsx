import {
  PiBuildingApartmentLight,
  PiCalendar,
  PiHouseLineLight,
} from 'react-icons/pi'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Disponibilizar unidades',
    descricao: 'Disponibiliza a unidade para a vistoria.',
    Icon: PiHouseLineLight,
    href: 'agenda-vistorias/unidades?title=Disponibilizar unidades',
  },
  {
    titulo: 'Disponibilizar horários',
    descricao:
      'Disponibiliza horários para que o cliente realize agendamentos.',
    Icon: PiCalendar,
    href: 'agenda-vistorias/horarios?title=Configurar horários',
  },
  {
    titulo: 'Empreendimentos',
    descricao: 'Gerencia empreendimentos.',
    Icon: PiBuildingApartmentLight,
    href: 'agenda-vistorias/empreendimentos?title=Gerenciar empreendimentos',
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
        />
      ))}
    </div>
  )
}

export default AgendamentoTools
