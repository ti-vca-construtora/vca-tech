'use client'

import { Solucoes, SolucoesCard } from '@/components/solucoes-card'
import { FaLaptopCode } from 'react-icons/fa'
import { HiUsers } from 'react-icons/hi2'
import { LuScanQrCode } from 'react-icons/lu'
import { VscTasklist } from 'react-icons/vsc'

const solucoesData: Solucoes[] = [
  {
    titulo: 'Dashboard de controle',
    descricao: 'Dashboard para controle de cargas.',
    Icon: VscTasklist,
    href: 'controle-cargas/dashboard?title=Dashboard de controle',
    area: 'obras',
    permission: 'dashboard-controle',
  },
  {
    titulo: 'Validar comprovantes',
    descricao: 'Permite validar os comprovantes gerados pelos sistema.',
    Icon: LuScanQrCode,
    href: 'controle-cargas/validador?title=Validador de comprovantes',
    area: 'obras',
    permission: 'validar-comprovantes',
  },
  {
    titulo: 'Usuários e cartões',
    descricao: 'Permite gerenciar usuários e cartões de acesso.',
    Icon: HiUsers,
    href: 'controle-cargas/usuarios?title=Gerenciar usuários',
    area: 'obras',
    permission: 'gerenciar-usuarios',
  },
  {
    titulo: 'Equipamentos',
    descricao: 'Permite gerenciar equipamentos.',
    Icon: FaLaptopCode,
    href: 'controle-cargas/equipments?title=Gerenciar equipamentos',
    area: 'obras',
    permission: 'gerenciar-equipamentos',
  },
]

const ControleCargasTools = () => {
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

export default ControleCargasTools
