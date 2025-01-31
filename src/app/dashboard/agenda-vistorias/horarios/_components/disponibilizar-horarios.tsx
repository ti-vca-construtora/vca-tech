import { AccordionComp } from './accordion'
import { Calendar } from './calendar'

const DisponibilizarHorarios = () => {
  return (
    <div className="flex size-full p-6">
      <div className="w-1/3 mr-6 min-w-72">
        <AccordionComp />
      </div>
      <div className="max-w-2xl">
        <Calendar />
      </div>
    </div>
  )
}

export default DisponibilizarHorarios
