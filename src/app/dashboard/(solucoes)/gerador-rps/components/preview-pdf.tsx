"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, FileText, Loader2, RefreshCw } from "lucide-react";
import { FormData } from "../page";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";

interface PreviewPDFProps {
  formData: FormData;
  triggerGenerate?: boolean;
  onGenerateComplete?: () => void;
}

export function PreviewPDF({ formData, triggerGenerate = false, onGenerateComplete }: PreviewPDFProps) {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isFormEmpty = !formData.nomeRazaoSocial && !formData.cpf && !formData.descricaoServico;
  const isFormComplete = formData.nomeRazaoSocial && 
                         formData.cpf && 
                         formData.pis &&
                         formData.estado &&
                         formData.municipio &&
                         formData.descricaoServico &&
                         formData.valorServico &&
                         formData.formaPagamento;

  // Gerar PDF quando triggerGenerate mudar ou quando formulário estiver completo
  useEffect(() => {
    if (isFormComplete && (triggerGenerate || shouldGenerate)) {
      generatePDF();
      setShouldGenerate(false);
      onGenerateComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, shouldGenerate, triggerGenerate, isFormComplete]);

  const generatePDF = async () => {
    setLoading(true);

    try {
      // Limpar URL anterior
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const response = await fetch("/api/gerador-rps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      toast({
        title: "PDF gerado com sucesso!",
        description: "Visualize o recibo no preview ao lado",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isFormComplete) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios antes de baixar o PDF",
        variant: "destructive",
      });
      return;
    }

    if (!pdfUrl) {
      // Gerar PDF primeiro se não existir
      await generatePDF();
      return;
    }

    // Baixar PDF
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `RPS-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "O PDF está sendo baixado",
    });
  };

  const handleGeneratePreview = () => {
    if (!isFormComplete) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    setShouldGenerate(true);
  };

  // Limpar URL ao desmontar
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <Card className="w-full h-fit sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview do RPS
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isFormEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm">Preencha o formulário para gerar o preview</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-16 w-16 mb-4 text-primary animate-spin" />
            <p className="text-sm font-medium">Gerando PDF...</p>
            <p className="text-xs text-muted-foreground mt-2">Aguarde enquanto processamos seu recibo</p>
          </div>
        ) : !pdfUrl ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 mb-4 opacity-20 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              O preview será exibido aqui quando você clicar em &quot;Gerar Preview&quot; no formulário
            </p>
          </div>
        ) : (
          <>
            {/* Preview do PDF */}
            <div className="border rounded-lg overflow-hidden bg-gray-100">
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-[600px] lg:h-[700px]"
                title="Preview do RPS"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePreview}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar Preview
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="flex-1"
                disabled={loading || !isFormComplete}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </div>

            {/* Informações do recibo */}
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
              <p className="font-semibold">Informações do Recibo:</p>
              <p>• Valores incluem cálculo de imposto retido (11%)</p>
              <p>• Número do RPS gerado automaticamente com timestamp</p>
              <p>• Documento pronto para impressão em formato A4</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
