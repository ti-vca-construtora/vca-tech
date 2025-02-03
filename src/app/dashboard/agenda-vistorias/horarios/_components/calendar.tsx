'use client'

import { useState } from 'react'
import { PiArrowCircleRight, PiArrowCircleLeft } from 'react-icons/pi'

export function Calendar() {
  const atualDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(atualDate.getMonth())
  const [countDaysMonth, setCountDaysMonth] = useState(
    new Date(atualDate.getFullYear(), atualDate.getMonth() + 1, 0).getDate(),
  )
  const [atualDay, setAtualDay] = useState(atualDate.getDate())
  const monthName = new Date(
    atualDate.getFullYear(),
    currentMonth,
  ).toLocaleString('pt-BR', { month: 'long' })

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = Math.max(prevMonth - 1, 0)
      setCountDaysMonth(
        new Date(atualDate.getFullYear(), newMonth + 1, 0).getDate(),
      )

      if (newMonth === atualDate.getMonth()) {
        setAtualDay(atualDate.getDate())
      } else {
        setAtualDay(0)
      }

      return newMonth
    })
  }

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = Math.min(prevMonth + 1, 11)
      setCountDaysMonth(
        new Date(atualDate.getFullYear(), newMonth + 1, 0).getDate(),
      )
      setAtualDay(0)
      return newMonth
    })
  }

  const trTable = () => {
    return (
      <thead>
        <tr>
          {Array.from({ length: countDaysMonth - atualDay }, (_, i) => {
            const day = (i + 1 + atualDay).toString().padStart(2, '0')
            return (
              <th
                key={i}
                className="border py-2 px-2 text-center bg-gray-100"
              >{`${day}/${(currentMonth + 1).toString().padStart(2, '0')}`}</th>
            )
          })}
        </tr>
      </thead>
    )
  }

  const tdTable = () => {
    return (
      <tbody>
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from(
              { length: countDaysMonth - atualDay },
              (_, colIndex) => (
                <td
                  key={colIndex}
                  className="cursor-pointer border py-4 px-3 text-center hover:bg-gray-200"
                >
                  {rowIndex === 0 && '08:00 às 09:30'}
                  {rowIndex === 1 && '10:00 às 11:30'}
                  {rowIndex === 2 && '13:30 às 15:00'}
                  {rowIndex === 3 && '15:00 às 16:30'}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    )
  }

  return (
    <div className="max-w-screen-sm">
      <div className="flex flex-col p-2 justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm w-full h-auto">
        <div className="flex w-full justify-evenly items-center mb-5">
          {currentMonth > atualDate.getMonth() && (
            <span className="cursor-pointer" onClick={prevMonth}>
              <PiArrowCircleLeft className="transition-all ease-in-out delay-50 rounded-xl w-8 h-8 hover:bg-gray-100" />
            </span>
          )}
          <h1 className="flex items-center text-center justify-center font-semibold text-2xl text-trasform: capitalize">
            {monthName}
          </h1>
          <span className="cursor-pointer" onClick={nextMonth}>
            <PiArrowCircleRight className="transition-all ease-in-out delay-50 rounded-xl w-8 h-8 hover:bg-gray-100" />
          </span>
        </div>
        <div id="agenda" className="overflow-x-auto w-full">
          <table className="min-w-max border-collapse">
            {trTable()}
            {tdTable()}
          </table>
        </div>
      </div>
    </div>
  )
}
