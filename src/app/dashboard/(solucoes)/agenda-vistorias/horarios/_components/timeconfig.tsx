import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TimeConfig() {
  return (
    <div>
      <div className="mb-4">
        <label>Horário 1</label>
        <div className="flex justify-center items-center">
          <Input type="time" />
          <span className="mx-3">às</span>
          <Input type="time" />
        </div>
      </div>
      <div className="mb-4">
        <label>Horário 2</label>
        <div className="flex justify-center items-center">
          <Input type="time" />
          <span className="mx-3">às</span>
          <Input type="time" />
        </div>
      </div>
      <div className="mb-4">
        <label>Horário 3</label>
        <div className="flex justify-center items-center">
          <Input type="time" />
          <span className="mx-3">às</span>
          <Input type="time" />
        </div>
      </div>
      <div className="mb-4">
        <label>Horário 4</label>
        <div className="flex justify-center items-center">
          <Input type="time" />
          <span className="mx-3">às</span>
          <Input type="time" />
        </div>
      </div>
      <div className="mb-4">
        <label>Horário 5</label>
        <div className="flex justify-center items-center">
          <Input type="time" />
          <span className="mx-3">às</span>
          <Input type="time" />
        </div>
      </div>
      <div className="mb-4">
        <label>Horário 6</label>
        <div className="flex justify-center items-center">
          <Input type="time" />
          <span className="mx-3">às</span>
          <Input type="time" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="bg-azul-claro-vca text-white hover:bg-azul-vca hover:text-white"
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}
