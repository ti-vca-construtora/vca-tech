"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Plus, Trash2, Undo2 } from "lucide-react";

interface Participante {
  pactuacao: number;
  dataNascimento: string;
}

interface Resultados {
  tipoFinanciamento: string;
  valorImovel: string;
  subsidio: string;
  valorFinanciado: string;
  prestacao: string;
  prazo: string;
}

interface DadosSimulacao {
  nomeCliente: string;
  valorImovel: string;
  nomeEmpreendimento: string;
  unidade: string;
  origemRecurso: string;
  cidade: string;
  valorAvaliacao: string;
  rendaFamiliar: string;
  quantidadeParticipantes: number;
  participantes: Participante[];
  possuiTresAnosFGTS: boolean;
  jaBeneficiadoSubsidio: boolean;
  sistemaAmortizacao: string;
  possuiDependentes: boolean;
}

interface Serie {
  id: string;
  nome: string;
  tipo: 'unica' | 'multipla'; // unica = só pode usar uma vez, multipla = pode usar várias vezes
  valor: number;
  valorFormatado: string;
}

interface LinhaPlano {
  id: string;
  serieId: string;
  serie: string;
  parcelas: number;
  valor: string;
  valorOriginal: number;
  valorEditavel: boolean; // true para séries que devem permanecer editáveis (Sinal, Intermediária)
  data: string;
}

