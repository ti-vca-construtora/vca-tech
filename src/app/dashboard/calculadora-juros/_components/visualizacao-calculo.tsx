import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Contrato } from './contratos-tabela'
import { Cliente } from './form'
import { ParcelaSelecionada } from './parcelas-tabela'
import {
  buscaTaxaPorContrato,
  calcularDiferencaDias,
  calcularTJM,
  calcularVPA,
  exportJsonToExcel,
  formatarData,
  formatarValor,
} from '@/app/util'
import { useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import classNames from 'classnames'
import { IncomeByBillsApiResponse } from '@/app/api/income-by-bills/route'
import { PiDownload } from 'react-icons/pi'

type VisualizaoCalculo = {
  valor: number
  dataAPagar: string
  parcelasSelecionadas: ParcelaSelecionada[]
  parcelas: IncomeByBillsApiResponse
  cliente: Cliente
  contrato: Contrato
}

export type CalculoPorParcela = {
  valorAnterior: number
  valorPresente: number
  dataAPagar: string
  dataVencimento: string
  taxa: number
}

export function VisualizaoCalculo({
  valor,
  dataAPagar,
  parcelasSelecionadas,
  parcelas,
  cliente,
  contrato,
}: VisualizaoCalculo) {
  const [calculoPorParcela, setCalculoPorParcela] = useState<
    CalculoPorParcela[]
  >([])

  const getValorPresentePorParcela = () => {
    const taxaAdm = buscaTaxaPorContrato(contrato.contractNumber)?.taxaAdm
    const taxaTotal = buscaTaxaPorContrato(contrato.contractNumber)?.taxaTotal
    let taxaAnual: number
    const primeiraParcela = parcelasSelecionadas[0]

    const parcelaDoMesDoPagamento = parcelas.data.find((item) => {
      const dueDate = new Date(`${item.dueDate}T03:00:00Z`)
      const pagarDate = new Date(`${dataAPagar}T03:00:00Z`)

      console.log(item.dueDate)
      console.log(dataAPagar)
      console.log(pagarDate)

      return (
        dueDate.getFullYear() === pagarDate.getFullYear() &&
        dueDate.getMonth() === pagarDate.getMonth()
      )
    })

    const calculoParcelas = parcelasSelecionadas.map((item) => {
      const tipoDeParcela = item.paymentTerm.id
      const diferencaDias = calcularDiferencaDias(dataAPagar, item.dueDate)

      if (taxaTotal && taxaAdm) {
        taxaAnual = taxaTotal - taxaAdm
      }

      let valorPorParcela = 0

      switch (tipoDeParcela.trim()) {
        case 'FP': {
          const dataAPagarDate = new Date(dataAPagar)
          const dataVencimento = new Date(item.dueDate)

          const isMesAtual =
            dataVencimento.getFullYear() === dataAPagarDate.getFullYear() &&
            dataVencimento.getMonth() === dataAPagarDate.getMonth()

          if (isMesAtual) {
            valorPorParcela = item.correctedBalanceAmount
          } else if (taxaAnual) {
            const taxaDeJurosMensal = calcularTJM(taxaAnual)
            const mesesDeDiferenca = diferencaDias / 30

            valorPorParcela = calcularVPA(
              taxaDeJurosMensal,
              mesesDeDiferenca,
              item.correctedBalanceAmount,
            )
          }
          break
        }

        case 'PP':
        case 'M':
          valorPorParcela = item.correctedBalanceAmount * 1
          break

        // Para tipos 'M1', 'M2', ..., 'M9' ou '10', '11', '12', etc.
        case tipoDeParcela.match(/^M\d+$/)?.input: // Regex para M seguido de um número
        case tipoDeParcela.match(/^\d{2,}$/)?.input: // Regex para números de 10 ou mais dígitos
          if (parcelaDoMesDoPagamento) {
            valorPorParcela = parcelaDoMesDoPagamento.originalAmount

            break
          }
          valorPorParcela = primeiraParcela.correctedBalanceAmount

          break

        default:
          valorPorParcela = item.correctedBalanceAmount
          break
      }

      return {
        valorAnterior: item.correctedBalanceAmount,
        valorPresente: valorPorParcela,
        dataAPagar,
        dataVencimento: item.dueDate,
        taxa: taxaAnual,
      }
    })

    setCalculoPorParcela(calculoParcelas)
  }

  const getValorPresenteTotal = () => {
    return calculoPorParcela.reduce(
      (soma, parcela) => soma + parcela.valorPresente,
      0,
    )
  }

  useEffect(() => {
    getValorPresentePorParcela()
  }, [])

  return (
    <section className="flex flex-col gap-4 justify-between items-center w-full">
      <div className="flex gap-4 justify-between w-full items-center h-full">
        <Card className="w-fit h-[600px]">
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
            <CardDescription className="text-xs">
              Informações relacionadas ao cliente, contrato e parcelas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="border-b w-full">
                Cliente: <span className="font-semibold">{cliente.name}</span>
              </p>
              <p className="border-b w-full">
                Empreendimento:{' '}
                <span className="font-semibold">{contrato.enterpriseName}</span>
              </p>
              <p className="border-b w-full">
                Contrato:{' '}
                <span className="font-semibold">{contrato.contractNumber}</span>
              </p>
              <p className="border-b w-full">
                Unidade: <span className="font-semibold">{contrato.unit}</span>
              </p>
              <p className="border-b w-full">
                Quantidade de Títulos:{' '}
                <span className="font-semibold">
                  {parcelasSelecionadas.length}
                </span>
              </p>
              <p className="border-b w-full">
                Valor Total Anterior:{' '}
                <span className="font-semibold">{`RS ${formatarValor(valor)}`}</span>
              </p>
              <p className="border-b w-full">
                Valor Total Presente:{' '}
                <span className="font-semibold">{`RS ${formatarValor(getValorPresenteTotal())}`}</span>
              </p>
              <p className="border-b w-full">
                Valor Desconto:{' '}
                <span className="font-semibold">{`RS ${formatarValor(valor - getValorPresenteTotal())}`}</span>
              </p>
              <p className="border-b w-full">
                Data a Pagar:{' '}
                <span className="font-semibold">
                  {formatarData(dataAPagar)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-grow h-[600px]">
          <CardHeader>
            <CardTitle className="text-lg">Base de Cálculo</CardTitle>
            <CardDescription className="text-xs">
              Informações utilizadas no cálculo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor Original</TableHead>
                  <TableHead>Valor Presente</TableHead>
                  <TableHead>Valor Desconto</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>{`Período (dias)`}</TableHead>
                  <TableHead>{`Taxa (%)`}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculoPorParcela.map((item, index) => (
                  <TableRow
                    className={classNames(index % 2 === 0 && 'bg-neutral-100')}
                    key={index}
                  >
                    <TableCell>
                      R$ {formatarValor(item.valorAnterior)}
                    </TableCell>
                    <TableCell>
                      R$ {formatarValor(item.valorPresente)}
                    </TableCell>
                    <TableCell>
                      R${' '}
                      {formatarValor(item.valorAnterior - item.valorPresente)}
                    </TableCell>
                    <TableCell>{formatarData(item.dataVencimento)}</TableCell>
                    <TableCell>{formatarData(item.dataAPagar)}</TableCell>
                    <TableCell>
                      {calcularDiferencaDias(
                        item.dataAPagar,
                        item.dataVencimento,
                      )}
                    </TableCell>
                    <TableCell>{item.taxa}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <button
        onClick={() => exportJsonToExcel(calculoPorParcela)}
        className="w-48 bg-neutral-800 text-white rounded flex gap-2 items-center justify-center font-bold py-1 px-3 self-end disabled:bg-gray-300"
      >
        Download CSV
        <PiDownload className="text-" />
      </button>
      <button
        onClick={() => window.location.reload()}
        className="w-48 bg-neutral-800 text-white rounded font-bold py-1 px-3 self-end disabled:bg-gray-300"
      >
        Fazer nova simulação
      </button>
    </section>
  )
}
