"use client";
import React from "react";
import { PhoneValidationResult } from "@/lib/phone-validation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type InvalidPhoneModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invalidPhones: PhoneValidationResult[];
};

const InvalidPhoneModal = ({
  isOpen,
  onClose,
  onConfirm,
  invalidPhones,
}: InvalidPhoneModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] sm:max-h-[80vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            ⚠️ Números com problemas detectados
          </DialogTitle>
          <DialogDescription className="text-sm">
            Foram encontrados {invalidPhones.length} número(s) que não seguem o
            padrão brasileiro esperado. Revise os problemas abaixo e decida se
            deseja continuar com a importação.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-md border p-2 sm:p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm min-w-[120px]">Número Original</TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[120px]">Número Normalizado</TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[200px]">Problemas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invalidPhones.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs sm:text-sm break-all">
                      {result.originalPhone}
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm break-all">{result.phone}</TableCell>
                    <TableCell>
                      <ul className="text-xs text-red-600 space-y-1">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="break-words">• {issue}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">Continuar mesmo assim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvalidPhoneModal;
