"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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

import {
  InventorySnapshot,
  loadInventorySnapshotsAsync,
} from "../../_lib/cont-solic-epi-storage";

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function entriesSorted(record: Record<string, number>) {
  return Object.entries(record)
    .filter(([k]) => !!k)
    .sort(([a], [b]) => a.localeCompare(b));
}

export function EstoqueSnapshots() {
  const [snapshots, setSnapshots] = useState<InventorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await loadInventorySnapshotsAsync();
      setSnapshots(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const sorted = useMemo(() => {
    return [...snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [snapshots]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Mostra os snapshots cadastrados pelo técnico (obra, data e contagens).
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
            <TableHead>Cadastrado por</TableHead>
            <TableHead className="w-[140px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Nenhum snapshot cadastrado ainda.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.obraName}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.obraCity}/{s.obraState}
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(s.createdAt)}</TableCell>
                <TableCell>
                  {s.createdBy?.name || s.createdBy?.email || "-"}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Ver detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          {s.obraName} — {formatDateTime(s.createdAt)}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Funcionários (por função)
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Função</TableHead>
                                <TableHead className="w-[120px]">Qtd</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entriesSorted(s.functionCounts).length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={2}
                                    className="text-muted-foreground"
                                  >
                                    Sem dados.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                entriesSorted(s.functionCounts).map(([k, v]) => (
                                  <TableRow key={k}>
                                    <TableCell>{k}</TableCell>
                                    <TableCell>{v}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">EPIs (estoque)</div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>EPI</TableHead>
                                <TableHead className="w-[120px]">Qtd</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entriesSorted(s.epiCounts).length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={2}
                                    className="text-muted-foreground"
                                  >
                                    Sem dados.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                entriesSorted(s.epiCounts).map(([k, v]) => (
                                  <TableRow key={k}>
                                    <TableCell>{k}</TableCell>
                                    <TableCell>{v}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
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
