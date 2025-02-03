export function Calendar() {
  const atualDate = new Date()
  const currentMonth = atualDate.getMonth()
  const currentYear = atualDate.getFullYear()
  const atualDay = atualDate.getDate()

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const trTable = () => {
    let day = atualDay + 3
    let month = currentMonth
    let year = currentYear

    return (
      <thead>
        <tr>
          {Array.from({ length: 30 }, (_, i) => {
            const daysInMonth = getDaysInMonth(month, year)
            if (day > daysInMonth) {
              day = 1
              month += 1
              if (month > 11) {
                month = 0
                year += 1
              }
            }
            const displayDay = day.toString().padStart(2, '0')
            const displayMonth = (month + 1).toString().padStart(2, '0')
            day += 1
            return (
              <th
                key={i}
                className="border py-2 px-2 text-center bg-gray-100"
              >{`${displayDay}/${displayMonth}`}</th>
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
            {Array.from({ length: 30 }, (_, colIndex) => (
              <td
                key={colIndex}
                className="cursor-pointer border py-4 px-3 text-center hover:bg-gray-200"
              >
                {rowIndex === 0 && '08:00 às 09:30'}
                {rowIndex === 1 && '10:00 às 11:30'}
                {rowIndex === 2 && '13:30 às 15:00'}
                {rowIndex === 3 && '15:00 às 16:30'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  return (
    <div className="max-w-screen-sm">
      <div className="flex flex-col p-2 justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm w-full h-auto">
        <div className="flex w-full justify-evenly items-center mb-5">
          <h1 className="flex items-center text-center justify-center font-semibold text-2xl text-trasform: capitalize">
            Agenda ativa:
          </h1>
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
