import Link from 'next/link'
import { GrMoney } from 'react-icons/gr'
import { IconType } from 'react-icons/lib'
import {
  MdConstruction,
  MdHowToReg,
  MdOutlineRealEstateAgent,
} from 'react-icons/md'
// import { BsPeopleFill } from 'react-icons/bs'
// import { GoLaw } from 'react-icons/go'

type Setor = {
  title: string
  href: string
  Icon: IconType
}

const setoresData: Setor[] = [
  {
    title: 'Financeiro',
    href: '/dashboard/setores/financeiro?title=Painel de Soluções - Financeiro',
    Icon: GrMoney,
  },
  {
    title: 'Relacionamento',
    href: '/dashboard/setores/relacionamento?title=Painel de Soluções - Relacionamento',
    Icon: MdOutlineRealEstateAgent,
  },
  {
    title: 'Entregas',
    href: '/dashboard/setores/entregas?title=Painel de Soluções - Entregas',
    Icon: MdHowToReg,
  },
  {
    title: 'Obras',
    href: '/dashboard/setores/obras?title=Painel de Soluções - Obras',
    Icon: MdConstruction,
  },
  // {
  //   title: 'Jurídico',
  //   href: '/app/relacionamento',
  //   Icon: GoLaw,
  // },
  // {
  //   title: 'RH',
  //   href: '/app/relacionamento',
  //   Icon: BsPeopleFill,
  // },
  // {
  //   title: 'Contabilidade',
  //   href: '/app/relacionamento',
  //   Icon: MdAccountBalance,
  // },
]

export default function Setores() {
  return (
    <section className="flex items-start gap-6 w-full h-full p-6">
      {setoresData.map((item, index) => (
        <SetorCard
          key={index}
          title={item.title}
          href={item.href}
          Icon={item.Icon}
        />
      ))}
    </section>
  )
}

function SetorCard({ title, href, Icon }: Setor) {
  return (
    <Link
      href={href}
      className="shadow-md bg-neutral-50 text-azul-vca hover:text-verde-vca transition-colors rounded-md p-6 aspect-square size-44 text-lg font-bold flex flex-col gap-3 items-center justify-center"
    >
      <Icon className="size-24" />
      <span>{title}</span>
    </Link>
  )
}
