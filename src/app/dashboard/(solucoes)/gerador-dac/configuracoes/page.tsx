"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase-epi";

export default function ConfiguracoesPage() {
  const [intervaloDias, setIntervaloDias] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar limit(1) para pegar apenas o primeiro registro, mesmo se houver duplicatas
      const { data, error: fetchError } = await supabase
        .from('tb_dac_config')
        .select('intervalo_dias')
        .limit(1)
        .maybeSingle<{ intervalo_dias: number }>();

      if (fetchError) throw fetchError;

      if (data) {
        setIntervaloDias(data.intervalo_dias);
      } else {
        // Se não houver configuração, usar padrão de 30 dias
        setIntervaloDias(30);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Validação
      if (intervaloDias < 1 || intervaloDias > 365) {
        setError('O intervalo deve estar entre 1 e 365 dias.');
        return;
      }

      // Atualizar configuração (pegar o primeiro registro se houver múltiplos)
      const { data: configData } = await supabase
        .from('tb_dac_config')
        .select('id')
        .limit(1)
        .maybeSingle<{ id: string }>();
      
      if (!configData?.id) {
        throw new Error('Configuração não encontrada');
      }
      
      const { error: updateError } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('tb_dac_config') as any)
        .update({ 
          intervalo_dias: intervaloDias,
          updated_at: new Date().toISOString()
        })
        .eq('id', configData.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Verificação</CardTitle>
          <CardDescription>
            Configure o intervalo de dias para verificação de duplicidade na geração de DACs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Configurações salvas com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="intervalo">
              Intervalo de Verificação (dias)
            </Label>
            <Input
              id="intervalo"
              type="number"
              min="1"
              max="365"
              value={intervaloDias}
              onChange={(e) => setIntervaloDias(parseInt(e.target.value) || 1)}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-600">
              O sistema irá avisar se um DAC com o mesmo <strong>CNPJ</strong> e{" "}
              <strong>valor</strong> foi gerado nos últimos <strong>{intervaloDias} dias</strong>.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">
              Como funciona a verificação?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ao gerar um DAC, o sistema verifica se já existe um registro</li>
              <li>• A verificação compara: <strong>CNPJ da empresa</strong> + <strong>Valor</strong></li>
              <li>• Se encontrar um DAC similar nos últimos {intervaloDias} dias, você será notificado</li>
              <li>• Você poderá optar por continuar ou cancelar a geração</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
