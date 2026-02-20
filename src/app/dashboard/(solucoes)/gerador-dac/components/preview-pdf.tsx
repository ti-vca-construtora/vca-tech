"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Eye, FileText, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { FormData } from "../page";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";

interface PreviewPDFProps {
  formData: FormData;
  triggerGenerate?: boolean;
  onGenerateComplete?: () => void;
}

interface DuplicityInfo {
  isDuplicate: boolean;
  intervaloDias: number;
  diasDesdeUltimoDAC?: number;
  ultimoDAC?: {
    dacNumber: string;
    nomeRazaoSocial: string;
    cpf: string;
    descricaoServico: string;
    createdAt: string;
  };
}

export function PreviewPDF({ formData, triggerGenerate = false, onGenerateComplete }: PreviewPDFProps) {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [showDuplicityDialog, setShowDuplicityDialog] = useState(false);
  const [duplicityInfo, setDuplicityInfo] = useState<DuplicityInfo | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isFormEmpty = !formData.nomeRazaoSocial && !formData.cpf && !formData.descricaoServico;
  const isFormComplete = formData.nomeRazaoSocial && 
                         formData.cpf && 
                         formData.valorLiquido &&
                         formData.descricaoServico &&
                         formData.nomeEmpresa &&
                         formData.cnpjEmpresa &&
                         formData.formaPagamento &&
                         (formData.formaPagamento === 'PIX' ? (formData.tipoChavePix && formData.chavePix) : 
                          (formData.banco && formData.agencia && formData.conta && formData.tipoConta));

  useEffect(() => {
    if (isFormComplete && (triggerGenerate || shouldGenerate)) {
      checkDuplicityAndGenerate();
      setShouldGenerate(false);
      onGenerateComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, shouldGenerate, triggerGenerate, isFormComplete]);

  const checkDuplicityAndGenerate = async () => {
    try {
      // Verificar duplicidade
      const checkResponse = await fetch("/api/gerador-dac/check-duplicity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpjEmpresa: formData.cnpjEmpresa,
          valorLiquido: formData.valorLiquido,
        }),
      });

      if (!checkResponse.ok) {
        throw new Error("Erro ao verificar duplicidade");
      }

      const duplicityData: DuplicityInfo = await checkResponse.json();
      
      if (duplicityData.isDuplicate) {
        // Mostrar modal de confirmação
        setDuplicityInfo(duplicityData);
        setShowDuplicityDialog(true);
      } else {
        // Gerar normalmente
        await generatePDF(false);
      }
    } catch (error) {
      console.error("Erro ao verificar duplicidade:", error);
      toast({
        title: "Erro de verificação",
        description: "Não foi possível verificar duplicidade. Gerando PDF...",
        variant: "destructive",
      });
      await generatePDF(false);
    }
  };

  const generatePDF = async (forceGenerate: boolean) => {
    setLoading(true);
    setShowDuplicityDialog(false);

    try {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const response = await fetch("/api/gerador-dac", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          forceGenerate,
        }),
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
      await checkDuplicityAndGenerate();
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Recibo-${Date.now()}.pdf`;
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

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="w-full h-fit sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview do Recibo
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
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-[600px] lg:h-[700px]"
                  title="Preview do Recibo"
                />
              </div>

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
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Duplicidade */}
      <AlertDialog open={showDuplicityDialog} onOpenChange={setShowDuplicityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              DAC Similar Encontrado
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Foi encontrado um DAC com o mesmo <strong>CNPJ</strong> e <strong>valor</strong> gerado recentemente:
              </p>
              
              {duplicityInfo?.ultimoDAC && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Número:</span> {duplicityInfo.ultimoDAC.dacNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Recebedor:</span> {duplicityInfo.ultimoDAC.nomeRazaoSocial}
                  </div>
                  <div>
                    <span className="font-semibold">CPF:</span> {duplicityInfo.ultimoDAC.cpf}
                  </div>
                  <div>
                    <span className="font-semibold">Gerado em:</span>{" "}
                    {formatDate(duplicityInfo.ultimoDAC.createdAt)}
                  </div>
                  <div>
                    <span className="font-semibold">Há:</span> {duplicityInfo.diasDesdeUltimoDAC} dias
                  </div>
                </div>
              )}

              <p className="text-amber-700 font-medium">
                Deseja continuar com a geração do novo DAC mesmo assim?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDuplicityDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => generatePDF(true)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continuar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
