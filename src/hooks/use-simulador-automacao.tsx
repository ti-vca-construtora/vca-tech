// Exemplo de hook React para usar a API de automação

import { useState } from 'react';

interface DadosSimulacao {
  valor?: number;
  prazo?: number;
  renda?: number;
  [key: string]: unknown;
}

interface ResultadoSimulacao {
  [key: string]: unknown;
}

export function useSimuladorAutomacao() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [error, setError] = useState<string | null>(null);

  const iniciarSimulacao = async (dados: DadosSimulacao) => {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      // 1. Criar job na fila
      const response = await fetch('/api/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados }),
      });

      const { jobId } = await response.json();

      // 2. Polling para verificar resultado
      const checkResult = async () => {
        const res = await fetch(`/api/automate?jobId=${jobId}`);
        const data = await res.json();

        if (data.status === 'processing') {
          // Ainda processando, tentar novamente em 2 segundos
          setTimeout(checkResult, 2000);
        } else if (data.status === 'success') {
          setResultado(data.dados);
          setLoading(false);
        } else if (data.status === 'error') {
          setError(data.error);
          setLoading(false);
        }
      };

      checkResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  return { iniciarSimulacao, loading, resultado, error };
}
