"use client";

export type ObraEmpreendimentoTipo = "INCORPORADORA" | "LOTEAMENTO";

export type Obra = {
  id: string;
  name: string;
  state: string;
  city: string;
  empreendimentoType: ObraEmpreendimentoTipo;
};

export type FuncaoEpiIntervalUnit = "DIA" | "SEMANA" | "MES" | "ANO";

export type FuncaoEpiItem = {
  epi: string;
  intervalValue: number;
  intervalUnit: FuncaoEpiIntervalUnit;
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

export function genId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
            const intervalValue = Number("intervalValue" in i ? i.intervalValue : 1);
            const intervalUnitRaw = normalizeText(
              "intervalUnit" in i ? String(i.intervalUnit ?? "MES") : "MES",
            );
            const intervalUnit: FuncaoEpiIntervalUnit =
              intervalUnitRaw === "DIA" ||
              intervalUnitRaw === "SEMANA" ||
              intervalUnitRaw === "MES" ||
              intervalUnitRaw === "ANO"
                ? intervalUnitRaw
                : "MES";

            return {
              epi,
              intervalValue: Number.isFinite(intervalValue)
                ? Math.max(1, Math.ceil(intervalValue))
                : 1,
              intervalUnit,
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
