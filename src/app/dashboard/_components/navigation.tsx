'use client'

import { IoIosArrowForward } from 'react-icons/io'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { Loader2 } from 'lucide-react'
import { formatarRota } from '@/app/util'

export function Navigation() {
  const [formattedPathname, setFormattedPathname] = useState([''])
  const pathname = usePathname()
  const router = useRouter()

  const formatPathname = () => {
    const formated = pathname.split('/')

    setFormattedPathname(formated)
  }

  useEffect(() => {
    formatPathname()
  }, [pathname])

  const handleClick = () => {
    const previousPath = pathname.split('/').map((item, index, self) => {
      if (index < self.length - 1) {
        return item
      }

      return ''
    })

    router.push(`${previousPath.join('/')}`)
  }

  return formattedPathname.length ? (
    <nav className="flex gap-1 w-full">
      {formattedPathname.map((item, index, self) => (
        <div key={index} className="flex gap-1 items-center">
          <button
            className={classNames(
              'font-normal',
              index + 1 === self.length
                ? 'text-neutral-800 font-semibold'
                : 'text-neutral-400 font-normal',
            )}
            onClick={handleClick}
          >
            {formatarRota(item)}
          </button>
          {index + 1 === self.length || (
            <IoIosArrowForward className="text-neutral-600" />
          )}
        </div>
      ))}
    </nav>
  ) : (
    <nav>
      <Loader2 className="animation-spin duration-1000" />
    </nav>
  )
}
