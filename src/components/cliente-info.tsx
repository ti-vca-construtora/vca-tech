import { formatarCpfCnpj } from "@/util";
import { Cliente } from "./search-form";
import { Contrato } from "@/app/dashboard/(solucoes)/calculadora-juros/_components/contratos-tabela";

type ClienteInfoProps = {
  cliente: Cliente;
  contrato: Contrato;
};

export function ClienteInfo({ cliente, contrato }: ClienteInfoProps) {
  return (
    <div className="bg-neutral-50 shadow-md rounded w-full p-2 flex justify-between items-start">
      <div className="rounded p-2 flex flex-col gap-2">
        <span className="text-azul-vca">
          Nome do Cliente: <span className="font-bold">{cliente.name}</span>
        </span>
        <span className="text-azul-vca">
          CPF/CNPJ:{" "}
          <span className="font-bold">
            {formatarCpfCnpj(cliente.documentNumber)}
          </span>
        </span>
        <span className="text-azul-vca">
          Empreendimento:{" "}
          <span className="font-bold">{contrato.enterpriseName}</span>
        </span>
      </div>
      <div className="rounded p-2 flex flex-col gap-2">
        <span className="text-azul-vca">
          Contrato: <span className="font-bold">{contrato.contractNumber}</span>
        </span>
        <span className="text-azul-vca">
          Unidade: <span className="font-bold">{contrato.unit}</span>
        </span>
      </div>
    </div>
  );
}
