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
} from '../app/dashboard/(solucoes)/calculadora-juros/_components/contratos-tabela'
import { Dispatch, SetStateAction } from 'react'
import { GoX } from 'react-icons/go'

export type CombinedData<T, U> = {
  incomeByBills: T
  currentDebit: U
}

type ContractsModalProps<T, U = never> = {
  action: Dispatch<SetStateAction<boolean>>
  contratos: Contrato[]
  document: {
    documentType: 'cpf' | 'cnpj'
    documentNumber: string
    customerId: string
  }
  setContratosInfo: Dispatch<SetStateAction<Contrato>>
  fetchHandler?: FetchHandler<T>
  setData?: Dispatch<SetStateAction<T>>
  combinedHandlers?: {
    incomeByBills: FetchHandler<T>
    currentDebit: FetchHandler<U>
  }
  setCombinedData?: Dispatch<SetStateAction<CombinedData<T, U>>>
}

export function ContractsModal<T, U>({
  action,
  contratos,
  document,
  setContratosInfo,
  fetchHandler,
  setData,
  combinedHandlers,
  setCombinedData,
}: ContractsModalProps<T, U>) {
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
            <ContratosTabela<T, U>
              action={action}
              setContratosInfo={setContratosInfo}
              contratos={contratos}
              fetchHandler={fetchHandler}
              setData={setData}
              combinedHandlers={combinedHandlers}
              setCombinedData={setCombinedData}
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
