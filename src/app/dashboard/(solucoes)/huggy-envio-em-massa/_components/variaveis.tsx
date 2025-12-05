"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const VariablesSchema = z.object({
  flowId: z.string().min(1, "Flow ID é obrigatório"),
});

type VariablesFormType = z.infer<typeof VariablesSchema>;

type VariaveisProps = {
  setVariables: Dispatch<SetStateAction<{
    uuid: string;
    flowId: string;
    variables: { chave: string; valor: string }[];
  }>>;
};

const Variaveis = ({ setVariables }: VariaveisProps) => {
  const { register, handleSubmit } = useForm<VariablesFormType>({
    resolver: zodResolver(VariablesSchema),
  });

  const handleSave = (data: VariablesFormType) => {
    toast("Sucesso!", { description: "Variáveis salvas com sucesso" });
    // UUID fixo para Cliente 1200
    setVariables({
      ...data,
      uuid: "dedae4f0-8275-4d9d-abb6-66af99730b73",
      variables: [],
    });
  };

  return (
    <div className="bg-neutral-100 p-3 rounded-lg shadow flex flex-col gap-3">
      <form
        onSubmit={handleSubmit(handleSave)}
        className="w-full flex flex-col gap-2"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Variáveis de envio:</CardTitle>
            <CardDescription>
              Configure as variáveis de envio do flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="flowId">Flow ID</Label>
              <Input
                id="flowId"
                className="w-[180px] p-2 rounded mt-1"
                type="text"
                placeholder="Ex: 374659"
                {...register("flowId")}
              />
            </div>
            <div>
              <Label>Canal de Envio</Label>
              <p className="text-sm text-neutral-600 mt-1">
                Cliente 1200 (fixo)
              </p>
            </div>
            <Button type="submit" className="w-fit mt-4">
              Salvar
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Variaveis;
