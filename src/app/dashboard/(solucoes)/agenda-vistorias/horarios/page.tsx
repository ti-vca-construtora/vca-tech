import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from './_components/calendar'
import { DisponibilizarHorarios } from './_components/disponibilizar-horarios'

const Horarios = () => {
  return (
    <section className="flex p-6 flex-col">
      <div className="grid w-full items-center gap-1.5 mb-4">
        <Label htmlFor="empreendimento">Empreendimento</Label>
        <Select>
          <SelectTrigger
            id="empreendimento"
            className="w-full cursor-pointer bg-white"
          >
            <SelectValue placeholder="TODOS" />
          </SelectTrigger>
          <SelectContent className="cursor-pointer">
            <SelectItem className="cursor-pointer" value="TODOS">
              TODOS
            </SelectItem>
            <SelectItem className="cursor-pointer" value="EMPREENDIMENTO 1">
              EMPREENDIMENTO 1
            </SelectItem>
            <SelectItem className="cursor-pointer" value="EMPREENDIMENTO 2">
              EMPREENDIMENTO 2
            </SelectItem>
            <SelectItem className="cursor-pointer" value="EMPREENDIMENTO 3">
              EMPREENDIMENTO 3
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex">
        <DisponibilizarHorarios />
        <Calendar />
      </div>
    </section>
  )
}

export default Horarios
