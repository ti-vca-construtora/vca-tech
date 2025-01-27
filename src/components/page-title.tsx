'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function PageTitle() {
  const searchParams = useSearchParams()
  const [pageTitle, setPageTitle] = useState<string | null>(null)

  useEffect(() => {
    const title = searchParams.get('title')
    setPageTitle(title)
  }, [searchParams])

  return (
    <div className="flex items-center shadow-md bg-neutral-100 p-4 rounded-lg">
      <h1 className="text-lg font-semibold md:text-xl text-azul-vca">
        {pageTitle || 'Painel de Soluções'}
      </h1>
    </div>
  )
}
