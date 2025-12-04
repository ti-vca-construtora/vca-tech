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
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            ⚠️ Números com problemas detectados
          </DialogTitle>
          <DialogDescription>
            Foram encontrados {invalidPhones.length} número(s) que não seguem o
            padrão brasileiro esperado. Revise os problemas abaixo e decida se
            deseja continuar com a importação.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número Original</TableHead>
                <TableHead>Número Normalizado</TableHead>
                <TableHead>Problemas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invalidPhones.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">
                    {result.originalPhone}
                  </TableCell>
                  <TableCell className="font-mono">{result.phone}</TableCell>
                  <TableCell>
                    <ul className="text-xs text-red-600">
                      {result.issues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Continuar mesmo assim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvalidPhoneModal;
