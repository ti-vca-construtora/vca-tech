'use client'

import { useState } from 'react'
import { Modal } from './modal'
import { ParcelasTabela } from './parcelas-tabela'

export function Form() {
  const [showTable, setShowTable] = useState(false)

  return (
    <div className="w-full h-full">
      {!showTable ? (
        <form className="border p-4 rounded flex flex-col gap-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-neutral-700" htmlFor="">
              Informe o CPF do cliente:
            </label>
            <input
              placeholder="CPF"
              className="border h-12 p-2 w-80 rounded shadow"
              type="text"
            />
          </div>
          <Modal action={setShowTable} />
        </form>
      ) : (
        <ParcelasTabela />
      )}
    </div>
  )
}
