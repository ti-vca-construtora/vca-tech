'use client'

import { IoIosArrowForward } from 'react-icons/io'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

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
              'font-normal first-letter:uppercase',
              index + 1 === self.length
                ? 'text-neutral-800 font-bold'
                : 'text-neutral-400 font-semibold',
            )}
            onClick={handleClick}
          >
            {item}
          </button>
          {index + 1 === self.length || (
            <IoIosArrowForward className="text-neutral-600" />
          )}
        </div>
      ))}
    </nav>
  ) : (
    <nav>ok</nav>
  )
}
