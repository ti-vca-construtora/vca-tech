import { RouteGuard } from '@/components/route-guard'
import AgendamentoTools from './_components/options'

export default function AgendaVistorias() {
  return (
    <RouteGuard
      requiredArea="entregas"
      requiredPermission="agendamento-vistorias"
    >
      <div className="size-full flex p-6">
        <AgendamentoTools />
      </div>
    </RouteGuard>
  )
}
