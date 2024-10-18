import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ContratosTabela } from './contratos-tabela'
import { Dispatch, SetStateAction } from 'react'

type Modal = {
  action: Dispatch<SetStateAction<boolean>>
}

export function Modal({ action }: Modal) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-neutral-800 w-fit p-2 rounded text-white">
        Buscar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Contratos atrelados ao CPF: 000.000.000.01
          </AlertDialogTitle>
          <AlertDialogDescription>
            <ContratosTabela action={action} />
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
