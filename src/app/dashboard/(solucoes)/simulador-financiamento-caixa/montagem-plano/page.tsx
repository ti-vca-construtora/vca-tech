"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Plus, Trash2, Undo2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  tipo: 'unica' | 'multipla';
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
  valorEditavel: boolean;
  data: string;
}

export default function MontagemPlanoPage() {
  const router = useRouter();
  const { user } = useUser();
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
  const [contadoresSeries, setContadoresSeries] = useState<{ [key: string]: number }>({});
  const [prazoEntrega, setPrazoEntrega] = useState("");
  const [editandoValorId, setEditandoValorId] = useState<string | null>(null);
  const [modalAvisosAberto, setModalAvisosAberto] = useState(false);
  const [avisosLidos, setAvisosLidos] = useState(false);
  const [editingEntradaDate, setEditingEntradaDate] = useState(false);

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

  // Abrir modal automaticamente quando houver avisos
  const calcularValidacaoProsoluto = useCallback(() => {
    if (!dadosSimulacao) {
      return { 
        valido: true, 
        excedente: 0, 
        valorDevedor: 0,
        avisos: [] as string[]
      };
    }

    const valorImovelNum = parseFloat(dadosSimulacao.valorImovel.replace(/\D/g, '')) / 100;
    const prosoluto = valorImovelNum * 0.1;

    const avisos: string[] = [];

    const linhaEntrada = linhasPlano.find(l => l.serieId === 'entrada' && l.serie && l.valorOriginal > 0);
    
    if (!linhaEntrada || !linhaEntrada.data) {
      return {
        valido: true,
        excedente: 0,
        valorDevedor: 0,
        avisos
      };
    }

    const [diaEntrada, mesEntrada, anoEntrada] = linhaEntrada.data.split('/').map(Number);
    if (!diaEntrada || !mesEntrada || !anoEntrada) {
      return {
        valido: true,
        excedente: 0,
        valorDevedor: 0,
        avisos
      };
    }

    const dataInicioEntrada = new Date(anoEntrada, mesEntrada - 1, diaEntrada);
    let dataEntregaFinal: Date;
    let prazoEntregaMeses: number;
    
    if (!prazoEntrega || prazoEntrega.length === 0) {
      // Se prazo de entrega não foi informado, usar 36 meses a partir de HOJE
      avisos.push('Prazo de entrega não definido. Usando padrão de 36 meses a partir de hoje.');
      dataEntregaFinal = new Date();
      dataEntregaFinal.setMonth(dataEntregaFinal.getMonth() + 36);
      
      // Calcular meses entre início da entrada e a data de entrega padrão
      prazoEntregaMeses = (dataEntregaFinal.getFullYear() - dataInicioEntrada.getFullYear()) * 12 + 
                         (dataEntregaFinal.getMonth() - dataInicioEntrada.getMonth());
    } else if (prazoEntrega.length === 10) {
      const [diaEntregaInput, mesEntregaInput, anoEntregaInput] = prazoEntrega.split('/').map(Number);
      if (diaEntregaInput && mesEntregaInput && anoEntregaInput) {
        dataEntregaFinal = new Date(anoEntregaInput, mesEntregaInput - 1, diaEntregaInput);
        
        // Calcular meses entre início da entrada e data de entrega informada
        prazoEntregaMeses = (dataEntregaFinal.getFullYear() - dataInicioEntrada.getFullYear()) * 12 + 
                           (dataEntregaFinal.getMonth() - dataInicioEntrada.getMonth());
        
        if (prazoEntregaMeses > 36) {
          prazoEntregaMeses = 36;
          avisos.push('Prazo de entrega excede 36 meses a partir da data de início da entrada. Usando limite de 36 meses.');
        }
        
        if (prazoEntregaMeses < 0) {
          prazoEntregaMeses = 0;
          avisos.push('Data de entrega é anterior ao início da entrada.');
        }
      } else {
        // Data inválida - usar 36 meses a partir de hoje
        avisos.push('Prazo de entrega inválido. Usando padrão de 36 meses a partir de hoje.');
        dataEntregaFinal = new Date();
        dataEntregaFinal.setMonth(dataEntregaFinal.getMonth() + 36);
        prazoEntregaMeses = (dataEntregaFinal.getFullYear() - dataInicioEntrada.getFullYear()) * 12 + 
                           (dataEntregaFinal.getMonth() - dataInicioEntrada.getMonth());
      }
    } else {
      // Prazo de entrega incompleto - não calcular ainda
      return {
        valido: true,
        excedente: 0,
        valorDevedor: 0,
        avisos
      };
    }

    let statusProsoluto = false;
    let valorDevedor = 0;

    const parcelamento = linhaEntrada.parcelas;
    const parcEntrada = linhaEntrada.valorOriginal / parcelamento;
    
    if ((parcelamento - prazoEntregaMeses) <= 0) {
      statusProsoluto = true;
      valorDevedor = 0;
    } else {
      const parcelasRestantes = parcelamento - prazoEntregaMeses;
      valorDevedor = parcEntrada * parcelasRestantes;
      
      if (valorDevedor <= prosoluto) {
        statusProsoluto = true;
      } else {
        statusProsoluto = false;
      }
    }

    const excedente = statusProsoluto ? 0 : (valorDevedor - prosoluto);

    return {
      valido: statusProsoluto,
      excedente: excedente > 0 ? excedente : 0,
      valorDevedor,
      avisos
    };
  }, [dadosSimulacao, linhasPlano, prazoEntrega]);

  useEffect(() => {
    const validacao = calcularValidacaoProsoluto();
    if (!editingEntradaDate && validacao.avisos && validacao.avisos.length > 0 && !avisosLidos) {
      setModalAvisosAberto(true);
    }
  }, [prazoEntrega, linhasPlano, avisosLidos, editingEntradaDate, calcularValidacaoProsoluto]);

  // Atualizar valor da Entrada quando Sinal ou Intermediária mudam
  const sinaisChangedKey = linhasPlano.filter(l => l.serieId === 'sinal' || l.serieId === 'intermediaria').map(l => l.valorOriginal).join(',');

  const calcularEntrada = useCallback(() => {
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

    let entrada = valorImovelNum - valorFinanciadoNum - subsidioNum;

    linhasPlano.forEach(linha => {
      if ((linha.serieId === 'sinal' || linha.serieId === 'intermediaria') && linha.valorOriginal > 0) {
        entrada -= linha.valorOriginal;
      }
    });

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(entrada);
  }, [dadosSimulacao, resultados, linhasPlano]);

  useEffect(() => {
    const linhaEntrada = linhasPlano.find(l => l.serieId === 'entrada');
    if (!linhaEntrada) return;

    const valorEntradaAtual = calcularEntrada();
    const valorEntradaNum = parseFloat(valorEntradaAtual.replace(/[R$\s.]/g, "").replace(",", "."));
    
    // Se o valor da entrada mudou, atualiza a linha
    if (Math.abs(linhaEntrada.valorOriginal - valorEntradaNum) > 0.01) {
      const novasLinhas = linhasPlano.map(linha => {
        if (linha.serieId === 'entrada') {
          const valorPorParcela = valorEntradaNum / linha.parcelas;
          return {
            ...linha,
            valor: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valorPorParcela),
            valorOriginal: valorEntradaNum,
          };
        }
        return linha;
      });
      setLinhasPlano(novasLinhas);
    }
  }, [sinaisChangedKey, calcularEntrada, linhasPlano]);

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

  const valorEntradaCalculado = calcularEntrada();
  const series: Serie[] = [
    {
      id: "entrada",
      nome: "Entrada",
      tipo: 'unica',
      valor: parseFloat(valorEntradaCalculado.replace(/[R$\s.]/g, "").replace(",", ".")),
      valorFormatado: valorEntradaCalculado,
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
    
    const linhasIniciais = ["1", "2", "3", "4", "5"];
    if (linhasIniciais.includes(id)) {
      removerSerie(id);
      return;
    }
    
    if (linha && linha.serieId) {
      const serie = series.find(s => s.id === linha.serieId);
      if (serie && serie.tipo === 'unica') {
        const novasSeriesUsadas = new Set(seriesUsadas);
        novasSeriesUsadas.delete(linha.serieId);
        setSeriesUsadas(novasSeriesUsadas);
      }
    }
    
    setLinhasPlano(linhasPlano.filter(linha => linha.id !== id));
  };

  const removerSerie = (id: string) => {
    const linha = linhasPlano.find(l => l.id === id);
    
    if (!linha || !linha.serieId) return;
    
    const serie = series.find(s => s.id === linha.serieId);
    
    if (serie && serie.tipo === 'unica') {
      const novasSeriesUsadas = new Set(seriesUsadas);
      novasSeriesUsadas.delete(linha.serieId);
      setSeriesUsadas(novasSeriesUsadas);
    }
    
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
    
    if (serie && serie.tipo === 'multipla') {
      const linhasMesmoTipo = novasLinhas.filter(l => l.serieId === linha.serieId);
      
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
      
      setContadoresSeries({
        ...contadoresSeries,
        [linha.serieId]: linhasMesmoTipo.length,
      });
    }
    
    setLinhasPlano(novasLinhas);
  };

  const atualizarParcelas = (id: string, parcelas: number) => {
    const linha = linhasPlano.find(l => l.id === id);
    
    // Limitar entrada a 60 parcelas
    if (linha && linha.serieId === 'entrada' && parcelas > 60) {
      alert('O número máximo de parcelas para a Entrada é 60.');
      return;
    }
    
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

    if (data.length === 10) {
      const [dia, mes, ano] = data.split('/').map(Number);
      if (!dia || !mes || !ano) return;

      const dataInformada = new Date(ano, mes - 1, dia);

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
    
    // Soma todas as séries do plano
    linhasPlano.forEach(linha => {
      if (linha.valorOriginal > 0) {
        total += linha.valorOriginal;
      }
    });
    
    // Adiciona Valor Financiado
    if (resultados?.valorFinanciado) {
      const valorFinanciadoNum = parseFloat(
        resultados.valorFinanciado.replace(/[R$\s.]/g, "").replace(",", ".")
      );
      total += valorFinanciadoNum;
    }
    
    // Adiciona Subsídio
    if (resultados?.subsidio) {
      const subsidioNum = parseFloat(
        resultados.subsidio.replace(/[R$\s.]/g, "").replace(",", ".")
      );
      total += subsidioNum;
    }
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
  };

  // Função para ordenar linhas do plano
  const ordenarLinhasPlano = (linhas: LinhaPlano[]) => {
    const ordemPrioridade: { [key: string]: number } = {
      'sinal': 1,
      'entrada': 2,
      'intermediaria': 3,
    };

    return [...linhas].sort((a, b) => {
      // Linhas sem série vão para o final
      if (!a.serie && !b.serie) return 0;
      if (!a.serie) return 1;
      if (!b.serie) return -1;

      // Ordena por tipo de série
      const prioridadeA = ordemPrioridade[a.serieId] || 999;
      const prioridadeB = ordemPrioridade[b.serieId] || 999;

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      // Dentro do mesmo tipo, ordena por nome (Sinal 1, Sinal 2, etc.)
      return a.serie.localeCompare(b.serie);
    });
  };


  const calcularTotalSinais = () => {
    let total = 0;
    linhasPlano.forEach(linha => {
      if (linha.serieId === 'sinal' && linha.valorOriginal > 0) {
        total += linha.valorOriginal;
      }
    });
    return total;
  };

  const validarSinais = () => {
    if (!dadosSimulacao || !resultados) {
      return { valido: true, mensagem: '' };
    }
    
    const valorImovelNum = parseFloat(
      dadosSimulacao.valorImovel.replace(/\D/g, "")
    ) / 100;
    const valorFinanciadoNum = parseFloat(
      resultados.valorFinanciado.replace(/\D/g, "")
    ) / 100;
    
    // Se entrada é isenta (valor financiado > valor imóvel), não valida sinal
    const entradaIsenta = valorFinanciadoNum > valorImovelNum;
    if (entradaIsenta) {
      return { valido: true, mensagem: '' };
    }
    
    const totalSinais = calcularTotalSinais();
    const temSinal = linhasPlano.some(l => l.serieId === 'sinal' && l.serie);
    
    if (temSinal && totalSinais < 3000) {
      return {
        valido: false,
        mensagem: `O valor total dos sinais (${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalSinais)}) é menor que o mínimo exigido de R$ 3.000,00`
      };
    }
    
    return { valido: true, mensagem: '' };
  };

  const validarDataEntrada = () => {
    const linhaEntrada = linhasPlano.find(l => l.serieId === 'entrada' && l.serie);
    const linhasSinal = linhasPlano.filter(l => l.serieId === 'sinal' && l.serie && l.data);

    // Se não tem entrada ou não tem sinal com data, não valida
    if (!linhaEntrada || linhasSinal.length === 0) {
      return { valido: true, mensagem: '' };
    }

    // Se entrada não tem data ainda, não valida
    if (!linhaEntrada.data || linhaEntrada.data.length !== 10) {
      return { valido: true, mensagem: '' };
    }

    // Encontrar a última data de sinal
    let ultimaDataSinal: Date | null = null;

    linhasSinal.forEach(linha => {
      if (linha.data.length === 10) {
        const [dia, mes, ano] = linha.data.split('/').map(Number);
        const dataSinal = new Date(ano, mes - 1, dia);
        
        // Calcular a última parcela dessa série de sinal
        const ultimaParcelaSinal = new Date(dataSinal);
        ultimaParcelaSinal.setMonth(ultimaParcelaSinal.getMonth() + linha.parcelas - 1);
        
        if (!ultimaDataSinal || ultimaParcelaSinal > ultimaDataSinal) {
          ultimaDataSinal = ultimaParcelaSinal;
        }
      }
    });

    if (!ultimaDataSinal) {
      return { valido: true, mensagem: '' };
    }

    // A entrada deve começar no mês seguinte ao fim do sinal
    const dataMinEntrada = new Date(ultimaDataSinal);
    dataMinEntrada.setMonth(dataMinEntrada.getMonth() + 1);

    const [diaE, mesE, anoE] = linhaEntrada.data.split('/').map(Number);
    const dataEntrada = new Date(anoE, mesE - 1, diaE);

    if (dataEntrada < dataMinEntrada) {
      return {
        valido: false,
        mensagem: `A Entrada deve começar no mês seguinte à conclusão do Sinal. Data mínima: ${dataMinEntrada.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`
      };
    }

    return { valido: true, mensagem: '' };
  };

  const validarPlanoCompleto = () => {
    if (!dadosSimulacao || !resultados) {
      return { valido: false, mensagem: 'Dados da simulação não encontrados' };
    }
    
    const valorImovelNum = parseFloat(
      dadosSimulacao.valorImovel.replace(/\D/g, "")
    ) / 100;
    const valorFinanciadoNum = parseFloat(
      resultados.valorFinanciado.replace(/\D/g, "")
    ) / 100;
    
    // Verificar se é o caso especial: entrada isenta (valor financiado > valor imóvel)
    const entradaIsenta = valorFinanciadoNum > valorImovelNum;
    
    // Verificar se tem SINAL (obrigatório apenas quando entrada NÃO é isenta)
    const temSinal = linhasPlano.some(l => l.serieId === 'sinal' && l.serie);
    if (!entradaIsenta && !temSinal) {
      return {
        valido: false,
        mensagem: 'É obrigatório ter pelo menos uma série SINAL no plano de pagamento'
      };
    }
    
    let totalPlano = 0;
    
    // Soma todas as séries
    linhasPlano.forEach(linha => {
      if (linha.valorOriginal > 0) {
        totalPlano += linha.valorOriginal;
      }
    });
    
    // Adiciona Valor Financiado
    if (resultados?.valorFinanciado) {
      const valorFinanciadoNum = parseFloat(
        resultados.valorFinanciado.replace(/[R$\s.]/g, "").replace(",", ".")
      );
      totalPlano += valorFinanciadoNum;
    }
    
    // Adiciona Subsídio
    if (resultados?.subsidio) {
      const subsidioNum = parseFloat(
        resultados.subsidio.replace(/[R$\s.]/g, "").replace(",", ".")
      );
      totalPlano += subsidioNum;
    }
    
    const diferenca = Math.abs(totalPlano - valorImovelNum);
    
    // Tolerância de R$ 1,00 para arredondamentos
    if (diferenca > 1) {
      return {
        valido: false,
        mensagem: `O total do plano (${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalPlano)}) deve ser igual ao valor do imóvel (${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valorImovelNum)}). Diferença: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(diferenca)}`
      };
    }
    
    return { valido: true, mensagem: '' };
  };

  const validacaoProsoluto = calcularValidacaoProsoluto();
  const validacaoSinais = validarSinais();
  const validacaoDataEntrada = validarDataEntrada();
  const validacaoPlano = validarPlanoCompleto();
  const temSeriesAdicionadas = linhasPlano.some(l => l.serie && l.serieId);

  const handleDownloadPDF = async () => {
    if (!dadosSimulacao) {
      alert('Dados da simulação não encontrados.');
      return;
    }

    try {
      const response = await fetch('/api/simulador-caixa/plano-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dadosSimulacao, 
          resultados, 
          linhasPlano,
          prazoEntrega,
          nomeUsuario: user?.name || 'Usuário'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plano-pagamento-${dadosSimulacao.nomeCliente.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Erro ao gerar PDF');
        alert('Erro ao gerar PDF. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao baixar PDF. Tente novamente.');
    }
  };

  if (!dadosSimulacao || !resultados) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4 max-w-[1800px] mx-auto">
      {/* Modal de Avisos */}
      <Dialog open={modalAvisosAberto} onOpenChange={setModalAvisosAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Avisos Importantes
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-4">
              {validacaoProsoluto.avisos.map((aviso, index) => (
                <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                  • {aviso}
                </p>
              ))}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setModalAvisosAberto(false);
              setAvisosLidos(true);
            }}
            className="mt-4"
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/simulador-financiamento-caixa/resultados')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Montagem de Plano</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {dadosSimulacao.nomeCliente} - {dadosSimulacao.unidade}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleDownloadPDF} 
          className="gap-2 h-9 text-sm w-full sm:w-auto"
          disabled={!validacaoSinais.valido || !validacaoPlano.valido || !validacaoDataEntrada.valido}
          title={!validacaoSinais.valido ? validacaoSinais.mensagem : (!validacaoPlano.valido ? validacaoPlano.mensagem : (!validacaoDataEntrada.valido ? validacaoDataEntrada.mensagem : ''))}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs em 3 colunas no topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Prazo de Entrega
              {avisosLidos && validacaoProsoluto.avisos && validacaoProsoluto.avisos.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={() => setModalAvisosAberto(true)}
                  title="Ver avisos"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <Input
              type="text"
              placeholder={prazoEntrega ? "" : "DD/MM/AAAA"}
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
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  e.preventDefault();
                  setPrazoEntrega('');
                }
              }}
              onFocus={(e) => { e.target.placeholder = ''; }}
              onBlur={(e) => { e.target.placeholder = prazoEntrega ? '' : 'DD/MM/AAAA'; }}
              className="w-full h-9 text-sm text-center"
            />
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Ex: 15/04/2028
            </p>
          </CardContent>
        </Card>

        <Card className={`${!temSeriesAdicionadas ? 'bg-muted' : (validacaoProsoluto.valido ? 'bg-green-50 dark:bg-green-950 border-2 border-green-500' : 'bg-red-50 dark:bg-red-950 border-2 border-red-500')}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Prosoluto (10%)</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-3">
            <p className={`text-3xl font-bold ${!temSeriesAdicionadas ? '' : (validacaoProsoluto.valido ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}`}>
              {calcularProsoluto()}
            </p>
            {temSeriesAdicionadas && (
              <div className={`mt-3 pt-3 border-t ${validacaoProsoluto.valido ? 'border-green-300' : 'border-red-300'}`}>
                {validacaoProsoluto.valido ? (
                  <>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">
                      ✅ Plano aprovado!
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">
                      Devedor na entrega: {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(validacaoProsoluto.valorDevedor)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                      ⚠️ Plano não aprovado
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">
                      Devedor: {new Intl.NumberFormat("pt-BR", {
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
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Prestação Financiamento</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-3">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {resultados?.prestacao || "R$ 0,00"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Valor mensal do financiamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de validação de sinais */}
      {!validacaoSinais.valido && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Valor mínimo de Sinal não atingido
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {validacaoSinais.mensagem}
          </p>
        </div>
      )}

      {/* Aviso de validação do plano completo */}
      {validacaoSinais.valido && !validacaoPlano.valido && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Plano de pagamento incompleto
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {validacaoPlano.mensagem}
          </p>
        </div>
      )}

      {/* Aviso de validação da data de entrada */}
      {!validacaoDataEntrada.valido && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Data da Entrada inválida
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {validacaoDataEntrada.mensagem}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Séries Disponíveis - 3 colunas (25%) */}
        <div className="xl:col-span-3">
          <Card className="h-full">
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
        </div>

        {/* Plano de Pagamento - 9 colunas (75%) */}
        <div className="xl:col-span-9">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plano de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-2">
              <div className="border rounded-lg overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr className="border-b">
                      <th className="text-left p-1.5 font-semibold text-[10px]">SÉRIE</th>
                      <th className="text-center p-1.5 font-semibold text-[10px]">VALOR</th>
                      <th className="text-left p-1.5 font-semibold text-[10px]">PARCELAS</th>
                      <th className="text-center p-1.5 font-semibold text-[10px]">DATA</th>
                      <th className="text-right p-1.5 font-semibold text-[10px]">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Linhas do plano ordenadas */}
                    {ordenarLinhasPlano(linhasPlano).map((linha) => (
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
                            let nomeSerie = serie.nome;
                            if (serie.tipo === 'multipla') {
                              const contador = (contadoresSeries[serie.id] || 0) + 1;
                              setContadoresSeries({
                                ...contadoresSeries,
                                [serie.id]: contador,
                              });
                              nomeSerie = `${serie.nome} ${contador}`;
                            }
                            
                            const novasLinhas = linhasPlano.map(l => {
                              if (l.id === linha.id) {
                                return {
                                  ...l,
                                  serieId: serie.id,
                                  serie: nomeSerie,
                                  valor: serie.valorFormatado,
                                  valorOriginal: serie.valor,
                                  valorEditavel: serie.valor === 0,
                                };
                              }
                              return l;
                            });
                            setLinhasPlano(novasLinhas);
                            
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
                        <td className="p-1.5 font-semibold text-[10px] text-center">
                          {linha.valorEditavel ? (
                            editandoValorId === linha.id ? (
                              <Input
                                type="text"
                                placeholder="R$ 0,00"
                                value={linha.valor}
                                onChange={(e) => atualizarValor(linha.id, e.target.value)}
                                onBlur={() => setEditandoValorId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && linha.valor.length <= 4) {
                                    e.preventDefault();
                                    atualizarValor(linha.id, 'R$ 0,00');
                                    setEditandoValorId(null);
                                  }
                                }}
                                autoFocus
                                disabled={!linha.serie}
                                className="w-28 h-7 text-xs font-semibold mx-auto"
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
                            type="number"
                            min="1"
                            value={linha.parcelas}
                            onChange={(e) => atualizarParcelas(linha.id, parseInt(e.target.value) || 1)}
                            disabled={!linha.serie || linha.valorOriginal <= 0}
                            className="w-16 h-7 text-[10px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <Input
                            type="text"
                            placeholder={linha.data ? "" : "DD/MM/AAAA"}
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
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace') {
                                e.preventDefault();
                                atualizarData(linha.id, '');
                              }
                            }}
                            onFocus={(e) => { if (linha.serieId === 'entrada') setEditingEntradaDate(true); e.target.placeholder = ''; }}
                            onBlur={(e) => { if (linha.serieId === 'entrada') setEditingEntradaDate(false); e.target.placeholder = linha.data ? '' : 'DD/MM/AAAA'; }}
                            disabled={!linha.serie}
                            className={`w-full h-7 text-[10px] text-center ${linha.serieId === 'entrada' && !validacaoDataEntrada.valido ? 'border-red-500 border-2 bg-red-50 dark:bg-red-950' : ''}`}
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
                    
                    {/* Linhas fixas - Valor Financiado e Subsídio */}
                    <tr className="bg-blue-50 dark:bg-blue-950 border-t-2 border-blue-300">
                      <td className="p-1.5 font-semibold text-blue-700 dark:text-blue-300 text-[10px]">
                        Valor Financiado
                      </td>
                      <td className="p-1.5 text-center text-[10px]">-</td>
                      <td className="p-1.5 text-center font-semibold text-[10px] text-blue-700 dark:text-blue-300">
                        {resultados?.valorFinanciado || "R$ 0,00"}
                      </td>
                      <td className="p-1.5 text-center text-[10px]">-</td>
                      <td className="p-1.5"></td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-950">
                      <td className="p-1.5 font-semibold text-blue-700 dark:text-blue-300 text-[10px]">
                        Subsídio
                      </td>
                      <td className="p-1.5 text-center text-[10px]">-</td>
                      <td className="p-1.5 text-center font-semibold text-[10px] text-blue-700 dark:text-blue-300">
                        {resultados?.subsidio || "R$ 0,00"}
                      </td>
                      <td className="p-1.5 text-center text-[10px]">-</td>
                      <td className="p-1.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

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
      </div>
    </div>
  );
}
