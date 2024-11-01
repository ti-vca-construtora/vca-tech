import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Contrato, ContratosTabela } from './contratos-tabela'
import { Dispatch, SetStateAction } from 'react'
import { GoX } from 'react-icons/go'
import { ParcelasFull } from './form'

type Modal = {
  action: Dispatch<SetStateAction<boolean>>
  setParcelas: Dispatch<SetStateAction<ParcelasFull>>
  setContratosInfo: Dispatch<SetStateAction<Contrato>>
  contratos: Contrato[]
  document: {
    documentType: 'cpf' | 'cnpj'
    documentNumber: string
    customerId: string
  }
}

export function Modal({
  action,
  contratos,
  document,
  setParcelas,
  setContratosInfo,
}: Modal) {
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
            <GoX className="text-xl" />
          </div>
          <AlertDialogTitle>
            Contratos atrelados ao{' '}
            <span className="uppercase">{document.documentType}: </span>
            {document.documentNumber}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <ContratosTabela
              setContratosInfo={setContratosInfo}
              setParcelas={setParcelas}
              customerId={document.customerId}
              contratos={contratos}
              action={action}
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
