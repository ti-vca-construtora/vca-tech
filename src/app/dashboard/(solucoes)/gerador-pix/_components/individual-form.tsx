"use client";

import { generatePix } from "@/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { toPng } from "html-to-image";
import Image from "next/image";
import * as qrcode from "qrcode";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormSchema, formSchema } from "../schema/pix-schema";

type PixData = {
  qrCodeLink: string;
  payload: string;
  identificador: string;
};

export function IndividualForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });
  const [pixData, setPixData] = useState<PixData>({
    qrCodeLink: "",
    payload: "",
    identificador: "",
  });

  const handleGenerateQrCode = async (data: FormSchema) => {
    try {
      const response = generatePix([
        {
          name: data.nomeBeneficiario,
          key: data.keyType === "tel" ? `+55${data.key}` : data.key,
          transactionId: data.identificador.trim(),
          city: data.cidade,
          value: Number(data.valor) || 0,
        },
      ]);
      const payload = response.payload();
      const qrCodeUrl = await qrcode.toDataURL(payload);

      setPixData({
        payload: response.payload(),
        qrCodeLink: qrCodeUrl,
        identificador: data.identificador.trim(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = () => {
    const divElement = document.getElementById("capture");
    if (!divElement) return;

    toPng(divElement, { backgroundColor: "white" })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `pix-${Date.now()}.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Erro na geração do QR:", error);
      });
  };

  return (
    <form
      onSubmit={handleSubmit(handleGenerateQrCode)}
      className="h-full min-w-[600px] w-[600px] shadow-md bg-white rounded-lg py-4 px-16 flex flex-col items-center gap-4"
    >
      <h2 className="font-semibold text-lg self-start">QR Code Individual</h2>
      {pixData.payload ? (
        <div className="flex flex-col h-full w-full gap-2 items-center justify-between">
          <div
            id="capture"
            className="flex flex-col w-full items-center justify-center gap-4"
          >
            <span>{pixData.identificador}</span>
            <div onClick={handleDownload} className="cursor-pointer">
              <Image
                height={200}
                width={200}
                src={pixData.qrCodeLink}
                alt="Código QR"
              />
            </div>
            <p className="text-xs font-semibold">Código copia e cola:</p>
            <p className="text-xs max-w-[80%] break-all">{pixData.payload}</p>
            <button
              onClick={() => navigator.clipboard.writeText(pixData.payload)}
              className="bg-azul-claro-vca hover:bg-azul-claro-vca/80 text-white px-2 py-1 rounded text-xs font-semibold"
            >
              Copiar
            </button>
          </div>
          <button
            onClick={() =>
              setPixData({ qrCodeLink: "", payload: "", identificador: "" })
            }
            className="bg-azul-claro-vca mt-6 self-center font-semibold text-sm rounded text-white w-fit p-2"
          >
            Gerar novo QR Code
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-azul-vca font-semibold text-sm">
              Tipo de Chave:
            </label>
            <select
              {...register("keyType")}
              className="border h-10 p-2 w-full rounded shadow-md"
            >
              <option className="text-sm" value="tel">
                Celular
              </option>
              <option className="text-sm" value="cpf">
                CPF/CNPJ
              </option>
              <option className="text-sm" value="email">
                E-mail
              </option>
              <option className="text-sm" value="outro">
                Outro
              </option>
            </select>
            {errors.keyType?.message && (
              <span className="text-xs text-red-500">
                {errors.keyType?.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-azul-vca font-semibold text-sm">
              Chave PIX:
            </label>
            <input
              {...register("key")}
              placeholder="Chave PIX"
              className="border h-10 p-2 w-full rounded shadow-md"
              type="text"
            />
            {errors.key?.message && (
              <span className="text-xs text-red-500">
                {errors.key?.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-azul-vca font-semibold text-sm">
              Nome do Beneficiário:
            </label>
            <input
              {...register("nomeBeneficiario")}
              placeholder="Nome do Beneficiário"
              className="border h-10 p-2 w-full rounded shadow-md"
              type="text"
            />
            {errors.nomeBeneficiario?.message && (
              <span className="text-xs text-red-500">
                {errors.nomeBeneficiario?.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-azul-vca font-semibold text-sm">
              Cidade do Beneficiário:
            </label>
            <input
              {...register("cidade")}
              placeholder="Cidade do Beneficiário"
              className="border h-10 p-2 w-full rounded shadow-md"
              type="text"
            />
            {errors.cidade?.message && (
              <span className="text-xs text-red-500">
                {errors.cidade?.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-azul-vca font-semibold text-sm">
              {"Valor (opcional)"}:
            </label>
            <input
              {...register("valor")}
              placeholder="100.99"
              className="border h-10 p-2 w-full rounded shadow-md"
              type="text"
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/,/g, "");
              }}
            />
            {errors.valor?.message && (
              <span className="text-xs text-red-500">
                {errors.valor?.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-azul-vca font-semibold text-sm">
              {"Identificador"}:
            </label>
            <input
              {...register("identificador")}
              placeholder="Identificador"
              className="border h-10 p-2 w-full rounded shadow-md"
              type="text"
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\s/g, "");
              }}
            />
            {errors.identificador?.message && (
              <span className="text-xs text-red-500">
                {errors.identificador?.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="bg-azul-claro-vca mt-6 self-center font-semibold text-sm rounded text-white w-fit p-2"
          >
            Gerar QR Code individual
          </button>
        </div>
      )}
    </form>
  );
}
