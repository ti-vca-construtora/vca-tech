"use client";

import { useState } from "react";
import { SearchForm, Cliente } from "@/components/search-form";
import { CombinedData, ContractsModal } from "@/components/contracts-modal";
import {
  handleFetchCurrentDebitBalance,
  handleFetchReceivableBills,
} from "@/util";
import { CurrentDebitBalanceApiResponse } from "@/app/api/avp/current-debit-balance/route";
import { IncomeByBillsApiResponse } from "@/app/api/avp/income-by-bills/route";
import { Contrato } from "./contratos-tabela";
import { ParcelasTabela } from "./parcelas-tabela";

export function FormContainer() {
  const [showTable, setShowTable] = useState(false);
  const [contratoInfo, setContratoInfo] = useState<Contrato>({
    contractNumber: "",
    enterpriseName: "",
    unit: "",
    origem: "",
    customerId: "",
  });
  const [clienteInfo, setClienteInfo] = useState<Cliente>({
    name: "",
    documentType: "cpf",
    documentNumber: "",
  });
  const [contratosFull, setContratosFull] = useState<Contrato[]>([]);
  const [combinedData, setCombinedData] = useState<
    CombinedData<IncomeByBillsApiResponse, CurrentDebitBalanceApiResponse>
  >({
    incomeByBills: { data: [] },
    currentDebit: { data: [] },
  });

  const handleSearchComplete = (data: {
    cliente: Cliente;
    contratos: Contrato[];
  }) => {
    setClienteInfo(data.cliente);
    setContratosFull(data.contratos);

    const modalTrigger = document.getElementById("modal-trigger");
    if (modalTrigger) {
      modalTrigger.click();
    }
  };

  return (
    <div className="w-full h-full">
      {!showTable ? (
        <SearchForm onSearchComplete={handleSearchComplete}>
          <ContractsModal<
            IncomeByBillsApiResponse,
            CurrentDebitBalanceApiResponse
          >
            action={setShowTable}
            contratos={contratosFull}
            document={{
              documentType: clienteInfo.documentType,
              documentNumber: clienteInfo.documentNumber,
              customerId: contratoInfo.customerId,
            }}
            setContratosInfo={setContratoInfo}
            combinedHandlers={{
              incomeByBills: handleFetchReceivableBills,
              currentDebit: handleFetchCurrentDebitBalance,
            }}
            setCombinedData={setCombinedData}
          />
        </SearchForm>
      ) : (
        <ParcelasTabela
          cliente={clienteInfo}
          contrato={contratoInfo}
          currentDebitBalance={combinedData.currentDebit}
          incomeByBills={combinedData.incomeByBills}
        />
      )}
    </div>
  );
}
