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

type VisualizaoCalculo = {
  valor: number
  dataAPagar: string
  parcelasSelecionadas: ParcelaSelecionada[]
  cliente: Cliente
  contrato: Contrato
}

type CalculoPorParcela = {
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
  cliente,
  contrato,
}: VisualizaoCalculo) {
  const [calculoPorParcela, setCalculoPorParcela] = useState<
    CalculoPorParcela[]
  >([])
  const getvalorPresentePorParcela = () => {
    const taxaAdm = buscaTaxaPorContrato(contrato.contractNumber)?.taxaAdm
    const taxaTotal = buscaTaxaPorContrato(contrato.contractNumber)?.taxaTotal
    let taxaAnual: number

    const primeiroBalanceDue = parcelasSelecionadas[0]?.balanceDue || 0 // Balance due do primeiro item ou 0 se vazio

    const calculoParcelas = parcelasSelecionadas.map((item) => {
      const tipoDeParcela = item.conditionTypeId
      const diferencaDias = calcularDiferencaDias(dataAPagar, item.dueDate)

      if (taxaTotal && taxaAdm) {
        taxaAnual = taxaTotal - taxaAdm
      }

      let valorPorParcela

      switch (tipoDeParcela) {
        case 'FP': // Tipo de parcela FP
          if (taxaAnual) {
            const taxaDeJurosMensal = calcularTJM(taxaAnual)
            const mesesDeDiferenca = diferencaDias / 30

            valorPorParcela = calcularVPA(
              taxaDeJurosMensal,
              mesesDeDiferenca,
              item.balanceDue,
            )
            break
          }

          break

        case 'PP': // Tipo de parcela PP
          valorPorParcela = item.balanceDue * 1 // Exemplo de cálculo para PP
          break

        default: // Parcelas de Loteamento
          valorPorParcela = primeiroBalanceDue // Define o valor como o balanceDue do primeiro item
          break
      }

      console.log(calcularDiferencaDias(dataAPagar, item.dueDate))

      return {
        valorAnterior: item.balanceDue,
        valorPresente: valorPorParcela,
        dataAPagar,
        dataVencimento: item.dueDate,
        taxa: taxaAnual,
      }
    })

    setCalculoPorParcela(calculoParcelas)
  }

  const getvalorPresenteTotal = () => {
    return calculoPorParcela.reduce(
      (soma, parcela) => soma + parcela.valorPresente,
      0,
    )
  }

  useEffect(() => {
    getvalorPresentePorParcela()
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
                Valor Anterior:{' '}
                <span className="font-semibold">{`RS ${formatarValor(valor)}`}</span>
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
      <Card className="w-full flex items-center justify-center text-lg">
        <CardHeader>
          <CardTitle>
            Valor Presente: R$ {formatarValor(getvalorPresenteTotal())}
          </CardTitle>
        </CardHeader>
      </Card>
    </section>
  )
}
