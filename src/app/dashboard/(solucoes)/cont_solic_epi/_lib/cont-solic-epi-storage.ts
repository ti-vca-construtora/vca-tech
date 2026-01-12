"use client";

import {
  loadEpiItemsFromDB,
  loadObrasFromDB,
  loadFuncoesFromDB,
  loadInventorySnapshotsFromDB,
  saveEpiItemsToDB,
  saveObrasToDB,
  saveFuncoesToDB,
  saveInventorySnapshotsToDB,
  addInventorySnapshotToDB,
} from './cont-solic-epi-supabase';

// Flag para controlar se usa Supabase ou localStorage
// Em produção, sempre use Supabase. Para desenvolvimento local sem Supabase, pode desabilitar
const USE_SUPABASE = typeof window !== 'undefined' && 
  process.env.NEXT_PUBLIC_SUPABASE_EPI_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY;

export type ObraEmpreendimentoTipo = "INCORPORADORA" | "LOTEAMENTO";

export type Obra = {
  id: string;
  name: string;
  state: string;
  city: string;
  empreendimentoType: ObraEmpreendimentoTipo;
};

export type FuncaoEpiItem = {
  epi: string;
  intervalMonths: number; // Intervalo de reposição em meses (ex: 3, 6, 12, 0.5)
  quantityPerEmployee: number; // Quantidade por funcionário projetado (geralmente 1, mas pode ser 2, 3, etc)
};

export type FuncaoEpiConfig = {
  id: string;
  name: string;
  items: FuncaoEpiItem[];
};

export type InventorySnapshot = {
  id: string;
  obraId: string;
  obraName: string;
  obraState: string;
  obraCity: string;
  obraType: ObraEmpreendimentoTipo;
  createdAt: string;
  createdBy: {
    id?: string;
    name?: string;
    email?: string;
  };
  epiCounts: Record<string, number>;
  functionCounts: Record<string, number>;
};

const EPI_ITEMS_KEY = "vca-tech:sesmt:epi-items:v1";
const OBRAS_KEY = "vca-tech:sesmt:epi-obras:v1";
const FUNCOES_KEY = "vca-tech:sesmt:epi-funcoes:v1";
const INVENTORY_SNAPSHOTS_KEY = "vca-tech:sesmt:epi-inventory-snapshots:v1";

export function normalizeText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

