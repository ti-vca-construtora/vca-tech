"use client";

import { supabaseEpi as supabase } from '@/lib/supabase-epi';
import type {
  Obra,
  FuncaoEpiConfig,
  InventorySnapshot,
  ObraEmpreendimentoTipo,
} from './cont-solic-epi-storage';
import { genId, normalizeText } from './cont-solic-epi-storage';

// ============= EPI Items =============

export async function loadEpiItemsFromDB(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('epi_items')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading EPI items:', error);
      return [];
    }

    return (data || []).map((item: { name: string }) => item.name);
  } catch (error) {
    console.error('Error loading EPI items:', error);
    return [];
  }
}

export async function saveEpiItemsToDB(items: string[]): Promise<boolean> {
  try {
    // Delete all existing items
    await supabase.from('epi_items').delete().neq('id', '');

    // Insert new items
    const dataToInsert = items.map(name => ({
      id: genId(),
      name: normalizeText(name),
    }));

    const { error } = await supabase
      .from('epi_items')
      .insert(dataToInsert as any);

    if (error) {
      console.error('Error saving EPI items:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving EPI items:', error);
    return false;
  }
}

// ============= Obras =============

export async function loadObrasFromDB(): Promise<Obra[]> {
  try {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading obras:', error);
      return [];
    }

    console.log('Obras carregadas do Supabase:', data);

    return (data || []).map((obra: any) => {
      console.log('Processando obra:', obra);
      return {
        id: obra.id,
        name: obra.name,
        state: obra.state || obra.STATE || '',
        city: obra.city || obra.CITY || '',
        empreendimentoType: obra.empreendimento_type || obra.EMPREENDIMENTO_TYPE || 'INCORPORACAO',
      };
    });
  } catch (error) {
    console.error('Error loading obras:', error);
    return [];
  }
}

