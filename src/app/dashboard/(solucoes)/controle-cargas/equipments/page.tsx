/* eslint-disable prettier/prettier */
"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env
  .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

const supabase: SupabaseClient = (typeof window !== "undefined" &&
  createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)) as SupabaseClient;

type Equipment = {
  id: number;
  empreendimento: string;
};

const Equipments = () => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Equipment | null>(null);
  const [editingName, setEditingName] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // note: table uses column name `equipment` (not `id`) for the PK
      const { data, error: supError } = await supabase
        .from("equipments")
        .select("equipment, empreendimento");

      if (supError) {
        setError(supError.message);
        setItems([]);
      } else {
        // normalize rows to Equipment[] where id comes from `equipment` column
        const rows = (data ?? []) as unknown[];
        const parsed: Equipment[] = rows.map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: Number(row.equipment),
            empreendimento: String(row.empreendimento ?? ""),
          };
        });
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

  const openEdit = (it: Equipment) => {
    setEditing(it);
    setEditingName(it.empreendimento);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const name = (editingName || "").toString().toUpperCase();
      const { error: upErr } = await supabase
        .from("equipments")
        .update({ empreendimento: name })
        // the primary key column is `equipment` (not `id`) in this table
        .eq("equipment", editing.id);

      if (upErr) {
        setError(upErr.message);
        return;
      }

      // success
      setEditing(null);
      setEditingName("");
      await fetchItems();
    } catch (err) {
      setError(String(err));
    }
  };

  const saveNew = async () => {
    if (!newName) return;
    try {
      const name = newName.toString().toUpperCase();
      await supabase.from("equipments").insert({ empreendimento: name });
      setAdding(false);
      setNewName("");
      await fetchItems();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="p-6 w-4/5">
      <h2 className="text-2xl font-semibold mb-4">Equipamentos</h2>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => setAdding(true)}
          >
            Adicionar novo equipamento
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
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Empreendimento</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-2">{it.id}</td>
                    <td className="p-2">{it.empreendimento}</td>
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
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      Nenhum equipamento cadastrado
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
          {/* removed dark overlay so background doesn't darken or block clicks */}
          <div className="bg-white rounded-lg p-6 z-60 w-96 pointer-events-auto">
            <h3 className="text-lg font-semibold mb-3">Editar equipamento</h3>
            <input
              className="border rounded px-2 py-1 w-full mb-3"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Nome do empreendimento"
            />
            <div className="flex justify-end gap-2">
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
          {/* removed dark overlay so background doesn't darken or block clicks */}
          <div className="bg-white rounded-lg p-6 z-60 w-96 pointer-events-auto">
            <h3 className="text-lg font-semibold mb-3">
              Adicionar equipamento
            </h3>
            <input
              className="border rounded px-2 py-1 w-full mb-3"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do empreendimento"
            />
            <div className="flex justify-end gap-2">
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
};

export default Equipments;
