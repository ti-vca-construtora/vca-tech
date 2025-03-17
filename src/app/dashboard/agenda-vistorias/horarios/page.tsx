import { DisponibilizarHorarios } from './_components/disponibilizar-horarios'
import { Calendar } from './_components/calendar'

const Horarios = () => {
  return (
    <section className="flex p-6">
      <DisponibilizarHorarios />
      <Calendar />
    </section>
  )
}

export default Horarios