export async function saveObrasToDB(obras: Obra[]): Promise<boolean> {
  try {
    // Delete all existing obras
    await supabase.from('obras').delete().neq('id', '');

    // Insert new obras
    const dataToInsert = obras.map(obra => ({
      id: obra.id,
      name: obra.name,
      state: obra.state,
      city: obra.city,
      empreendimento_type: obra.empreendimentoType,
    }));

    const { error } = await supabase
      .from('obras')
      .insert(dataToInsert as any);

    if (error) {
      console.error('Error saving obras:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving obras:', error);
    return false;
  }
}

// ============= Funções =============

export async function loadFuncoesFromDB(empreendimentoTipo?: 'INCORPORACAO' | 'LOTEAMENTO'): Promise<FuncaoEpiConfig[]> {
  try {
    const { data: funcoesData, error: funcoesError } = await supabase
      .from('funcoes')
      .select('*')
      .order('name', { ascending: true });

    if (funcoesError) {
      console.error('Error loading funcoes:', funcoesError);
      return [];
    }

    // Query funcao_epi_items com filtro opcional de tipo
    let itemsQuery = supabase.from('funcao_epi_items').select('*');
    
    if (empreendimentoTipo) {
      itemsQuery = itemsQuery.eq('empreendimento_tipo', empreendimentoTipo);
    }

    const { data: itemsData, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error loading funcao items:', itemsError);
      return [];
    }

    return (funcoesData || []).map((funcao: any) => ({
      id: funcao.id,
      name: funcao.name,
      items: (itemsData || [])
        .filter((item: any) => item.funcao_id === funcao.id)
        .map((item: any) => ({
          epi: item.epi,
          intervalMonths: Number(item.interval_months),
          quantityPerEmployee: Number(item.quantity_per_employee),
          empreendimentoTipo: item.empreendimento_tipo,
        })),
      empreendimentoTipo,
    }));
  } catch (error) {
    console.error('Error loading funcoes:', error);
    return [];
  }
}

export async function saveFuncoesToDB(funcoes: FuncaoEpiConfig[], empreendimentoTipo: 'INCORPORACAO' | 'LOTEAMENTO' = 'INCORPORACAO'): Promise<boolean> {
  try {
    // Delete existing items for this tipo only
    await supabase
      .from('funcao_epi_items')
      .delete()
      .eq('empreendimento_tipo', empreendimentoTipo);

    // Get existing funcoes or create new ones
    const { data: existingFuncoes } = await supabase
      .from('funcoes')
      .select('id, name');

    const existingFuncoesMap = new Map(
      (existingFuncoes || []).map((f: any) => [f.name, f.id])
    );

    // Insert only new funcoes
    const newFuncoes = funcoes
      .filter(funcao => !existingFuncoesMap.has(funcao.name))
      .map(funcao => ({
        id: funcao.id,
        name: funcao.name,
      }));

    if (newFuncoes.length > 0) {
      const { error: funcoesError } = await supabase
        .from('funcoes')
        .insert(newFuncoes as any);

      if (funcoesError) {
        console.error('Error saving funcoes:', funcoesError);
        return false;
      }
    }

    // Insert funcao items with empreendimento_tipo
    const itemsData = funcoes.flatMap(funcao =>
      funcao.items.map(item => ({
        id: genId(),
        funcao_id: funcao.id,
        epi: item.epi,
        interval_months: item.intervalMonths,
        quantity_per_employee: item.quantityPerEmployee,
        empreendimento_tipo: item.empreendimentoTipo || empreendimentoTipo,
      }))
    );

    if (itemsData.length > 0) {
      const { error: itemsError } = await supabase
        .from('funcao_epi_items')
        .insert(itemsData as any);

      if (itemsError) {
        console.error('Error saving funcao items:', itemsError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving funcoes:', error);
    return false;
  }
}

// ============= Inventory Snapshots =============

export async function loadInventorySnapshotsFromDB(): Promise<InventorySnapshot[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_snapshots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading inventory snapshots:', error);
      return [];
    }

    return (data || []).map((snapshot: any) => ({
      id: snapshot.id,
      obraId: snapshot.obra_id,
      obraName: snapshot.obra_name,
      obraState: snapshot.obra_state,
      obraCity: snapshot.obra_city,
      obraType: snapshot.obra_type as ObraEmpreendimentoTipo,
      createdAt: snapshot.created_at,
      createdBy: {
        id: snapshot.created_by_id ?? undefined,
        name: snapshot.created_by_name ?? undefined,
        email: snapshot.created_by_email ?? undefined,
      },
      epiCounts: snapshot.epi_counts as Record<string, number>,
      functionCounts: snapshot.function_counts as Record<string, number>,
    }));
  } catch (error) {
    console.error('Error loading inventory snapshots:', error);
    return [];
  }
}

export async function saveInventorySnapshotsToDB(snapshots: InventorySnapshot[]): Promise<boolean> {
  try {
    // Delete all existing snapshots
    await supabase.from('inventory_snapshots').delete().neq('id', '');

    // Insert new snapshots
    const dataToInsert = snapshots.map(snapshot => ({
      id: snapshot.id,
      obra_id: snapshot.obraId,
      obra_name: snapshot.obraName,
      obra_state: snapshot.obraState,
      obra_city: snapshot.obraCity,
      obra_type: snapshot.obraType,
      created_at: snapshot.createdAt,
      created_by_id: snapshot.createdBy?.id ?? null,
      created_by_name: snapshot.createdBy?.name ?? null,
      created_by_email: snapshot.createdBy?.email ?? null,
      epi_counts: snapshot.epiCounts,
      function_counts: snapshot.functionCounts,
    }));

    const { error } = await supabase
      .from('inventory_snapshots')
      .insert(dataToInsert as any);

    if (error) {
      console.error('Error saving inventory snapshots:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving inventory snapshots:', error);
    return false;
  }
}

export async function addInventorySnapshotToDB(snapshot: InventorySnapshot): Promise<boolean> {
  try {
    // Validar que obra_type não é null/undefined
    if (!snapshot.obraType || !['INCORPORADORA', 'LOTEAMENTO'].includes(snapshot.obraType)) {
      console.error('Invalid obra_type:', snapshot.obraType);
      return false;
    }

    const dataToInsert = {
      id: snapshot.id,
      obra_id: snapshot.obraId,
      obra_name: snapshot.obraName,
      obra_state: snapshot.obraState,
      obra_city: snapshot.obraCity,
      obra_type: snapshot.obraType,
      created_at: snapshot.createdAt,
      created_by_id: snapshot.createdBy?.id ?? null,
      created_by_name: snapshot.createdBy?.name ?? null,
      created_by_email: snapshot.createdBy?.email ?? null,
      epi_counts: snapshot.epiCounts,
      function_counts: snapshot.functionCounts,
    };

    console.log('Tentando inserir snapshot:', dataToInsert);

    const { error, data } = await supabase
      .from('inventory_snapshots')
      .insert(dataToInsert as any)
      .select();

    if (error) {
      console.error('Error adding inventory snapshot:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('Snapshot inserido com sucesso:', data);
    return true;
  } catch (error) {
    console.error('Error adding inventory snapshot:', error);
    return false;
  }
}

// ============= EPI Requests/Solicitations =============

export async function loadEpiRequestsFromDB(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('epi_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading EPI requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading EPI requests:', error);
    return [];
  }
}

export async function saveEpiRequestToDB(requestData: any): Promise<boolean> {
  try {
    const insertData = {
      id: requestData.id,
      obra_id: requestData.obraId,
      obra_name: requestData.obraName,
      obra_type: requestData.obraType,
      collected_data: {
        epiCounts: requestData.epiCounts,
        currentFunctionCounts: requestData.currentFunctionCounts,
        projectedFunctionCounts: requestData.projectedFunctionCounts,
      },
      request_data: requestData.functionRequests,
      total_summary: requestData.totalSummary,
      created_at: requestData.createdAt,
      created_by_id: requestData.createdBy?.id ?? null,
      created_by_name: requestData.createdBy?.name ?? null,
      status: 'PENDING',
    };

    const { error } = await supabase
      .from('epi_requests')
      .insert(insertData as any);

    if (error) {
      console.error('Error saving EPI request:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving EPI request:', error);
    return false;
  }
}
