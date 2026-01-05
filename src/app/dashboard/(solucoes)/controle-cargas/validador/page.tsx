"use client";

/* eslint-disable @next/next/no-img-element */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env
  .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

const supabase: SupabaseClient = (typeof window !== "undefined" &&
  createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)) as SupabaseClient;

type Submission = {
  id: number;
  uid: string | null;
  nome: string | null;
  cpf: string | null;
  obra: string | null;
  type: number | null;
  auth: string | null;
  data: string | null;
  base64: string | null;
};

type TripType = {
  id: number;
  description: string;
  number: number;
  price: number;
};

type RawTripType = {
  id?: number | null;
  description?: string | null;
  number?: number | null;
  price?: number | null;
};

const Validador = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);

  const getTypeLabel = (typeNumber?: number | null) => {
    if (typeNumber === null || typeNumber === undefined) return "";
    const t = tripTypes.find((x) => x.number === typeNumber);
    return t ? t.description : String(typeNumber);
  };

  const fetchTripTypes = async () => {
    try {
      const { data, error: supError } = await supabase
        .from("trip_types")
        .select("id, description, number, price")
        .order("number", { ascending: true });

      if (supError) {
        setTripTypes([]);
        return;
      }

      const raw = (data ?? []) as RawTripType[];
      const parsed: TripType[] = raw.map((r, i) => ({
        id: Number(r.id ?? i),
        description: String(r.description ?? ""),
        number: Number(r.number ?? 0),
        price: Number(r.price ?? 0),
      }));
      setTripTypes(parsed);
    } catch (err) {
      setTripTypes([]);
    }
  };

  // load types once
  useEffect(() => {
    fetchTripTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = async (value?: string) => {
    // normalize scanner output: replace semicolons with hyphens
    const authCode = (value ?? code).trim().replace(/;/g, "-");
    if (!authCode) {
      setError("Informe o código ou escaneie o QR");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: supError } = await supabase
        .from("submits")
        .select("*")
        .eq("auth", authCode)
        .limit(1);

      if (supError) {
        setError(supError.message);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if (!data || (data as any[]).length === 0) {
        setError("Autenticação inválida");
      } else {
        setResult((data as Submission[])[0]);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 w-3/4">
      <h2 className="text-2xl font-semibold mb-4">Validador de Autenticação</h2>

      {!result && (
        <div className="mb-4 ">
          <p className="mb-2">
            Faça a leitura do QR code ou digite o código de autenticação:
          </p>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-2 text-lg flex-1"
              placeholder="Código de autenticação"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-lg"
              onClick={() => handleCheck()}
              disabled={loading}
            >
              Verificar
            </button>
          </div>
        </div>
      )}

      {loading && <div className="text-lg">Verificando...</div>}

      {error && <div className="mb-4 text-red-600 text-lg">{error}</div>}

      {result && (
        <div className="border rounded p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Registro encontrado</h3>
            <button
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
              onClick={reset}
            >
              Nova validação
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 text-base">
            <div>
              <span className="font-medium">Nome:</span> {result.nome}
            </div>
            <div>
              <span className="font-medium">CPF:</span> {result.cpf}
            </div>
            <div>
              <span className="font-medium">Obra:</span> {result.obra}
            </div>
            <div>
              <span className="font-medium">Tipo:</span>{" "}
              {getTypeLabel(result.type) ? (
                getTypeLabel(result.type)
              ) : (
                <span className="text-gray-500">sem</span>
              )}
            </div>
            <div>
              <span className="font-medium">Data:</span> {result.data}
            </div>
            <div>
              <span className="font-medium">Auth:</span> {result.auth}
            </div>
            <div>
              <span className="font-medium">Imagem:</span>{" "}
              {result.base64 ? (
                <img
                  src={
                    result.base64.startsWith("data:")
                      ? result.base64
                      : `data:image/png;base64,${result.base64}`
                  }
                  alt="imagem"
                  className="max-w-xs mt-2"
                />
              ) : (
                <span className="text-gray-500">sem</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validador;
