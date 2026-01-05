/* eslint-disable prettier/prettier */
"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env
  .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

const supabase: SupabaseClient = (typeof window !== "undefined" &&
  createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)) as SupabaseClient;

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

export default function TiposCartoes() {
  const [items, setItems] = useState<TripType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [editing, setEditing] = useState<TripType | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [editingNumber, setEditingNumber] = useState("");
  const [editingPrice, setEditingPrice] = useState("");

  const formatBRL = (value: number) => {
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    } catch {
      return `R$ ${value}`;
    }
  };

  // parses formatted BRL string (or any text) into number (digits as cents)
  const parseBRLToNumber = (value: string) => {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) return NaN;
    return Number(digits) / 100;
  };

  const formatBRLFromInput = (value: string) => {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) return "";
    const numeric = Number(digits) / 100;
    return formatBRL(numeric);
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supError } = await supabase
        .from("trip_types")
        .select("id, description, number, price")
        .order("number", { ascending: true });

      if (supError) {
        setError(supError.message);
        setItems([]);
      } else {
        const raw = (data ?? []) as RawTripType[];
        const parsed: TripType[] = raw.map((r, i) => ({
          id: Number(r.id ?? i),
          description: String(r.description ?? ""),
          number: Number(r.number ?? 0),
          price: Number(r.price ?? 0),
        }));
        setItems(parsed);
      }
    } catch (err) {
      setError(String(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (it: TripType) => {
    setEditing(it);
    setEditingDescription(it.description);
    setEditingNumber(String(it.number));
    setEditingPrice(formatBRL(it.price));
  };

  const saveEdit = async () => {
    if (!editing) return;

    const description = editingDescription.trim();
    const number = Number(editingNumber);
    const price = parseBRLToNumber(editingPrice);

    if (!description) {
      alert("Informe a descrição");
      return;
    }
    if (!Number.isFinite(number)) {
      alert("Informe um número válido");
      return;
    }
    if (!Number.isFinite(price)) {
      alert("Informe um preço válido");
      return;
    }

    const duplicated = items.some(
      (x) => x.number === number && x.id !== editing.id,
    );
    if (duplicated) {
      alert("Já existe um tipo cadastrado com esse número");
      return;
    }

    try {
      const { error: upErr } = await supabase
        .from("trip_types")
        .update({ description, number, price })
        .eq("id", editing.id);

      if (upErr) {
        setError(upErr.message);
        return;
      }

      setEditing(null);
      setEditingDescription("");
      setEditingNumber("");
      setEditingPrice("");
      await fetchItems();
    } catch (err) {
      setError(String(err));
    }
  };

  const saveNew = async () => {
    const description = newDescription.trim();
    const number = Number(newNumber);
    const price = parseBRLToNumber(newPrice);

    if (!description) {
      alert("Informe a descrição");
      return;
    }
    if (!Number.isFinite(number)) {
      alert("Informe um número válido");
      return;
    }
    if (!Number.isFinite(price)) {
      alert("Informe um preço válido");
      return;
    }

    const duplicated = items.some((x) => x.number === number);
    if (duplicated) {
      alert("Já existe um tipo cadastrado com esse número");
      return;
    }

    try {
      const { error: insErr } = await supabase
        .from("trip_types")
        .insert({ description, number, price });

      if (insErr) {
        setError(insErr.message);
        return;
      }

      setAdding(false);
      setNewDescription("");
      setNewNumber("");
      setNewPrice("");
      await fetchItems();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="p-6 w-4/5">
      <h2 className="text-2xl font-semibold mb-4">Tipos de cartões</h2>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={fetchItems}
          >
            Atualizar
          </button>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => setAdding(true)}
          >
            Adicionar tipo
          </button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div className="text-red-600">Erro: {error}</div>
      ) : (
        <div className="border rounded">
          <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Número</th>
                  <th className="p-2 text-left">Descrição</th>
                  <th className="p-2 text-left">Preço</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-2">{it.number}</td>
                    <td className="p-2">{it.description}</td>
                    <td className="p-2">{formatBRL(it.price)}</td>
                    <td className="p-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => openEdit(it)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Nenhum tipo cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 z-60 w-96 pointer-events-auto">
            <h3 className="text-lg font-semibold mb-3">Editar tipo</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="border rounded px-2 py-1 w-full"
                value={editingNumber}
                onChange={(e) => setEditingNumber(e.target.value)}
                placeholder="Número"
                inputMode="numeric"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder="Descrição"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={editingPrice}
                onChange={(e) => setEditingPrice(formatBRLFromInput(e.target.value))}
                placeholder="Preço"
                inputMode="decimal"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-200 px-3 py-1 rounded"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={saveEdit}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {adding && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 z-60 w-96 pointer-events-auto">
            <h3 className="text-lg font-semibold mb-3">Adicionar tipo</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="border rounded px-2 py-1 w-full"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Número"
                inputMode="numeric"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descrição"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={newPrice}
                onChange={(e) => setNewPrice(formatBRLFromInput(e.target.value))}
                placeholder="Preço"
                inputMode="decimal"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-200 px-3 py-1 rounded"
                onClick={() => setAdding(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={saveNew}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
