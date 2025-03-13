import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Contrato,
  ContratosTabela,
  FetchHandler,
} from '../app/dashboard/calculadora-juros/_components/contratos-tabela'
import { Dispatch, SetStateAction } from 'react'
import { GoX } from 'react-icons/go'

type ContractsModalProps<T> = {
  action: Dispatch<SetStateAction<boolean>>
  contratos: Contrato[]
  document: {
    documentType: 'cpf' | 'cnpj'
    documentNumber: string
    customerId: string
  }
  setContratosInfo: Dispatch<SetStateAction<Contrato>>
  fetchHandler: FetchHandler<T>
  setData: Dispatch<SetStateAction<T>>
}

export function ContractsModal<T>({
  action,
  contratos,
  document,
  setContratosInfo,
  fetchHandler,
  setData,
}: ContractsModalProps<T>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        id="modal-trigger"
        className="bg-neutral-800 hidden w-fit p-2 rounded text-white text-sm"
      >
        Visualizar Contratos
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="absolute top-3 right-3">
            <GoX
              onClick={() => window.location.reload()}
              className="text-xl cursor-pointer"
            />
          </div>
          <AlertDialogTitle>
            Contratos atrelados ao{' '}
            <span className="uppercase">{document.documentType}: </span>
            {document.documentNumber}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <ContratosTabela<T>
              action={action}
              setContratosInfo={setContratosInfo}
              contratos={contratos}
              customerId={document.customerId}
              fetchHandler={fetchHandler}
              setData={setData}
              document={document.documentNumber}
              documentType={document.documentType}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
