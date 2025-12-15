"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function SimuladorForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("Iniciando simulação...");
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [etapaAtual, setEtapaAtual] = useState(1);

  // Form state - Etapa 1: Dados do Cliente
  const [nomeCliente, setNomeCliente] = useState("");
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

  // Mapear progresso para mensagens específicas
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
    // Prevenir submit do formulário
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (etapaAtual === 1) {
      // Validar etapa 1
      if (!nomeCliente || !dataNascimentoCliente || !cidade || !rendaFamiliar) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos antes de avançar",
          variant: "destructive",
        });
        return;
      }
    } else if (etapaAtual === 2) {
      // Validar etapa 2
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

  const novaSimulacao = () => {
    setEtapaAtual(1);
    setJobId(null);
    setStatus("");
  };

  const etapaAnterior = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir submit do formulário
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEtapaAtual(etapaAtual - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar etapa 3
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
      
      // Verificar se todas as datas foram preenchidas
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
    setStatus("Iniciando simulação...");
    setProgresso(0);
    setErro(null);
    setLoadingMessage("🚀 Iniciando automação...");

    // Garantir que participante 1 sempre tem a data do cliente
    const participantesAjustados = participantes.map((p, i) => ({
      ...p,
      dataNascimento: i === 0 ? dataNascimentoCliente : p.dataNascimento,
    }));

    try {
      // Garante que a URL sempre termina com /api/simulador-caixa
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
        quantidadeParticipantes,
        sistemaAmortizacao,
        participantes: participantesAjustados.map((p, i) => ({
          dataNascimento: i === 0 ? dataNascimentoCliente : p.dataNascimento,
          pactuacao: p.pactuacao,
        })),
      };

      let data;
      let response;
      try {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Tenta parsear JSON, se falhar, captura erro
        data = await response.json();
      } catch (err) {
        // Se não for JSON, tenta ler texto e lança erro mais amigável
        let errorText = "";
        if (response) {
          try {
            errorText = await response.text();
          } catch {}
        }
        throw new Error(errorText || "Erro desconhecido ao conectar ao endpoint");
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar simulação");
      }

      // Suporta dois fluxos: assíncrono (com jobId) e síncrono (resultado imediato)
      if (data.jobId) {
        setJobId(data.jobId);
        setStatus("Aguardando processamento...");
        pollJobStatus(data.jobId);

        toast({
          title: "Simulação iniciada",
          description: `Job ID: ${data.jobId}`,
        });
      } else {
        // Resultado imediato
        const resultadoCompleto = data.result ?? data;
        const resultados = resultadoCompleto.resultados ?? null;
        const pdfBase64 = resultadoCompleto.pdfBase64 ?? null;

        setStatus("Simulação concluída!");
        setLoading(false);

        // Salvar dados da simulação (entrada)
        const dadosParaSalvar: DadosSimulacao = {
          nomeCliente,
          valorImovel,
          nomeEmpreendimento,
          unidade,
          origemRecurso,
          cidade,
          valorAvaliacao,
          rendaFamiliar,
          quantidadeParticipantes,
          participantes,
          possuiTresAnosFGTS,
          jaBeneficiadoSubsidio,
          sistemaAmortizacao,
          possuiDependentes,
        };
        sessionStorage.setItem("dadosSimulacao", JSON.stringify(dadosParaSalvar));

        if (resultados) {
          sessionStorage.setItem("resultadosSimulacao", JSON.stringify(resultados));
        }

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
            const nomeArquivo = nomeCliente 
              ? `simulacao-${nomeCliente.replace(/\s+/g, '-')}.pdf`
              : `simulacao-${Date.now()}.pdf`;
            a.download = nomeArquivo;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } catch (error) {
            console.error('Erro ao fazer download do PDF:', error);
          }
        }

        toast({
          title: "Sucesso!",
          description: "Simulação concluída! Redirecionando...",
        });

        setTimeout(() => {
          try {
            router.push("/dashboard/simulador-financiamento-caixa/resultados");
          } catch (error) {
            console.error('Erro ao redirecionar:', error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao iniciar simulação",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    let tentativas = 0;
    const maxTentativas = 150; // 5 minutos com polling de 2 segundos

    // Garante que a URL base é igual ao POST
    let API_URL = process.env.NEXT_PUBLIC_CAIXA_URL ?? "/api/simulador-caixa";
    if (API_URL && !API_URL.endsWith("/api/simulador-caixa")) {
      API_URL = API_URL.replace(/\/?$/, "/api/simulador-caixa");
    }

    const interval = setInterval(async () => {
      try {
        tentativas++;
        if (tentativas > maxTentativas) {
          clearInterval(interval);
          setLoading(false);
          setStatus("Tempo limite excedido");
          toast({
            title: "Timeout",
            description: "A simulação demorou mais de 5 minutos. Por favor, tente novamente.",
            variant: "destructive",
          });
          return;
        }

        let data;
        let response;
        try {
          response = await fetch(`${API_URL}?jobId=${id}`);
          data = await response.json();
        } catch (err) {
          let errorText = "";
          if (response) {
            try {
              errorText = await response.text();
            } catch {}
          }
          throw new Error(errorText || "Erro desconhecido ao conectar ao endpoint");
        }

        // ...existing code...
        console.log(`[Polling ${tentativas}] Status:`, data.status, 'Progress:', data.progress, 'Data completo:', data);

        if (data.progress !== undefined) {
          setProgresso(data.progress);
          setLoadingMessage(getMessageFromProgress(data.progress));
        }

        const statusNormalizado = data.status?.toLowerCase();

        if (statusNormalizado === "pending") {
          setStatus("Aguardando worker processar o job...");
        } else if (statusNormalizado === "processing") {
          setStatus("Processando simulação na Caixa...");
        } else if (statusNormalizado === "failed") {
          clearInterval(interval);
          setLoading(false);
          setErro(data.error || "Erro desconhecido durante a simulação");
          toast({
            title: "Erro na simulação",
            description: data.error || "Ocorreu um erro durante o processamento",
            variant: "destructive",
          });
        } else if (statusNormalizado === "completed") {
          // ...existing code...
          setStatus("Simulação concluída!");
          setLoading(false);
          clearInterval(interval);

          const dadosParaSalvar: DadosSimulacao = {
            nomeCliente,
            valorImovel,
            nomeEmpreendimento,
            unidade,
            origemRecurso,
            cidade,
            valorAvaliacao,
            rendaFamiliar,
            quantidadeParticipantes,
            participantes,
            possuiTresAnosFGTS,
            jaBeneficiadoSubsidio,
            sistemaAmortizacao,
            possuiDependentes,
          };
          sessionStorage.setItem("dadosSimulacao", JSON.stringify(dadosParaSalvar));

          if (data.result?.resultados) {
            sessionStorage.setItem("resultadosSimulacao", JSON.stringify(data.result.resultados));
          }

          if (data.result?.pdfBase64) {
            try {
              const byteCharacters = atob(data.result.pdfBase64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const nomeArquivo = data.result.nomeCliente 
                ? `simulacao-${data.result.nomeCliente.replace(/\s+/g, '-')}.pdf`
                : `simulacao-${id}.pdf`;
              a.download = nomeArquivo;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (error) {
              console.error('Erro ao fazer download do PDF:', error);
            }
          }

          toast({
            title: "Sucesso!",
            description: "Simulação concluída! Redirecionando...",
          });

          setTimeout(() => {
            try {
              router.push("/dashboard/simulador-financiamento-caixa/resultados");
            } catch (error) {
              console.error('❌ Erro ao executar router.push:', error);
            }
          }, 1000);
        } else if (statusNormalizado === "error") {
          setStatus("Erro no processamento");
          setLoading(false);
          clearInterval(interval);
          toast({
            title: "Erro",
            description: data.error || "Erro ao processar simulação",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
        clearInterval(interval);
        setLoading(false);
        setStatus("Erro ao verificar status");
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao verificar status da simulação",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const renderEtapa1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
        <Input
          id="nomeCliente"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
          placeholder="Digite o nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
        <Input
          id="dataNascimento"
          type="date"
          value={dataNascimentoCliente}
          onChange={(e) => setDataNascimentoCliente(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade *</Label>
        <Input
          id="cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Ex: Fortaleza"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rendaFamiliar">Renda Familiar *</Label>
        <Input
          id="rendaFamiliar"
          value={rendaFamiliar}
          onChange={(e) => setRendaFamiliar(formatCurrency(e.target.value))}
          placeholder="R$ 0,00"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Condições Especiais</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="possuiTresAnosFGTS"
            checked={possuiTresAnosFGTS}
            onCheckedChange={(checked) => setPossuiTresAnosFGTS(!!checked)}
          />
          <label
            htmlFor="possuiTresAnosFGTS"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Possui 3 anos de FGTS
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="jaBeneficiadoSubsidio"
            checked={jaBeneficiadoSubsidio}
            onCheckedChange={(checked) => setJaBeneficiadoSubsidio(!!checked)}
          />
          <label
            htmlFor="jaBeneficiadoSubsidio"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Já beneficiado com subsídio
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="possuiDependentes"
            checked={possuiDependentes}
            onCheckedChange={(checked) => setPossuiDependentes(!!checked)}
          />
          <label
            htmlFor="possuiDependentes"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Possui dependentes
          </label>
        </div>
      </div>
    </div>
  );

  const renderEtapa2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeEmpreendimento">Nome do Empreendimento *</Label>
        <Input
          id="nomeEmpreendimento"
          value={nomeEmpreendimento}
          onChange={(e) => setNomeEmpreendimento(e.target.value)}
          placeholder="Digite o nome do empreendimento"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unidade">Unidade *</Label>
        <Input
          id="unidade"
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          placeholder="BLXX - APTXX"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="valorAvaliacao">Valor de Avaliação *</Label>
        <Input
          id="valorAvaliacao"
          value={valorAvaliacao}
          onChange={(e) => setValorAvaliacao(formatCurrency(e.target.value))}
          placeholder="R$ 0,00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="valorImovel">Valor do Imóvel *</Label>
        <Input
          id="valorImovel"
          value={valorImovel}
          onChange={(e) => setValorImovel(formatCurrency(e.target.value))}
          placeholder="R$ 0,00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="origemRecurso">Origem de Recurso</Label>
        <Select
          value={origemRecurso}
          onValueChange={(value: "FGTS" | "SBPE") => setOrigemRecurso(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FGTS">FGTS</SelectItem>
            <SelectItem value="SBPE">SBPE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sistemaAmortizacao">Sistema de Amortização</Label>
        <Select
          value={sistemaAmortizacao}
          onValueChange={(value: "SAC" | "PRICE") => setSistemaAmortizacao(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SAC">SAC</SelectItem>
            <SelectItem value="PRICE">PRICE</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderEtapa3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantidadeParticipantes">Quantidade de Participantes</Label>
        <Select
          value={quantidadeParticipantes.toString()}
          onValueChange={(value) => handleQuantidadeChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
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
          {participantes.map((participante, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">
                Participante {index + 1}
                {index === 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Cliente Principal: {nomeCliente})
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`pactuacao-${index}`}>% de Pactuação</Label>
                  <Input
                    id={`pactuacao-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={participante.pactuacao}
                    onChange={(e) =>
                      handleParticipanteChange(index, "pactuacao", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dataNascimento-${index}`}>Data de Nascimento</Label>
                  <Input
                    id={`dataNascimento-${index}`}
                    type="date"
                    value={index === 0 ? dataNascimentoCliente : participante.dataNascimento}
                    onChange={(e) =>
                      handleParticipanteChange(index, "dataNascimento", e.target.value)
                    }
                    disabled={index === 0}
                    className={index === 0 ? "bg-muted" : ""}
                  />
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
      {/* Modal de Carregamento */}
      <Dialog open={loading || erro !== null}>
        <DialogContent className="sm:max-w-md">
          {erro ? (
            // Tela de Erro
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-4xl">❌</span>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Erro na Simulação</h3>
                <p className="text-sm text-muted-foreground">
                  {erro}
                </p>
                <Button 
                  onClick={() => {
                    setErro(null);
                    setLoading(false);
                  }}
                  className="mt-4"
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            // Tela de Carregamento com Progresso
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="text-center space-y-4 w-full px-4">
                <h3 className="text-lg font-semibold">{loadingMessage}</h3>
                
                {/* Barra de Progresso */}
                <div className="w-full space-y-2">
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progresso}% concluído
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Por favor, aguarde enquanto processamos sua simulação...
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Formulário */}
      <Card className="w-full mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant={etapaAtual === 1 ? "default" : "outline"}>
                <User className="h-3 w-3 mr-1" />
                Cliente
              </Badge>
              <Badge variant={etapaAtual === 2 ? "default" : "outline"}>
                <Home className="h-3 w-3 mr-1" />
                Imóvel
              </Badge>
              <Badge variant={etapaAtual === 3 ? "default" : "outline"}>
                <UserPen  className="h-3 w-3 mr-1" />
                Pactuação
              </Badge>
            </div>
          </div>
        </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {etapaAtual === 1 && renderEtapa1()}
              {etapaAtual === 2 && renderEtapa2()}
              {etapaAtual === 3 && renderEtapa3()}

              {/* Navegação */}
              <div className="flex justify-between gap-3">
                {etapaAtual > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={etapaAnterior}
                    disabled={loading}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                )}

                {etapaAtual < 3 ? (
                  <Button
                    type="button"
                    onClick={proximaEtapa}
                    disabled={loading}
                    className="ml-auto"
                  >
                    Próximo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={loading}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Iniciar Simulação
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
