"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { loadEpiRequestsFromDB } from "../../_lib/cont-solic-epi-supabase";

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING: { label: "Pendente", variant: "secondary" },
    APPROVED: { label: "Aprovado", variant: "default" },
    REJECTED: { label: "Rejeitado", variant: "destructive" },
    COMPLETED: { label: "Concluído", variant: "outline" },
  };
  
  const config = variants[status] || { label: status, variant: "secondary" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function HistoricoSolicitacoes() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await loadEpiRequestsFromDB();
      setRequests(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const sorted = useMemo(() => {
    return [...requests].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [requests]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Histórico de solicitações de EPIs realizadas.
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-claro-vca"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Obra</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Solicitado por</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Nenhuma solicitação cadastrada ainda.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.obra_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.obra_type}
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(req.created_at)}</TableCell>
                  <TableCell>{req.created_by_name || "-"}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Solicitação - {req.obra_name}
                          </DialogTitle>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(req.created_at)} • {req.created_by_name}
                          </div>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Resumo de EPIs Solicitados */}
                          <div className="space-y-2">
                            <div className="text-sm font-semibold">Resumo da Solicitação</div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>EPI</TableHead>
                                  <TableHead className="w-[120px]">Quantidade</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(req.total_summary || {})
                                  .filter(([, v]: any) => v.adjusted > 0)
                                  .sort(([a], [b]) => a.localeCompare(b))
                                  .map(([epi, data]: any) => (
                                    <TableRow key={epi}>
                                      <TableCell>{epi}</TableCell>
                                      <TableCell>{data.adjusted}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Dados Coletados */}
                          {req.collected_data && (
                            <div className="space-y-4">
                              <div className="text-sm font-semibold">Dados Coletados</div>
                              
                              <div className="grid gap-4 md:grid-cols-2">
                                {/* Funcionários Efetivos */}
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    Funcionários Efetivos
                                  </div>
                                  <div className="border rounded-lg p-3 space-y-1 text-sm">
                                    {Object.entries(req.collected_data.currentFunctionCounts || {})
                                      .filter(([, v]) => v)
                                      .map(([func, qty]) => (
                                        <div key={func} className="flex justify-between">
                                          <span>{func}:</span>
                                          <span className="font-medium">{qty as string}</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>

                                {/* Funcionários Projetados */}
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    Funcionários Projetados
                                  </div>
                                  <div className="border rounded-lg p-3 space-y-1 text-sm">
                                    {Object.entries(req.collected_data.projectedFunctionCounts || {})
                                      .filter(([, v]) => v)
                                      .map(([func, qty]) => (
                                        <div key={func} className="flex justify-between">
                                          <span>{func}:</span>
                                          <span className="font-medium">{qty as string}</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>

                              {/* Estoque Inicial */}
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Estoque Informado
                                </div>
                                <div className="border rounded-lg p-3">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                    {Object.entries(req.collected_data.epiCounts || {})
                                      .filter(([, v]) => v)
                                      .sort(([a], [b]) => a.localeCompare(b))
                                      .map(([epi, qty]) => (
                                        <div key={epi} className="flex justify-between">
                                          <span>{epi}:</span>
                                          <span className="font-medium">{qty as string}</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
