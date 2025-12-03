import * as z from "zod";

export const formSchema = z.object({
  keyType: z.enum(["cpf", "tel", "email", "outro"]),
  key: z.string().min(1, "Informe uma chave PIX válida"),
  nomeBeneficiario: z
    .string()
    .min(1, "Informe um nome de beneficiário válido")
    .max(25, "Número máximo de caracteres atingido"),
  cidade: z
    .string()
    .min(1, "Informe uma cidade válida")
    .max(15, "Número máximo de caracteres atingido"),
  valor: z.string().optional(),
  identificador: z
    .string()
    .min(1, "Informe um identificador válido")
    .max(25, "Número máximo de caracteres atingido"),
});

export type FormSchema = z.infer<typeof formSchema>;
