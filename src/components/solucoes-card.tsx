import Link from 'next/link'
import { IconType } from 'react-icons/lib'

export type Solucoes = {
  titulo: string
  descricao: string
  href: string
  Icon: IconType
}

export function SolucoesCard({ titulo, descricao, Icon, href }: Solucoes) {
  return (
    <Link
      href={`/dashboard/${href}`}
      className="w-[480px] h-28 shadow-md bg-neutral-50 text-azul-vca hover:text-verde-vca transition-colors rounded flex items-center gap-3 p-2"
    >
      <div className="text-6xl shadow-md rounded p-4">
        <Icon />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">{titulo}</span>
        <span className="text-xs">{descricao}</span>
      </div>
    </Link>
  )
}
