'use client'

// import { RouteGuard } from '@/components/route-guard'

// import { useUser } from '@/hooks/use-user'
import { useEffect, useState } from 'react'
import { Carousel } from './_components/Carousel'

export default function AgendaVistorias() {
  // const { user } = useUser()

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (selectedIndex !== null) {
      console.log('Index recebido no pai:', selectedIndex)
    }
  }, [selectedIndex])

  return (
    // <RouteGuard
    //   requiredArea="entregas"
    //   requiredPermission="agendamento-vistorias"
    // >
    <div className="size-full flex items-center justify-center p-6">
      <Carousel onSlideChange={setSelectedIndex} />
    </div>
    // </RouteGuard>
  )
}
