"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, User, Calculator, CheckCircle2, XCircle, FileText, ArrowLeft } from "lucide-react";

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
  entrada: string;
  valorAvaliacao: string;
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

export function ResultadosSimulacao() {
  const router = useRouter();
  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [dadosSimulacao, setDadosSimulacao] = useState<DadosSimulacao | null>(null);
  const [semParcelamento, setSemParcelamento] = useState(false);

  useEffect(() => {
    console.log('🔍 ResultadosSimulacao: Verificando sessionStorage...')
    
    const dadosStr = sessionStorage.getItem("dadosSimulacao");
    const resultadosStr = sessionStorage.getItem("resultadosSimulacao");

    console.log('📦 Dados encontrados:', { 
      temDados: !!dadosStr, 
      temResultados: !!resultadosStr 
    })

    if (!dadosStr || !resultadosStr) {
      console.log('❌ Dados não encontrados, redirecionando...')
      router.push("/dashboard/simulador-financiamento-caixa");
      return;
    }

    try {
      const dados = JSON.parse(dadosStr);
      const results = JSON.parse(resultadosStr);
      
      console.log('✅ Dados carregados com sucesso:', { dados, results })
      
      setDadosSimulacao(dados);
      setResultados(results);
    } catch (error) {
      console.error('❌ Erro ao parsear dados:', error)
      router.push("/dashboard/simulador-financiamento-caixa");
    }
  }, [router]);

  const formatarMoeda = (valor: string | undefined | null) => {
    if (!valor || typeof valor !== 'string') return '';
    // Se já vier formatado do backend, retorna
    if (valor.includes('R$')) return valor;
    // Caso contrário, formata
    const numero = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(numero)) return '';
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numero);
  };

  const handleDownloadPDF = async () => {
    if (!dadosSimulacao || !resultados) return;
    
    // PDF será gerado pelo Puppeteer no backend
    try {
      const response = await fetch('/api/simulador-caixa/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dadosSimulacao, resultados }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulacao-${dadosSimulacao.nomeCliente.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleMontagemPlano = () => {
    router.push('/dashboard/simulador-financiamento-caixa/montagem-plano');
  };
  
  const novaSimulacao = () => {
    sessionStorage.removeItem('dadosSimulacao');
    sessionStorage.removeItem('resultadosSimulacao');
    router.push('/dashboard/simulador-financiamento-caixa');
  };


  // Se resultados for um objeto vazio, mostrar aviso
  if (!resultados || !dadosSimulacao) {
    return <div>Carregando...</div>;
  }
  const isResultadosVazio = resultados && Object.keys(resultados).length === 0;

  return (
    <div className="space-y-6 w-full mx-auto" id="resultados-simulacao">
      {isResultadosVazio && (
        <div className="text-red-500 text-center">Nenhum resultado retornado pela simulação.<br/>Verifique o backend ou os dados enviados.</div>
      )}
      {/* Cabeçalho com Título e Botão Voltar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={novaSimulacao}
            title="Voltar para ajustar simulação"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Resultado da Simulação</h2>
            <p className="text-sm text-muted-foreground">
              Confira os dados e escolha a próxima ação
            </p>
          </div>
        </div>
      </div>

      {/* Debug visual dos dados carregados */}
      <details className="mb-4">
        <summary className="cursor-pointer text-xs text-gray-400">Debug sessionStorage</summary>
        <pre className="text-xs text-left bg-gray-200 p-2 rounded">dadosSimulacao: {JSON.stringify(dadosSimulacao, null, 2)}
    resultados: {JSON.stringify(resultados, null, 2)}</pre>
      </details>
      {/* Grid Layout: Cliente (esquerda - 1/3) e Simulação (direita - 2/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Card do Cliente - Menor, à esquerda */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-semibold">{dadosSimulacao.nomeCliente}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantidade de Participantes</p>
              <p className="font-semibold">{dadosSimulacao.quantidadeParticipantes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Renda Familiar</p>
              <p className="font-semibold">{dadosSimulacao.rendaFamiliar}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Origem de Recurso</p>
              <p className="font-semibold">{dadosSimulacao.origemRecurso}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Participantes</p>
              <div className="space-y-2">
                {dadosSimulacao.participantes.map((p, i) => (
                  <div key={i} className="flex flex-col gap-1 p-2 bg-muted rounded-md">
                    <span className="text-sm font-medium">
                      {i === 0 ? 'Participante 1' : `Participante ${i + 1}`}: {p.pactuacao}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.dataNascimento).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Condições</p>
              <div className="flex flex-col gap-2">
                <Badge 
                  variant={dadosSimulacao.possuiTresAnosFGTS ? "default" : "destructive"} 
                  className={`justify-start ${dadosSimulacao.possuiTresAnosFGTS ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {dadosSimulacao.possuiTresAnosFGTS ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  3 anos de FGTS
                </Badge>
                <Badge 
                  variant={dadosSimulacao.jaBeneficiadoSubsidio ? "default" : "destructive"} 
                  className={`justify-start ${dadosSimulacao.jaBeneficiadoSubsidio ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {dadosSimulacao.jaBeneficiadoSubsidio ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  Já beneficiado
                </Badge>
                <Badge 
                  variant={dadosSimulacao.possuiDependentes ? "default" : "destructive"} 
                  className={`justify-start ${dadosSimulacao.possuiDependentes ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {dadosSimulacao.possuiDependentes ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  Possui dependentes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Simulação - Maior, à direita */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Financiamento</p>
              <p className="font-semibold text-lg">{resultados.tipoFinanciamento}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Valor de Avaliação</p>
                <p className="text-xl md:text-2xl font-bold">{formatarMoeda(resultados.valorAvaliacao)}</p>
              </div>
              <div className="p-3 md:p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Valor do Imóvel</p>
                <p className="text-xl md:text-2xl font-bold">{formatarMoeda(resultados.valorImovel)}</p>
              </div>
              <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Entrada</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatarMoeda(resultados.entrada)}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subsídio</p>
                <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatarMoeda(resultados.subsidio)}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Valor Financiado</p>
                <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatarMoeda(resultados.valorFinanciado)}
                </p>
              </div>
              <div className="p-3 md:p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Prestação</p>
                <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatarMoeda(resultados.prestacao)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Prazo</p>
                <p className="text-lg md:text-xl font-bold">{resultados.prazo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistema de Amortização</p>
                <p className="text-lg md:text-xl font-bold">{dadosSimulacao.sistemaAmortizacao}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unidade</p>
                <p className="text-xl font-bold">{dadosSimulacao.unidade}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sem-parcelamento" 
                checked={semParcelamento}
                onCheckedChange={(checked) => setSemParcelamento(checked as boolean)}
              />
              <label
                htmlFor="sem-parcelamento"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Sem Plano de Pagamento
              </label>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Empreendimento</p>
              <p className="text-xl font-bold">{dadosSimulacao.nomeEmpreendimento}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleDownloadPDF} size="lg" className="gap-2" disabled={!semParcelamento}>
          <Download className="h-5 w-5" />
          Download PDF
        </Button>
        <Button onClick={handleMontagemPlano} size="lg" variant="outline" className="gap-2">
          <FileText className="h-5 w-5" />
          Montagem de Plano
        </Button>
      </div>
    </div>
  );
}
