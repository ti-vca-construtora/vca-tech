"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, PlayCircle, ChevronRight, ChevronLeft, User, Home, UserPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Participante {
  pactuacao: number;
  dataNascimento: string;
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

export function SimuladorForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // const [jobId, setJobId] = useState<string | null>(null); // Removido pois não está sendo usado na UI
  // const [status, setStatus] = useState<string>(""); // Removido, pois loadingMessage é mais descritivo
  const [loadingMessage, setLoadingMessage] = useState<string>("Iniciando simulação...");
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [etapaAtual, setEtapaAtual] = useState(1);

  // Form state - Etapa 1: Dados do Cliente
  const [nomeCliente, setNomeCliente] = useState("");

  // New state for client-side progress interval
  const clientProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [dataNascimentoCliente, setDataNascimentoCliente] = useState("");
  const [cidade, setCidade] = useState("Fortaleza");
  const [rendaFamiliar, setRendaFamiliar] = useState("");
  const [possuiTresAnosFGTS, setPossuiTresAnosFGTS] = useState(false);
  const [jaBeneficiadoSubsidio, setJaBeneficiadoSubsidio] = useState(false);
  const [possuiDependentes, setPossuiDependentes] = useState(false);

  // Form state - Etapa 2: Dados do Imóvel
  const [valorAvaliacao, setValorAvaliacao] = useState("");
  const [valorImovel, setValorImovel] = useState("");
  const [nomeEmpreendimento, setNomeEmpreendimento] = useState("");
  const [unidade, setUnidade] = useState("");
  const [origemRecurso, setOrigemRecurso] = useState<"FGTS" | "SBPE">("FGTS");
  const [sistemaAmortizacao, setSistemaAmortizacao] = useState<"SAC" | "PRICE">("SAC");

  // Form state - Etapa 3: Configurações de Pactuação
  const [quantidadeParticipantes, setQuantidadeParticipantes] = useState(1);
  const [participantes, setParticipantes] = useState<Participante[]>([
    { pactuacao: 100, dataNascimento: "" },
  ]);

  // Ref para o intervalo de polling do job
  const pollJobIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa os intervalos ao desmontar o componente
  useEffect(() => {
    return () => {
      if (clientProgressIntervalRef.current) clearInterval(clientProgressIntervalRef.current);
      if (pollJobIntervalRef.current) clearInterval(pollJobIntervalRef.current);
    };
  }, []);

  const getMessageFromProgress = (progress: number): string => {
    if (progress <= 10) return "🚀 Iniciando automação...";
    if (progress <= 20) return "🌐 Acessando portal da Caixa...";
    if (progress <= 30) return "📋 Preenchendo dados iniciais...";
    if (progress <= 40) return "💰 Selecionando origem de recurso...";
    if (progress <= 50) return "🎯 Selecionando código do sistema...";
    if (progress <= 55) return "💰 Configurando sistema de amortização...";
    if (progress <= 60) return "👨‍👩‍👧‍👦 Configurando dependentes...";
    if (progress <= 65) return "📐 Preenchendo área útil...";
    if (progress <= 70) return "➡️ Avançando para próxima etapa...";
    if (progress <= 80) return "📅 Configurando prazo da obra...";
    if (progress <= 90) return "🧮 Calculando resultados...";
    if (progress <= 95) return "📄 Gerando simulação...";
    return "✅ Extraindo resultados...";
  };

  const handleQuantidadeChange = (qtd: number) => {
    setQuantidadeParticipantes(qtd);
    const pactuacaoPadrao = Math.floor(100 / qtd);
    const newParticipantes = Array.from({ length: qtd }, (_, i) => ({
      pactuacao: participantes[i]?.pactuacao || pactuacaoPadrao,
      dataNascimento: participantes[i]?.dataNascimento || dataNascimentoCliente,
    }));
    setParticipantes(newParticipantes);
  };

  const handleParticipanteChange = (
    index: number,
    field: keyof Participante,
    value: string | number
  ) => {
    const updated = [...participantes];
    updated[index] = { ...updated[index], [field]: value };
    setParticipantes(updated);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(numbers) / 100);
  };

  const proximaEtapa = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (etapaAtual === 1) {
      if (!nomeCliente || !dataNascimentoCliente || !cidade || !rendaFamiliar) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos antes de avançar",
          variant: "destructive",
        });
        return;
      }
    } else if (etapaAtual === 2) {
      if (!valorAvaliacao || !valorImovel || !nomeEmpreendimento || !unidade) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos antes de avançar",
          variant: "destructive",
        });
        return;
      }
    }
    setEtapaAtual(etapaAtual + 1);
  };

  const etapaAnterior = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEtapaAtual(etapaAtual - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantidadeParticipantes > 1) {
      const totalPactuacao = participantes.reduce((sum, p) => sum + p.pactuacao, 0);
      if (totalPactuacao !== 100) {
        toast({
          title: "Erro na pactuação",
          description: `A soma das pactuações deve ser 100%. Atual: ${totalPactuacao}%`,
          variant: "destructive",
        });
        return;
      }
      
      for (let i = 0; i < participantes.length; i++) {
        if (!participantes[i].dataNascimento) {
          toast({
            title: "Campos obrigatórios",
            description: `Preencha a data de nascimento do participante ${i + 1}`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setLoading(true);
    // setStatus("Iniciando simulação..."); // Removido
    setProgresso(0);
    setErro(null);
    setLoadingMessage("🚀 Iniciando automação...");
    
    // CORREÇÃO: Garante que a data do cliente principal está no primeiro participante
    // antes de enviar para a API e salvar no sessionStorage.
    const participantesAjustados = [...participantes];
    if (participantesAjustados.length > 0) {
      participantesAjustados[0].dataNascimento = dataNascimentoCliente;
    } // FIM CORREÇÃO

    try {
      let API_URL = process.env.NEXT_PUBLIC_CAIXA_URL ?? "/api/simulador-caixa";
      if (API_URL && !API_URL.endsWith("/api/simulador-caixa")) {
        API_URL = API_URL.replace(/\/?$/, "/api/simulador-caixa");
      }

      const payload = {
        origemRecurso,
        valorImovel: valorImovel.replace(/\D/g, ""),
        valorAvaliacao: valorAvaliacao.replace(/\D/g, ""),
        cidade,
        rendaFamiliar: rendaFamiliar.replace(/\D/g, ""),
        dataNascimento: dataNascimentoCliente,
        possuiTresAnosFGTS,
        jaBeneficiadoSubsidio,
        possuiDependentes,
        quantidadeParticipantes, // Mantido, pois o worker espera este campo
        sistemaAmortizacao,
        participantes: participantesAjustados,
      };

      console.log('📤 Enviando payload para API:', payload);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        throw new Error(text || "Erro desconhecido ao conectar ao endpoint");
      }

      if (!response.ok) {
        // CORREÇÃO: Define o estado de erro para que o modal seja exibido
        setErro(data.error || "Erro ao iniciar simulação");
        throw new Error(data.error || "Erro ao iniciar simulação"); // Ainda lança para o catch
      }

      console.log('📥 Resposta bruta da API:', data);

      if (data.jobId && data.status === "pending") {
        // setJobId(data.jobId); // Removido
        // setStatus("Aguardando processamento..."); // Removido
        setLoadingMessage("Aguardando processamento...");

        // --- Inicia a simulação de progresso "ilusório" no cliente ---
        const duracaoTotalMs = 50000; // 50 segundos
        const intervaloAtualizacao = 500; // Atualiza a cada 0.5 segundos
        const incremento = (intervaloAtualizacao / duracaoTotalMs) * 100;

        clientProgressIntervalRef.current = setInterval(() => {
          setProgresso(prev => Math.min(prev + incremento, 95)); // Avança até 95%
        }, intervaloAtualizacao);
        pollJobStatus(data.jobId);
        toast({
          title: "Simulação iniciada",
          description: `Job ID: ${data.jobId}`,
        });
      } else {
        // Limpa o intervalo de progresso do cliente se for uma resposta síncrona
        if (clientProgressIntervalRef.current) {
          clearInterval(clientProgressIntervalRef.current);
          clientProgressIntervalRef.current = null;
        }
        setLoading(false);
        setProgresso(100); // Garante que o progresso seja 100% para jobs síncronos concluídos
        setLoadingMessage("✅ Simulação concluída!");

        // EXTRAÇÃO INTELIGENTE DOS DADOS
        // O route.ts normalmente retorna { status: 'completed', result: { ...dadosDoWorker } }
        // Se a API retornar o objeto direto, data será o workerData.
        
        const workerData = data.result || data;
        
        // --- 1. Extração dos Resultados ---
        // Verifica se 'resultados' existe OU se o objeto workerData JÁ É o resultado (flattened)
        let resultadosAPI = null;

        if (workerData.resultados && Object.keys(workerData.resultados).length > 0) {
            // Caso ideal: aninhado
            resultadosAPI = workerData.resultados;
        } else if (workerData.valorFinanciado || workerData.tipoFinanciamento) {
            // Caso flattened: o objeto workerData já contém as chaves
            console.log('⚠️ Detectada estrutura plana (flat) de resultados.');
            resultadosAPI = workerData;
        }

        if (!resultadosAPI) {
          console.error('❌ ERRO CRÍTICO: Não foi possível encontrar os resultados no objeto:', workerData);
          toast({
             title: "Erro nos resultados",
             description: "A simulação ocorreu, mas a estrutura de resposta é inválida. Verifique o console.",
             variant: "destructive"
          });
          return;
        }

        sessionStorage.setItem("resultadosSimulacao", JSON.stringify(resultadosAPI));
        console.log('💾 resultadosSimulacao salvos com sucesso:', resultadosAPI);


        // --- 2. Extração dos Dados da Simulação ---
        const dadosRetornados = workerData.dados || workerData.dadosSimulacao;
        
        let dadosParaSalvar: DadosSimulacao;
        
        if (dadosRetornados) {
            dadosParaSalvar = dadosRetornados;
        } else {
            // Fallback usando estado local
             dadosParaSalvar = {
                nomeCliente,
                valorImovel,
                nomeEmpreendimento,
                unidade,
                origemRecurso,
                cidade,
                valorAvaliacao,
                rendaFamiliar,
                quantidadeParticipantes,
                participantes: participantesAjustados,
                possuiTresAnosFGTS,
                jaBeneficiadoSubsidio,
                sistemaAmortizacao,
                possuiDependentes,
            };
        }
        
        // Injeção forçada de dados do imóvel que o worker pode não retornar
        dadosParaSalvar.nomeEmpreendimento = nomeEmpreendimento;
        dadosParaSalvar.unidade = unidade;

        sessionStorage.setItem("dadosSimulacao", JSON.stringify(dadosParaSalvar));
        console.log('💾 dadosSimulacao salvos:', dadosParaSalvar);


        // --- 3. Extração do PDF ---
        // Verifica pdfBase64 (padrão) ou apenas pdf (visto nos logs)
        const pdfBase64 = workerData.pdfBase64 || workerData.pdf;
        
        if (pdfBase64) {
          try {
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const nomeArquivo = `simulacao-${(dadosParaSalvar.nomeCliente || "cliente").replace(/\s+/g, '-')}.pdf`;
            a.download = nomeArquivo;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            console.log('✅ PDF baixado com sucesso');
          } catch (error) {
            console.error('Erro ao fazer download do PDF:', error);
          }
        }

        toast({
          title: "Sucesso!",
          description: "Simulação concluída! Redirecionando...",
        });

        setTimeout(() => {
          router.push("/dashboard/simulador-financiamento-caixa/resultados");
        }, 800);
      }
    } catch (error) {
      console.error("Erro no handleSubmit:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao iniciar simulação",
        variant: "destructive",
      });
      // CORREÇÃO: Define o estado de erro para que o modal seja exibido
      setErro(error instanceof Error ? error.message : "Erro ao iniciar simulação");
      setLoading(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    let tentativas = 0;
    const maxTentativas = 150; // 150 * 2 segundos = 300 segundos = 5 minutos

    // Limpa qualquer intervalo de polling existente antes de iniciar um novo
    if (pollJobIntervalRef.current) {
      clearInterval(pollJobIntervalRef.current);
    }
    
    pollJobIntervalRef.current = setInterval(async () => {
      try {
        tentativas++;
        // Se o progresso do cliente já atingiu 90%, não precisa mais atualizar a mensagem ilusória
        if (tentativas > maxTentativas) {
          clearInterval(pollJobIntervalRef.current!);
          setLoading(false);
          setErro("A simulação demorou mais que o esperado (tempo limite excedido).");
          toast({
            title: "Timeout",
            description: "A simulação demorou mais de 5 minutos.",
            variant: "destructive",
          });
          return;
        }
        
        const response = await fetch(`/api/simulador-caixa?jobId=${id}`);
        const data = await response.json();

        if (data.progress !== undefined) {
          setProgresso(data.progress);
          setLoadingMessage(getMessageFromProgress(data.progress)); // Usa o progresso real do backend
        } else if (progresso < 90) { // Apenas atualiza a mensagem se o progresso ilusório ainda está ativo
          // Se não houver progresso do backend, continua com a mensagem ilusória
          setLoadingMessage(getMessageFromProgress(progresso));
        }

        const statusNormalizado = data.status?.toLowerCase();

        if (statusNormalizado === "completed") {
          clearInterval(pollJobIntervalRef.current!);
          // Limpa o intervalo de progresso do cliente
          if (clientProgressIntervalRef.current) {
            clearInterval(clientProgressIntervalRef.current);
            clientProgressIntervalRef.current = null;
          }
          // setStatus("Simulação concluída!"); // Removido
          setLoading(false);
          
          const resultado = data.result;
          
          // Lógica de salvamento idêntica ao Sync
          // 1. Dados
          const dadosFinal = {
             ...(resultado.dados || {}),
             nomeEmpreendimento,
             unidade,
             quantidadeParticipantes: resultado.dados?.quantidadeParticipantes || participantes.length // Garante que a quantidade de participantes esteja presente
          };
          sessionStorage.setItem("dadosSimulacao", JSON.stringify(dadosFinal));

          // 2. Resultados (Verificação Híbrida)
          let resultadosFinal = null;
          if (resultado.resultados && Object.keys(resultado.resultados).length > 0) {
             resultadosFinal = resultado.resultados;
          } else if (resultado.valorFinanciado) {
             resultadosFinal = resultado;
          }

          if (resultadosFinal) {
             sessionStorage.setItem("resultadosSimulacao", JSON.stringify(resultadosFinal));
          } else {
             console.error("❌ Erro Polling: Resultados vazios", resultado);
          }

          // 3. PDF
          const pdfStr = resultado.pdfBase64 || resultado.pdf;
          if (pdfStr) {
             try {
                const byteCharacters = atob(pdfStr);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `simulacao-${id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
             } catch(e) { console.error(e); }
          }

          toast({ title: "Sucesso!", description: "Redirecionando..." });
          setTimeout(() => {
            router.push("/dashboard/simulador-financiamento-caixa/resultados");
          }, 1000);

        } else if (statusNormalizado === "failed") {
          clearInterval(pollJobIntervalRef.current!);
          // Limpa o intervalo de progresso do cliente
          if (clientProgressIntervalRef.current) {
            clearInterval(clientProgressIntervalRef.current);
            clientProgressIntervalRef.current = null;
          }
          setLoading(false);
          setErro(data.error || "Erro desconhecido durante o processamento."); // Define o erro para o modal
        }
      } catch (error) {
        console.error("Erro no polling:", error);
        clearInterval(pollJobIntervalRef.current!);
        // Limpa o intervalo de progresso do cliente
        if (clientProgressIntervalRef.current) {
          clearInterval(clientProgressIntervalRef.current);
          clientProgressIntervalRef.current = null;
        }
        setLoading(false);
        setErro("Erro na comunicação com o servidor durante o polling."); // Define o erro para o modal
      }
    }, 2000);
  };

  const renderEtapa1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
        <Input id="nomeCliente" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
        <Input id="dataNascimento" type="date" value={dataNascimentoCliente} onChange={(e) => setDataNascimentoCliente(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade *</Label>
        <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rendaFamiliar">Renda Familiar *</Label>
        <Input id="rendaFamiliar" value={rendaFamiliar} onChange={(e) => setRendaFamiliar(formatCurrency(e.target.value))} required />
      </div>
      <div className="space-y-3">
        <Label>Condições Especiais</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="possuiTresAnosFGTS" checked={possuiTresAnosFGTS} onCheckedChange={(c) => setPossuiTresAnosFGTS(!!c)} />
          <Label htmlFor="possuiTresAnosFGTS">Possui 3 anos de FGTS</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="jaBeneficiadoSubsidio" checked={jaBeneficiadoSubsidio} onCheckedChange={(c) => setJaBeneficiadoSubsidio(!!c)} />
          <Label htmlFor="jaBeneficiadoSubsidio">Já beneficiado com subsídio</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="possuiDependentes" checked={possuiDependentes} onCheckedChange={(c) => setPossuiDependentes(!!c)} />
          <Label htmlFor="possuiDependentes">Possui dependentes</Label>
        </div>
      </div>
    </div>
  );

  const renderEtapa2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeEmpreendimento">Nome do Empreendimento *</Label>
        <Input id="nomeEmpreendimento" value={nomeEmpreendimento} onChange={(e) => setNomeEmpreendimento(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="unidade">Unidade *</Label>
        <Input id="unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="valorAvaliacao">Valor de Avaliação *</Label>
        <Input id="valorAvaliacao" value={valorAvaliacao} onChange={(e) => setValorAvaliacao(formatCurrency(e.target.value))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="valorImovel">Valor do Imóvel *</Label>
        <Input id="valorImovel" value={valorImovel} onChange={(e) => setValorImovel(formatCurrency(e.target.value))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="origemRecurso">Origem de Recurso</Label>
        <Select value={origemRecurso} onValueChange={(v: "FGTS" | "SBPE") => setOrigemRecurso(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="FGTS">FGTS</SelectItem><SelectItem value="SBPE">SBPE</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sistemaAmortizacao">Sistema de Amortização</Label>
        <Select value={sistemaAmortizacao} onValueChange={(v: "SAC" | "PRICE") => setSistemaAmortizacao(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="SAC">SAC</SelectItem><SelectItem value="PRICE">PRICE</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderEtapa3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantidadeParticipantes">Quantidade de Participantes</Label>
        <Select value={quantidadeParticipantes.toString()} onValueChange={(v) => handleQuantidadeChange(Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Participante</SelectItem>
            <SelectItem value="2">2 Participantes</SelectItem>
            <SelectItem value="3">3 Participantes</SelectItem>
            <SelectItem value="4">4 Participantes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {quantidadeParticipantes > 1 && (
        <div className="space-y-4">
          <Label>Configurações de Pactuação</Label>
          {participantes.map((p, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">
                Participante {index + 1} {index === 0 && "(Cliente Principal)"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`pactuacao-${index}`}>% de Pactuação</Label>
                  <Input id={`pactuacao-${index}`} type="number" min="0" max="100" value={p.pactuacao} onChange={(e) => handleParticipanteChange(index, "pactuacao", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dataNascimento-${index}`}>Data de Nascimento</Label>
                  <Input id={`dataNascimento-${index}`} type="date" value={index === 0 ? dataNascimentoCliente : p.dataNascimento} onChange={(e) => handleParticipanteChange(index, "dataNascimento", e.target.value)} disabled={index === 0} className={index === 0 ? "bg-muted" : ""} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Dialog open={loading || erro !== null}>
        <DialogContent className="sm:max-w-md">
          {erro ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center"><span className="text-4xl">❌</span></div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Erro na Simulação</h3>
                <p className="text-sm text-muted-foreground">{erro}</p>
                <Button onClick={() => { setErro(null); setLoading(false); }} className="mt-4">Fechar</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="text-center space-y-4 w-full px-4">
                <h3 className="text-lg font-semibold">{loadingMessage}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progresso}%` }}></div>
                </div>
                <p className="text-sm text-muted-foreground">Por favor, aguarde enquanto processamos sua simulação...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="w-full mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant={etapaAtual === 1 ? "default" : "outline"}><User className="h-3 w-3 mr-1" /> Cliente</Badge>
              <Badge variant={etapaAtual === 2 ? "default" : "outline"}><Home className="h-3 w-3 mr-1" /> Imóvel</Badge>
              <Badge variant={etapaAtual === 3 ? "default" : "outline"}><UserPen className="h-3 w-3 mr-1" /> Pactuação</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {etapaAtual === 1 && renderEtapa1()}
            {etapaAtual === 2 && renderEtapa2()}
            {etapaAtual === 3 && renderEtapa3()}

            <div className="flex justify-between gap-3">
              {etapaAtual > 1 && (
                <Button type="button" variant="outline" onClick={etapaAnterior} disabled={loading}><ChevronLeft className="mr-2 h-4 w-4" /> Voltar</Button>
              )}
              {etapaAtual < 3 ? (
                <Button type="button" onClick={proximaEtapa} disabled={loading} className="ml-auto">Próximo <ChevronRight className="ml-2 h-4 w-4" /></Button>
              ) : (
                <Button type="submit" className="ml-auto" disabled={loading}><PlayCircle className="mr-2 h-4 w-4" /> Iniciar Simulação</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}