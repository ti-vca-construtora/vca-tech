import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function CancellationConfig() {
  return (
    <div>
      <div className="mb-4">
        <label>Prazo máximo para cancelamento</label>
        <Input type="number" />
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