export default function MontagemPlanoPage() {
  const router = useRouter();
  const [dadosSimulacao, setDadosSimulacao] = useState<DadosSimulacao | null>(null);
  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [linhasPlano, setLinhasPlano] = useState<LinhaPlano[]>([
    { id: "1", serieId: "", serie: "", parcelas: 1, valor: "", valorOriginal: 0, valorEditavel: false, data: "" },
    { id: "2", serieId: "", serie: "", parcelas: 1, valor: "", valorOriginal: 0, valorEditavel: false, data: "" },
    { id: "3", serieId: "", serie: "", parcelas: 1, valor: "", valorOriginal: 0, valorEditavel: false, data: "" },
    { id: "4", serieId: "", serie: "", parcelas: 1, valor: "", valorOriginal: 0, valorEditavel: false, data: "" },
    { id: "5", serieId: "", serie: "", parcelas: 1, valor: "", valorOriginal: 0, valorEditavel: false, data: "" },
  ]);
  const [seriesUsadas, setSeriesUsadas] = useState<Set<string>>(new Set());
  const [contadoresSeries, setContadoresSeries] = useState<{ [key: string]: number }>({
    sinal: 0,
    intermediaria: 0,
  });
  const [prazoEntrega, setPrazoEntrega] = useState("");
  const [editandoValorId, setEditandoValorId] = useState<string | null>(null);

  useEffect(() => {
    const dadosStr = sessionStorage.getItem("dadosSimulacao");
    const resultadosStr = sessionStorage.getItem("resultadosSimulacao");

    if (!dadosStr || !resultadosStr) {
      router.push("/dashboard/simulador-financiamento-caixa");
      return;
    }

    setDadosSimulacao(JSON.parse(dadosStr));
    setResultados(JSON.parse(resultadosStr));
  }, [router]);

  const calcularEntrada = () => {
    if (!dadosSimulacao || !resultados) return "R$ 0,00";
    
    const valorImovelNum = parseFloat(
      dadosSimulacao.valorImovel.replace(/\D/g, "")
    ) / 100;
    const valorFinanciadoNum = parseFloat(
      resultados.valorFinanciado.replace(/\D/g, "")
    ) / 100;
    const subsidioNum = parseFloat(
      resultados.subsidio.replace(/[R$\s.]/g, "").replace(",", ".")
    );
  }

    let entrada = valorImovelNum - valorFinanciadoNum - subsidioNum;

    // Abater valores de Sinal e Intermediária da Entrada
    linhasPlano.forEach(linha => {
      if ((linha.serieId === 'sinal' || linha.serieId === 'intermediaria') && linha.valorOriginal > 0) {
        entrada -= linha.valorOriginal;
      }
    });

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(entrada);
  };

  const calcularProsoluto = () => {
    if (!dadosSimulacao) return "R$ 0,00";
    
    const valorImovelNum = parseFloat(
      dadosSimulacao.valorImovel.replace(/\D/g, "")
    ) / 100;
    const prosoluto = valorImovelNum * 0.1;
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(prosoluto);
  };

  const series: Serie[] = [
    {
      id: "entrada",
      nome: "Entrada",
      tipo: 'unica',
      valor: parseFloat(calcularEntrada().replace(/[R$\s.]/g, "").replace(",", ".")),
      valorFormatado: calcularEntrada(),
    },
    {
      id: "sinal",
      nome: "Sinal",
      tipo: 'multipla',
      valor: 0,
      valorFormatado: "R$ 0,00",
    },
    {
      id: "intermediaria",
      nome: "Intermediária",
      tipo: 'multipla',
      valor: 0,
      valorFormatado: "R$ 0,00",
    },
  ];

  // Filtrar séries disponíveis (únicas já usadas são removidas)
  const seriesDisponiveis = series.filter(serie => {
    if (serie.tipo === 'multipla') return true;
    return !seriesUsadas.has(serie.id);
  });

  const adicionarLinha = () => {
    const novaLinha: LinhaPlano = {
      id: String(Date.now()),
      serieId: "",
      serie: "",
      parcelas: 1,
      valor: "",
      valorOriginal: 0,
      valorEditavel: false,
      data: "",
    };
    setLinhasPlano([...linhasPlano, novaLinha]);
  };

  const removerLinha = (id: string) => {
    const linha = linhasPlano.find(l => l.id === id);
    
    // Verifica se é uma das 5 primeiras linhas (IDs 1-5)
    const linhasIniciais = ["1", "2", "3", "4", "5"];
    if (linhasIniciais.includes(id)) {
      // Se for linha inicial, apenas limpa
      removerSerie(id);
      return;
    }
    
    // Se a linha tem uma série única, libera ela novamente
    if (linha && linha.serieId) {
      const serie = series.find(s => s.id === linha.serieId);
      if (serie && serie.tipo === 'unica') {
        const novasSeriesUsadas = new Set(seriesUsadas);
        novasSeriesUsadas.delete(linha.serieId);
        setSeriesUsadas(novasSeriesUsadas);
      }
    }
    
    // Remove a linha
    setLinhasPlano(linhasPlano.filter(linha => linha.id !== id));
  };

  const removerSerie = (id: string) => {
    const linha = linhasPlano.find(l => l.id === id);
    
    if (!linha || !linha.serieId) return;
    
    const serie = series.find(s => s.id === linha.serieId);
    
    // Se a linha tem uma série única, libera ela novamente
    if (serie && serie.tipo === 'unica') {
      const novasSeriesUsadas = new Set(seriesUsadas);
      novasSeriesUsadas.delete(linha.serieId);
      setSeriesUsadas(novasSeriesUsadas);
    }
    
    // Limpa a série da linha
    let novasLinhas = linhasPlano.map(l => {
      if (l.id === id) {
        return {
          ...l,
          serieId: "",
          serie: "",
          valor: "",
          valorOriginal: 0,
          valorEditavel: false,
          parcelas: 1,
          data: "",
        };
      }
      return l;
    });
    
    // Se for série múltipla, renumera as outras do mesmo tipo
    if (serie && serie.tipo === 'multipla') {
      // Encontra todas as linhas com a mesma série base
      const linhasMesmoTipo = novasLinhas.filter(l => l.serieId === linha.serieId);
      
      // Renumera sequencialmente
      linhasMesmoTipo.forEach((l, index) => {
        const contador = index + 1;
        novasLinhas = novasLinhas.map(nl => {
          if (nl.id === l.id) {
            return {
              ...nl,
              serie: contador === 1 ? serie.nome : `${serie.nome} ${contador}`,
            };
          }
          return nl;
        });
      });
      
      // Atualiza o contador da série
      setContadoresSeries({
        ...contadoresSeries,
        [linha.serieId]: linhasMesmoTipo.length,
      });
    }
    
    setLinhasPlano(novasLinhas);
  };

  const atualizarParcelas = (id: string, parcelas: number) => {
    const novasLinhas = linhasPlano.map(linha => {
      if (linha.id === id) {
        if (linha.valorOriginal > 0) {
          const valorPorParcela = linha.valorOriginal / parcelas;
          return {
            ...linha,
            parcelas,
            valor: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valorPorParcela),
          };
        }
        return { ...linha, parcelas };
      }
      return linha;
    });
    setLinhasPlano(novasLinhas);
  };

  const atualizarData = (id: string, data: string) => {
    const linha = linhasPlano.find(l => l.id === id);
    if (!linha) return;

    // Validação de data para Sinal e Intermediária
    if (data.length === 10) {
      const [dia, mes, ano] = data.split('/').map(Number);
      if (!dia || !mes || !ano) return;

      const dataInformada = new Date(ano, mes - 1, dia);

      // Validar Sinal: data deve ser ANTES da data da Entrada
      if (linha.serieId === 'sinal') {
        const linhaEntrada = linhasPlano.find(l => l.serieId === 'entrada' && l.data);
        if (linhaEntrada && linhaEntrada.data.length === 10) {
          const [diaE, mesE, anoE] = linhaEntrada.data.split('/').map(Number);
          const dataEntrada = new Date(anoE, mesE - 1, diaE);
          
          if (dataInformada >= dataEntrada) {
            alert('A data do Sinal deve ser ANTES da data da Entrada.');
            return;
          }
        }
      }

      // Validar Intermediária: data não pode exceder prazo de entrega
      if (linha.serieId === 'intermediaria') {
        if (prazoEntrega && prazoEntrega.length === 10) {
          const [diaP, mesP, anoP] = prazoEntrega.split('/').map(Number);
          const dataPrazo = new Date(anoP, mesP - 1, diaP);
          
          if (dataInformada > dataPrazo) {
            alert('A data da Intermediária não pode exceder o prazo de entrega.');
            return;
          }
        }
      }
    }

    const novasLinhas = linhasPlano.map(linha => {
      if (linha.id === id) {
        return { ...linha, data };
      }
      return linha;
    });
    setLinhasPlano(novasLinhas);
  };

  const atualizarValor = (id: string, valorStr: string) => {
    // Remove tudo exceto números
    const valorNum = parseFloat(valorStr.replace(/\D/g, '')) / 100;
    
    if (isNaN(valorNum) || valorNum <= 0) {
      return;
    }

    const novasLinhas = linhasPlano.map(linha => {
      if (linha.id === id) {
        const valorPorParcela = valorNum / linha.parcelas;
        return {
          ...linha,
          valorOriginal: valorNum,
          valor: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(valorPorParcela),
        };
      }
      return linha;
    });
    setLinhasPlano(novasLinhas);
  };

  const calcularTotal = () => {
    let total = 0;
    linhasPlano.forEach(linha => {
      if (linha.valorOriginal > 0) {
        total += linha.valorOriginal;
      }
    });
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
  };

  const calcularValidacaoProsoluto = () => {
    if (!dadosSimulacao) {
      return { 
        valido: true, 
        excedente: 0, 
        valorDevedor: 0,
        avisos: [] as string[]
      };
    }

    // Calcular prosoluto (10% do valor do imóvel)
    const valorImovelNum = parseFloat(dadosSimulacao.valorImovel.replace(/\D/g, '')) / 100;
    const prosoluto = valorImovelNum * 0.1;

    const avisos: string[] = [];

    // Encontrar linha da Entrada
    const linhaEntrada = linhasPlano.find(l => l.serieId === 'entrada' && l.serie && l.valorOriginal > 0);
    
    if (!linhaEntrada || !linhaEntrada.data) {
      // Se não tem entrada definida ou data, não podemos validar
      return {
        valido: true,
        excedente: 0,
        valorDevedor: 0,
        avisos
      };
    }

    // Parse data de início da entrada (DD/MM/AAAA)
    const [diaEntrada, mesEntrada, anoEntrada] = linhaEntrada.data.split('/').map(Number);
    if (!diaEntrada || !mesEntrada || !anoEntrada) {
      return {
        valido: true,
        excedente: 0,
        valorDevedor: 0,
        avisos
      };
    }

    // Validar e ajustar prazo de entrega
    let prazoEntregaMeses = 36; // Padrão: 36 meses
    let dataEntrega: Date;
    
    if (prazoEntrega) {
      const [diaEntregaInput, mesEntregaInput, anoEntregaInput] = prazoEntrega.split('/').map(Number);
      if (diaEntregaInput && mesEntregaInput && anoEntregaInput) {
        dataEntrega = new Date(anoEntregaInput, mesEntregaInput - 1, diaEntregaInput);
        const dataInicioEntrada = new Date(anoEntrada, mesEntrada - 1, diaEntrada);
        
        // Calcular meses entre início da entrada e entrega
        prazoEntregaMeses = (dataEntrega.getFullYear() - dataInicioEntrada.getFullYear()) * 12 + 
                           (dataEntrega.getMonth() - dataInicioEntrada.getMonth());
        
        if (prazoEntregaMeses > 36) {
          prazoEntregaMeses = 36;
          avisos.push('Prazo de entrega foi ajustado para o máximo de 36 meses a partir da data de início da entrada.');
        }
        
        if (prazoEntregaMeses < 0) {
          prazoEntregaMeses = 0;
          avisos.push('Data de entrega é anterior ao início dos pagamentos.');
        }
      } else {
        avisos.push('Prazo de entrega não definido. Usando padrão de 36 meses.');
      }
    } else {
      avisos.push('Prazo de entrega não definido. Usando padrão de 36 meses.');
    }

    let statusProsoluto = false;
    let valorDevedor = 0;

    const parcelamento = linhaEntrada.parcelas;
    const parc_entrada = linhaEntrada.valorOriginal / parcelamento;

    // Lógica de validação conforme especificação
    // prazoEntregaMeses = quantos meses terão passado desde o início da entrada até a entrega
    // parcelamento = total de parcelas da entrada
    
    if ((parcelamento - prazoEntregaMeses) <= 0) {
      // Cliente vai ter pago toda a entrada ou mais
      statusProsoluto = true;
      valorDevedor = 0;
    } else {
      // Calcular quanto ainda vai dever
      // parcelas restantes = total de parcelas - parcelas que já terão sido pagas
      const parcelasRestantes = parcelamento - prazoEntregaMeses;
      valorDevedor = parc_entrada * parcelasRestantes;
      
      if (valorDevedor <= prosoluto) {
        statusProsoluto = true;
      } else {
        statusProsoluto = false;
        console.log("Valor excedente:", valorDevedor - prosoluto);
      }
    }

    const excedente = statusProsoluto ? 0 : (valorDevedor - prosoluto);

    return {
      valido: statusProsoluto,
      excedente: excedente > 0 ? excedente : 0,
      valorDevedor,
      avisos
    };
  };

  const validacaoProsoluto = calcularValidacaoProsoluto();
  
  // Verificar se há alguma série adicionada
  const temSeriesAdicionadas = linhasPlano.some(l => l.serie && l.serieId);

  const handleDownloadPDF = () => {
    // TODO: Implementar exportação de PDF da tabela
    console.log("Exportar PDF do plano de pagamento");
  };

  if (!dadosSimulacao || !resultados) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Montagem de Plano</h1>
            <p className="text-sm text-muted-foreground">
              {dadosSimulacao.nomeCliente} - {dadosSimulacao.unidade}
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2 h-9 text-sm">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Barra lateral esquerda com séries */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Séries Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {seriesDisponiveis.map((serie) => (
              <div
                key={serie.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("application/json", JSON.stringify(serie));
                }}
                className="p-2 bg-primary/10 border-2 border-primary rounded-lg cursor-move hover:bg-primary/20 transition-colors"
              >
                <p className="font-semibold text-[10px]">{serie.nome}</p>
                <p className="text-sm font-bold text-primary">
                  {serie.valorFormatado}
                </p>
                {serie.tipo === 'multipla' && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Pode adicionar múltiplas vezes
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tabela de plano */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Plano de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Tabela com scroll */}
              <div className="border rounded-lg overflow-x-auto overflow-y-auto max-h-[500px]">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-muted sticky top-0 z-10">
                      <tr className="border-b">
                        <th className="text-left p-1.5 font-semibold text-[10px]">SÉRIE</th>
                        <th className="text-left p-1.5 font-semibold text-[10px]">PARCELAS</th>
                        <th className="text-left p-1.5 font-semibold text-[10px]">VALOR</th>
                        <th className="text-left p-1.5 font-semibold text-[10px]">DATA</th>
                        <th className="text-right p-1.5 font-semibold text-[10px]">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Linhas da tabela */}
                      {linhasPlano.map((linha) => (
                        <tr
                          key={linha.id}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const serieData = e.dataTransfer.getData("application/json");
                            const serie = JSON.parse(serieData) as Serie;
                    
                    if (serie && !linha.serie) {
                      // Para séries múltiplas, adicionar contador ao nome
                      let nomeSerie = serie.nome;
                      if (serie.tipo === 'multipla') {
                        const contador = contadoresSeries[serie.id] + 1;
                        setContadoresSeries({
                          ...contadoresSeries,
                          [serie.id]: contador,
                        });
                        if (contador > 1) {
                          nomeSerie = `${serie.nome} ${contador}`;
                        }
                      }
                      
                      const novasLinhas = linhasPlano.map(l => {
                        if (l.id === linha.id) {
                          return {
                            ...l,
                            serieId: serie.id,
                            serie: nomeSerie,
                            valor: serie.valorFormatado,
                            valorOriginal: serie.valor,
                            valorEditavel: serie.valor === 0, // Editável se valor inicial for 0
                          };
                        }
                        return l;
                      });
                      setLinhasPlano(novasLinhas);
                      
                      // Se for série única, marca como usada
                      if (serie.tipo === 'unica') {
                        const novasSeriesUsadas = new Set(seriesUsadas);
                        novasSeriesUsadas.add(serie.id);
                        setSeriesUsadas(novasSeriesUsadas);
                      }
                    }
                  }}
                  className={`border-b transition-colors ${
                    linha.serie ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                >
                  <td className="p-1.5">
                    {linha.serie || <span className="text-muted-foreground text-[10px] italic">Arraste uma série aqui</span>}
                  </td>
                  <td className="p-1.5">
                    <Input
                      type="number"
                      min="1"
                      value={linha.parcelas}
                      onChange={(e) => atualizarParcelas(linha.id, parseInt(e.target.value) || 1)}
                      disabled={!linha.serie}
                      className="w-16 h-7 text-[10px]"
                    />
                  </td>
                  <td className="p-1.5 font-semibold text-[10px]">
                    {linha.valorEditavel ? (
                      editandoValorId === linha.id ? (
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          value={linha.valor}
                          onChange={(e) => atualizarValor(linha.id, e.target.value)}
                          onBlur={() => setEditandoValorId(null)}
                          autoFocus
                          disabled={!linha.serie}
                          className="w-20 h-6 text-[10px] font-semibold"
                        />
                      ) : (
                        <span
                          onClick={() => linha.serie && setEditandoValorId(linha.id)}
                          className={`cursor-pointer hover:bg-muted px-2 py-1 rounded ${linha.serie ? '' : 'opacity-50'}`}
                        >
                          {linha.valor || "R$ 0,00"}
                        </span>
                      )
                    ) : (
                      linha.valor
                    )}
                  </td>
                  <td className="p-1.5">
                    <Input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      value={linha.data}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5, 9);
                        }
                        atualizarData(linha.id, value);
                      }}
                      disabled={!linha.serie}
                      className="w-full h-7 text-[10px]"
                    />
                  </td>
                  <td className="p-1.5 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {linha.serie && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerSerie(linha.id)}
                          title="Remover série"
                          className="h-6 w-6 p-0"
                        >
                          <Undo2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerLinha(linha.id)}
                        disabled={["1", "2", "3", "4", "5"].includes(linha.id) && !linha.serie}
                        title={["1", "2", "3", "4", "5"].includes(linha.id) ? "Limpar série" : "Excluir linha"}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex items-center gap-2 text-xs pt-1.5">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-primary">{calcularTotal()}</span>
        </div>

        <Button
          variant="outline"
          onClick={adicionarLinha}
          className="w-full gap-2 h-8 text-xs"
        >
          <Plus className="h-3 w-3" />
          Adicionar Linha
        </Button>
      </div>
    </CardContent>
  </Card>
</div>

      {/* Informações e Prazo de Entrega - Layout Horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
        {/* Informações - 70% */}
        <div className="lg:col-span-7">
          {/* Avisos */}
          {validacaoProsoluto.avisos && validacaoProsoluto.avisos.length > 0 && (
            <Card className="h-fit border-yellow-300 bg-yellow-50 dark:bg-yellow-950 mb-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">⚠️ Avisos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {validacaoProsoluto.avisos.map((aviso, index) => (
                  <p key={index} className="text-[10px] text-yellow-700 dark:text-yellow-300">
                    • {aviso}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
          
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <div className={`p-2 rounded-lg ${!temSeriesAdicionadas ? 'bg-muted' : (validacaoProsoluto.valido ? 'bg-green-50 dark:bg-green-950 border-2 border-green-500' : 'bg-red-50 dark:bg-red-950 border-2 border-red-500')}`}>
                <p className="text-xs text-muted-foreground mb-0.5">Prosoluto (10%)</p>
                <p className={`text-sm font-bold ${!temSeriesAdicionadas ? '' : (validacaoProsoluto.valido ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}`}>
                  {calcularProsoluto()}
                </p>
                {temSeriesAdicionadas && validacaoProsoluto.valido ? (
                  <div className="mt-1.5 pt-1.5 border-t border-green-300">
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                      ✅ Plano aprovado!
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">
                      Valor devedor na entrega: {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(validacaoProsoluto.valorDevedor)}
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5 font-medium">
                      Cliente pode seguir com este plano de pagamento.
                    </p>
                  </div>
                ) : temSeriesAdicionadas ? (
                  <div className="mt-1.5 pt-1.5 border-t border-red-300">
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                      ⚠️ Atenção!
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                      Valor devedor na entrega: {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(validacaoProsoluto.valorDevedor)}
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                      Excedente: {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(validacaoProsoluto.excedente)}
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 font-medium">
                      Cliente não pode seguir com este plano de pagamento.
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Valor Financiado</p>
                <p className="text-sm font-bold">{resultados?.valorFinanciado || "R$ 0,00"}</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-xs text-muted-foreground mb-0.5">Subsídio</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {resultados?.subsidio || "R$ 0,00"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prazo de Entrega - 30% */}
        <div className="lg:col-span-3">
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Prazo de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-1.5">
              <label htmlFor="prazo-entrega" className="text-[10px] text-muted-foreground">
                Data prevista de entrega
              </label>
              <Input
                id="prazo-entrega"
                type="text"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                value={prazoEntrega}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                  }
                  if (value.length >= 5) {
                    value = value.slice(0, 5) + '/' + value.slice(5, 9);
                  }
                  setPrazoEntrega(value);
                }}
                className="w-full h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Ex: 15/04/2028
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