// Gerar UUID v4 válido
export function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function loadEpiItems(): string[] {
  try {
    const raw = localStorage.getItem(EPI_ITEMS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((v) => typeof v === "string")
      .map((v) => normalizeText(v))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function loadObras(): Obra[] {
  try {
    const raw = localStorage.getItem(OBRAS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((obj) => {
        const id = "id" in obj ? String(obj.id ?? genId()) : genId();
        const name = normalizeText(
          "name" in obj ? String(obj.name ?? "") : "",
        );
        const state = normalizeText(
          "state" in obj ? String(obj.state ?? "") : "",
        );
        const city = normalizeText(
          "city" in obj ? String(obj.city ?? "") : "",
        );
        const empreendimentoTypeRaw = normalizeText(
          "empreendimentoType" in obj
            ? String(obj.empreendimentoType ?? "")
            : "",
        );
        const safeType: ObraEmpreendimentoTipo =
          empreendimentoTypeRaw === "INCORPORADORA" ||
          empreendimentoTypeRaw === "LOTEAMENTO"
            ? empreendimentoTypeRaw
            : "INCORPORADORA";

        return {
          id,
          name,
          state,
          city,
          empreendimentoType: safeType,
        } as Obra;
      })
      .filter((o) => o.name);
  } catch {
    return [];
  }
}

export function saveObras(obras: Obra[]) {
  localStorage.setItem(OBRAS_KEY, JSON.stringify(obras));
}

export function loadFuncoes(): FuncaoEpiConfig[] {
  try {
    const raw = localStorage.getItem(FUNCOES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((obj) => {
        const id = "id" in obj ? String(obj.id ?? genId()) : genId();
        const name = normalizeText("name" in obj ? String(obj.name ?? "") : "");
        const itemsRaw =
          "items" in obj && Array.isArray(obj.items) ? (obj.items as unknown[]) : [];

        const items: FuncaoEpiItem[] = itemsRaw
          .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
          .map((i) => {
            const epi = normalizeText("epi" in i ? String(i.epi ?? "") : "");
            const intervalMonths = Number("intervalMonths" in i ? i.intervalMonths : 3);
            const quantityPerEmployee = Number("quantityPerEmployee" in i ? i.quantityPerEmployee : 1);

            return {
              epi,
              intervalMonths: Number.isFinite(intervalMonths) && intervalMonths > 0
                ? intervalMonths
                : 3,
              quantityPerEmployee: Number.isFinite(quantityPerEmployee) && quantityPerEmployee >= 0
                ? quantityPerEmployee
                : 1,
            };
          })
          .filter((i) => i.epi);

        return { id, name, items } as FuncaoEpiConfig;
      })
      .filter((f) => f.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export function loadInventorySnapshots(): InventorySnapshot[] {
  try {
    const raw = localStorage.getItem(INVENTORY_SNAPSHOTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((obj) => {
        const id = "id" in obj ? String(obj.id ?? genId()) : genId();
        const obraId = "obraId" in obj ? String(obj.obraId ?? "") : "";
        const obraName = normalizeText(
          "obraName" in obj ? String(obj.obraName ?? "") : "",
        );
        const obraState = normalizeText(
          "obraState" in obj ? String(obj.obraState ?? "") : "",
        );
        const obraCity = normalizeText(
          "obraCity" in obj ? String(obj.obraCity ?? "") : "",
        );
        const obraTypeRaw = normalizeText(
          "obraType" in obj ? String(obj.obraType ?? "") : "",
        );
        const obraType: ObraEmpreendimentoTipo =
          obraTypeRaw === "INCORPORADORA" || obraTypeRaw === "LOTEAMENTO"
            ? obraTypeRaw
            : "INCORPORADORA";

        const createdAt =
          "createdAt" in obj ? String(obj.createdAt ?? new Date().toISOString()) : new Date().toISOString();

        const createdByRaw =
          "createdBy" in obj && obj.createdBy && typeof obj.createdBy === "object"
            ? (obj.createdBy as Record<string, unknown>)
            : {};

        const createdBy = {
          id: "id" in createdByRaw ? String(createdByRaw.id ?? "") : undefined,
          name: "name" in createdByRaw ? String(createdByRaw.name ?? "") : undefined,
          email: "email" in createdByRaw ? String(createdByRaw.email ?? "") : undefined,
        };

        const epiCountsRaw =
          "epiCounts" in obj && obj.epiCounts && typeof obj.epiCounts === "object"
            ? (obj.epiCounts as Record<string, unknown>)
            : {};
        const functionCountsRaw =
          "functionCounts" in obj &&
          obj.functionCounts &&
          typeof obj.functionCounts === "object"
            ? (obj.functionCounts as Record<string, unknown>)
            : {};

        const epiCounts: Record<string, number> = {};
        for (const [k, v] of Object.entries(epiCountsRaw)) {
          const key = normalizeText(String(k));
          const qty = Number(v);
          if (!key) continue;
          if (!Number.isFinite(qty) || qty < 0) continue;
          epiCounts[key] = Math.floor(qty);
        }

        const functionCounts: Record<string, number> = {};
        for (const [k, v] of Object.entries(functionCountsRaw)) {
          const key = normalizeText(String(k));
          const qty = Number(v);
          if (!key) continue;
          if (!Number.isFinite(qty) || qty < 0) continue;
          functionCounts[key] = Math.floor(qty);
        }

        return {
          id,
          obraId,
          obraName,
          obraState,
          obraCity,
          obraType,
          createdAt,
          createdBy,
          epiCounts,
          functionCounts,
        } as InventorySnapshot;
      })
      .filter((s) => s.obraId && s.obraName)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function saveInventorySnapshots(snapshots: InventorySnapshot[]) {
  localStorage.setItem(INVENTORY_SNAPSHOTS_KEY, JSON.stringify(snapshots));
}

// ============================================
// WRAPPER FUNCTIONS - Use Supabase when available, fallback to localStorage
// ============================================

// EPI Items
export async function loadEpiItemsAsync(): Promise<string[]> {
  if (USE_SUPABASE) {
    return await loadEpiItemsFromDB();
  }
  return loadEpiItems();
}

export async function saveEpiItemsAsync(items: string[]): Promise<boolean> {
  if (USE_SUPABASE) {
    const success = await saveEpiItemsToDB(items);
    if (success) {
      // Also save to localStorage as backup
      localStorage.setItem(EPI_ITEMS_KEY, JSON.stringify(items));
    }
    return success;
  }
  localStorage.setItem(EPI_ITEMS_KEY, JSON.stringify(items));
  return true;
}

// Obras
export async function loadObrasAsync(): Promise<Obra[]> {
  if (USE_SUPABASE) {
    return await loadObrasFromDB();
  }
  return loadObras();
}

export async function saveObrasAsync(obras: Obra[]): Promise<boolean> {
  if (USE_SUPABASE) {
    const success = await saveObrasToDB(obras);
    if (success) {
      // Also save to localStorage as backup
      saveObras(obras);
    }
    return success;
  }
  saveObras(obras);
  return true;
}

// Funções
export async function loadFuncoesAsync(): Promise<FuncaoEpiConfig[]> {
  if (USE_SUPABASE) {
    return await loadFuncoesFromDB();
  }
  return loadFuncoes();
}

export async function saveFuncoesAsync(funcoes: FuncaoEpiConfig[]): Promise<boolean> {
  if (USE_SUPABASE) {
    const success = await saveFuncoesToDB(funcoes);
    if (success) {
      // Also save to localStorage as backup
      localStorage.setItem(FUNCOES_KEY, JSON.stringify(funcoes));
    }
    return success;
  }
  localStorage.setItem(FUNCOES_KEY, JSON.stringify(funcoes));
  return true;
}

// Inventory Snapshots
export async function loadInventorySnapshotsAsync(): Promise<InventorySnapshot[]> {
  if (USE_SUPABASE) {
    return await loadInventorySnapshotsFromDB();
  }
  return loadInventorySnapshots();
}

export async function saveInventorySnapshotsAsync(snapshots: InventorySnapshot[]): Promise<boolean> {
  if (USE_SUPABASE) {
    const success = await saveInventorySnapshotsToDB(snapshots);
    if (success) {
      // Also save to localStorage as backup
      saveInventorySnapshots(snapshots);
    }
    return success;
  }
  saveInventorySnapshots(snapshots);
  return true;
}

export async function addInventorySnapshotAsync(snapshot: InventorySnapshot): Promise<boolean> {
  if (USE_SUPABASE) {
    const success = await addInventorySnapshotToDB(snapshot);
    if (success) {
      // Also add to localStorage as backup
      const all = loadInventorySnapshots();
      all.push(snapshot);
      saveInventorySnapshots(all);
    }
    return success;
  }
  const all = loadInventorySnapshots();
  all.push(snapshot);
  saveInventorySnapshots(all);
  return true;
}
