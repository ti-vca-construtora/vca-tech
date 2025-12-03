/* eslint-disable @next/next/no-img-element */
/* eslint-disable prettier/prettier */
"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
// using native <img> for base64 previews to avoid required width/height from next/image
import { useEffect, useState } from "react";
import { FaQrcode } from "react-icons/fa6";
import { IoMdCamera } from "react-icons/io";

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
  auth: string | null;
  data: string | null; // timestamp string
  base64: string | null;
};

const Dashboard = () => {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [obra, setObra] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState(""); // yyyy-mm-dd

  // image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAuth, setSelectedAuth] = useState<string | null>(null);
  const [obrasOptions, setObrasOptions] = useState<string[]>([]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    // adjust stored timestamp by -3 hours to compensate timezone difference
    d.setHours(d.getHours() - 3);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(
      // eslint-disable-next-line prettier/prettier
      d.getHours(),
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const downloadReport = () => {
    const now = new Date();
    const generated = `${String(now.getDate()).padStart(2, "0")}/${String(
      // eslint-disable-next-line prettier/prettier
      now.getMonth() + 1,
    ).padStart(
      2,
      // eslint-disable-next-line prettier/prettier
      "0",
    )}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, "0")}:${String(
      // eslint-disable-next-line prettier/prettier
      now.getMinutes(),
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const filters = [
      `Nome: ${nome || "Todos"}`,
      `CPF: ${cpf || "Todos"}`,
      `Obra: ${obra || "Todas as obras"}`,
      `Data de: ${dateFrom || "---"}`,
      `Data até: ${dateTo || "---"}`,
    ];

    const rowsHtml = rows
      .map(
        (r) => `
        <tr>
          <td style="padding:6px;border:1px solid #ddd">${r.nome ?? ""}</td>
          <td style="padding:6px;border:1px solid #ddd">${r.cpf ?? ""}</td>
          <td style="padding:6px;border:1px solid #ddd">${r.obra ?? ""}</td>
          <td style="padding:6px;border:1px solid #ddd">${formatDate(r.data)}</td>
          <td style="padding:6px;border:1px solid #ddd">${r.auth ?? ""}</td>
        </tr>`,
      )
      .join("");

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Relatório</title>
      </head>
      <body>
        <h2>Relatório - Controle de Cargas</h2>
        <p>Gerada em: <strong>${generated}</strong></p>
        <p>Filtros: ${filters.join(" | ")}</p>
        <p>Registros: <strong>${rows.length}</strong></p>
        <table style="border-collapse:collapse;width:100%;margin-top:12px">
          <thead>
            <tr>
              <th style="padding:6px;border:1px solid #ddd">Nome</th>
              <th style="padding:6px;border:1px solid #ddd">CPF</th>
              <th style="padding:6px;border:1px solid #ddd">Obra</th>
              <th style="padding:6px;border:1px solid #ddd">Data</th>
              <th style="padding:6px;border:1px solid #ddd">Auth</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>`;

    const win = window.open("", "_blank");
    if (!win) {
      alert(
        "Não foi possível abrir a janela — verifique bloqueador de popups.",
      );
      return;
    }
    win.document.open();
    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Relatório</title>
          <style>body{font-family:Arial,Helvetica,sans-serif;color:#111} table{border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    // delay print slightly to allow browser to layout
    setTimeout(() => {
      try {
        win.print();
      } catch (e) {
        // ignore
      }
    }, 300);
    // optional: close after print
    setTimeout(() => {
      try {
        win.close();
      } catch (e) {
        // ignore
      }
    }, 500);
  };

  const buildQuery = () => {
    let query = supabase
      .from("submits")
      .select("*", { count: "exact" })
      .order("id", { ascending: false });

    if (nome.trim()) {
      query = query.ilike("nome", `%${nome.trim()}%`);
    }
    if (cpf.trim()) {
      query = query.ilike("cpf", `%${cpf.trim()}%`);
    }
    if (obra.trim()) {
      // exact match for selected obra
      query = query.eq("obra", obra.trim());
    }
    if (dateFrom) {
      const startISO = new Date(dateFrom).toISOString();
      query = query.gte("data", startISO);
    }
    if (dateTo) {
      // include whole day for dateTo
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query = query.lte("data", end.toISOString());
    }

    return query;
  };

  const fetchRows = async () => {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      setError(
        // eslint-disable-next-line prettier/prettier
        "Supabase env vars não configuradas: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      );
      console.error("Supabase env vars missing", {
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = buildQuery();
      const { data, count: returnedCount, error: supError } = await query;
      console.log("Supabase query", { data, returnedCount, supError });

      if (supError) {
        setError(supError.message);
        setRows([]);
      } else {
        setRows((data as Submission[]) || []);
      }
    } catch (err) {
      setError(String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchRows();

    // fetch unique obras
    const fetchObras = async () => {
      try {
        const { data } = await supabase.from("submits").select("obra");
        const set = new Set<string>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data || []).forEach((row: any) => {
          if (row.obra) set.add(row.obra);
        });
        setObrasOptions(Array.from(set));
      } catch (err) {
        // ignore
      }
    };
    fetchObras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call fetch when pressing "Filtrar"
  const handleFilter = async (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchRows();
  };

  return (
    <div className="size-full flex flex-col p-6">
      <h1 className="text-xl font-semibold mb-4">
        Controle de Prestação de Serviços
      </h1>

      <form
        onSubmit={handleFilter}
        className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1 bg-white w-full"
          value={obra}
          onChange={(e) => setObra(e.target.value)}
        >
          <option value="">Todas as obras</option>
          {obrasOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="Data de"
        />
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="Data até"
        />

        <div className="md:col-span-5 flex gap-2 mt-2 items-center justify-between">
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:opacity-90"
            >
              Filtrar
            </button>
            <button
              type="button"
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={() => {
                setNome("");
                setCpf("");
                setObra("");
                setDateFrom("");
                setDateTo("");
                fetchRows();
              }}
            >
              Limpar
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={downloadReport}
            >
              Baixar relatório
            </button>
            <div className="text-sm bg-slate-900 text-white px-2 py-1 rounded">
              Registros realizados: {rows.length}
            </div>
          </div>
        </div>
      </form>

      <div className="mb-2">
        {loading ? (
          <span>Carregando...</span>
        ) : error ? (
          <span className="text-red-600">Erro: {error}</span>
        ) : null}
      </div>

      <div className="border rounded">
        <div className="overflow-auto" style={{ maxHeight: "65vh" }}>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">CPF</th>
                <th className="p-2 text-left">Obra</th>
                <th className="p-2 text-left">Data/Hora</th>
                <th className="p-2 text-left">Imagem</th>
                <th className="p-2 text-left">Autenticador</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.nome}</td>
                  <td className="p-2">{r.cpf}</td>
                  <td className="p-2">{r.obra}</td>
                  <td className="p-2">{formatDate(r.data)}</td>
                  <td className="p-2 text-center">
                    {r.base64 ? (
                      <button
                        title="Ver imagem"
                        className="p-0"
                        onClick={() => setSelectedImage(r.base64)}
                      >
                        <IoMdCamera size={20} />
                      </button>
                    ) : (
                      <span className="text-gray-500">sem</span>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {r.auth ? (
                      <button
                        title="Ver autenticador"
                        className="p-0"
                        onClick={() => setSelectedAuth(r.auth ?? null)}
                      >
                        <FaQrcode size={18} />
                      </button>
                    ) : (
                      <span className="text-gray-500">sem</span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal for base64 image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded shadow-lg max-w-full max-h-full overflow-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => setSelectedImage(null)}
              >
                Fechar
              </button>
            </div>
            {/* assume png/jpeg; if stored with mime prefix you can use it directly */}
            <img
              src={
                selectedImage.startsWith("data:")
                  ? selectedImage
                  : `data:image/png;base64,${selectedImage}`
              }
              alt="submission"
              className="max-w-[80vw] max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* modal for auth uuid */}
      {selectedAuth && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAuth(null)}
        >
          <div
            className="bg-white rounded shadow-lg max-w-md w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => setSelectedAuth(null)}
              >
                Fechar
              </button>
            </div>
            <h3 className="font-semibold mb-2">Autenticador (UUID)</h3>
            <pre className="break-all bg-gray-50 p-3 rounded">
              {selectedAuth}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
