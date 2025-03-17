import { RouteGuard } from '@/components/route-guard'
import { FormContainer } from './_components/form-container'

export default function QuitacaoContrato() {
  return (
    <RouteGuard
      requiredArea="financeiro"
      requiredPermission="quitacao-contrato"
    >
      <div className="w-full h-full flex p-6">
        <FormContainer />
      </div>
    </RouteGuard>
  )
}
