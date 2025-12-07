import { supabase } from './supabaseClient';
import { getMonthRange } from './date';

export type FinanceRow = {
  id: number;
  session_id: string;
  categoria: string | null;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string | null;
  nome?: string | null;
  data_transacao: string; // ISO
  prazo?: string | null;
  prazo_data?: string | null;
  financiamento?: string | null;
  divida?: string | null;
  pago?: string | null;
  recebido?: string | null;
  a_pagar?: string | null;
  transacao_fixa?: string | null; // 'sim' ou 'nao'
};

export async function getDividaTotal(sessionId: string) {
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('divida_total')
    .select('id, session_id, valor_total, atualizado_em')
    .eq('session_id', sessionIdNum.toString())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function getDividaPrimeira(sessionId: string) {
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('divida_primeira')
    .select('id, session_id, primeira_parcela_em, valor_primeira')
    .eq('session_id', sessionIdNum.toString())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function upsertDividaTotal(sessionId: string, valorTotal: number) {
  const sessionIdNum = BigInt(sessionId);
  const payload = {
    session_id: sessionIdNum.toString(),
    valor_total: valorTotal,
    atualizado_em: new Date().toISOString(),
  } as any;
  const { error } = await supabase.from('divida_total').upsert(payload, { onConflict: 'session_id' });
  if (error) throw error;
}

export async function upsertDividaPrimeira(sessionId: string, primeiraDataIso: string | null, valorPrimeira: number | null) {
  const sessionIdNum = BigInt(sessionId);
  const payload = {
    session_id: sessionIdNum.toString(),
    primeira_parcela_em: primeiraDataIso,
    valor_primeira: valorPrimeira ?? 0,
  } as any;
  const { error } = await supabase.from('divida_primeira').upsert(payload, { onConflict: 'session_id' });
  if (error) throw error;
}

export type LembreteRow = {
  id: string;
  session_id: string;
  descricao: string;
  data_lembrete: string; // ISO
  criado_em: string;
  antecedencia: string | null;
};

export async function getFinanceiroByMonth(sessionId: string, year: number, month: number) {
  const { startIso, endIso } = getMonthRange(year, month);
  
  console.log('🔍 getFinanceiroByMonth - Params:', { 
    sessionId, 
    sessionIdType: typeof sessionId,
    sessionIdAsNumber: Number(sessionId),
    year, 
    month, 
    startIso, 
    endIso 
  });
  
  // Buscar usando BIGINT (número) - formato correto do Supabase
  const sessionIdNum = BigInt(sessionId);
  
  const { data, error } = await supabase
    .from('financeiro_clientes')
    .select('id, session_id, categoria, tipo, valor, descricao, data_transacao, pago, recebido, transacao_fixa')
    .eq('session_id', sessionIdNum.toString())
    .gte('data_transacao', startIso)
    .lte('data_transacao', endIso)
    .order('data_transacao', { ascending: false });
  
  console.log('✅ Resultado FINAL:', { 
    count: data?.length,
    data,
    error
  });
  
  if (error) {
    console.error('❌ Erro ao buscar financeiro:', error);
    throw error;
  }
  return (data ?? []) as FinanceRow[];
}

export async function deleteCategoria(id: string) {
  const { error } = await supabase.from('categorias_clientes').delete().eq('id', id);
  if (error) throw error;
}

export async function getLembretesByMonth(sessionId: string, year: number, month: number) {
  const { startIso, endIso } = getMonthRange(year, month);
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('lembretes')
    .select('id, session_id, descricao, data_lembrete, criado_em, antecedencia')
    .eq('session_id', sessionIdNum.toString())
    .gte('data_lembrete', startIso)
    .lte('data_lembrete', endIso)
    .order('data_lembrete', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LembreteRow[];
}

export async function getLembretesSemData(sessionId: string) {
  console.log('🔍 getLembretesSemData - Params:', { 
    sessionId, 
    sessionIdType: typeof sessionId,
    sessionIdAsNumber: Number(sessionId)
  });
  
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('lembretes')
    .select('id, session_id, descricao, criado_em, possui_data')
    .eq('session_id', sessionIdNum.toString())
    .eq('possui_data', 'nao')
    .order('criado_em', { ascending: false });
  
  console.log('✅ getLembretesSemData - Result:', { 
    count: data?.length,
    data,
    error
  });
  
  if (error) {
    console.error('❌ Erro ao buscar lembretes sem data:', error);
    throw error;
  }
  return data ?? [];
}

// Buscar dívidas e financiamentos da tabela financeiro
export async function getDividasFinanciamentos(sessionId: string) {
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('financeiro_clientes')
    .select('*')
    .eq('session_id', sessionIdNum.toString())
    .or('divida.eq.sim,financiamento.eq.sim')
    .order('data_transacao', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar dívidas/financiamentos:', error);
    throw error;
  }
  return (data ?? []) as FinanceRow[];
}

export async function addFinanceiro(params: {
  sessionId: string;
  type: 'receita' | 'despesa';
  category: string;
  value: number; // positivo
  description?: string | null;
  dateIso: string; // ISO
  transacao_fixa?: string;
}) {
  const { sessionId, type, category, value, description, dateIso, transacao_fixa } = params;
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('financeiro_clientes')
    .insert({
      session_id: sessionIdNum.toString(),
      categoria: category,
      tipo: type === 'receita' ? 'entrada' : 'saida',
      valor: value,
      descricao: description ?? null,
      data_transacao: dateIso,
      nome: null,
      transacao_fixa: transacao_fixa ?? 'nao',
    })
    .select('id, session_id, categoria, tipo, valor, descricao, data_transacao, transacao_fixa')
    .single();
  if (error) throw error;
  return data as FinanceRow;
}

export async function addLembrete(params: {
  sessionId: string;
  title: string;
  dateIso: string; // ISO da data/hora do lembrete
  antecedencia?: string | null;
}) {
  const { sessionId, title, dateIso, antecedencia } = params;
  const sessionIdNum = BigInt(sessionId);
  const { error } = await supabase
    .from('lembretes')
    .insert({
      session_id: sessionIdNum.toString(),
      descricao: title,
      data_lembrete: dateIso,
      antecedencia: antecedencia ?? null,
      possui_data: "sim"
    });
  if (error) throw error;
}

export async function addLembreteSemData(params: {
  sessionId: string;
  title: string;
}) {
  const { sessionId, title } = params;
  const sessionIdNum = BigInt(sessionId);
  const { error } = await supabase
    .from('lembretes')
    .insert({
      session_id: sessionIdNum.toString(),
      descricao: title,
      data_lembrete: null,
      antecedencia: null,
      possui_data: "nao"
    });
  if (error) throw error;
}

export async function updateLembreteSemData(id: string, title: string) {
  const { error } = await supabase
    .from('lembretes')
    .update({ descricao: title })
    .eq('id', id);
  if (error) throw error;
}

export async function updateFinanceiro(id: number, fields: Partial<{ category: string; type: 'receita' | 'despesa'; value: number; description: string | null; dateIso: string; pago?: string; recebido?: string; transacao_fixa?: string }>) {
  const patch: any = {};
  if (fields.category !== undefined) patch.categoria = fields.category;
  if (fields.type !== undefined) patch.tipo = fields.type === 'receita' ? 'entrada' : 'saida';
  if (fields.value !== undefined) patch.valor = fields.value;
  if (fields.description !== undefined) patch.descricao = fields.description;
  if (fields.dateIso !== undefined) patch.data_transacao = fields.dateIso;
  if (fields.pago !== undefined) patch.pago = fields.pago;
  if (fields.recebido !== undefined) patch.recebido = fields.recebido;
  if (fields.transacao_fixa !== undefined) patch.transacao_fixa = fields.transacao_fixa;
  const { error } = await supabase.from('financeiro_clientes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function togglePagoStatus(id: number, currentStatus: string | undefined) {
  const newStatus = currentStatus === 'sim' ? 'nao' : 'sim';
  const { error } = await supabase
    .from('financeiro_clientes')
    .update({ pago: newStatus })
    .eq('id', id);
  if (error) throw error;
  return newStatus;
}

export async function toggleRecebidoStatus(id: number, currentStatus: string | undefined) {
  const newStatus = currentStatus === 'sim' ? 'nao' : 'sim';
  const { error } = await supabase
    .from('financeiro_clientes')
    .update({ recebido: newStatus })
    .eq('id', id);
  if (error) throw error;
  return newStatus;
}

export async function deleteFinanceiro(id: number) {
  const { error } = await supabase.from('financeiro_clientes').delete().eq('id', id);
  if (error) throw error;
}

export async function updateLembrete(id: string, fields: Partial<{ title: string; dateIso: string; antecedencia: string | null }>) {
  const patch: any = {};
  if (fields.title !== undefined) patch.descricao = fields.title;
  if (fields.dateIso !== undefined) patch.data_lembrete = fields.dateIso;
  if (fields.antecedencia !== undefined) patch.antecedencia = fields.antecedencia;
  const { error } = await supabase.from('lembretes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteLembrete(id: string) {
  const { error } = await supabase.from('lembretes').delete().eq('id', id);
  if (error) throw error;
}

export async function cleanupOldLembretesSemData(sessionId: string) {
  const sessionIdNum = BigInt(sessionId);
  const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('lembretes')
    .delete()
    .eq('session_id', sessionIdNum.toString())
    .eq('possui_data', 'nao')
    .lt('criado_em', threshold);
  if (error) throw error;
}

export async function cleanupLembretesSemDataRpc() {
  const { error } = await supabase.rpc('cleanup_lembretes_sem_data');
  if (error && !String(error.message).includes('Could not find the function')) throw error;
}

export async function updateClienteSenha(email: string, newPassword: string) {
  const { error } = await supabase
    .from('clientes_meu_auxiliar')
    .update({ Senha: newPassword })
    .eq('email', email);
  if (error) throw error;
}

export async function getCategoriasByType(sessionId: string, type: 'receita' | 'despesa') {
  console.log('🏷️ getCategoriasByType:', { sessionId, type });
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('categorias_clientes')
    .select('id, name, type, is_default')
    .eq('session_id', sessionIdNum.toString())
    .eq('type', type)
    .order('name', { ascending: true });
  console.log('🏷️ getCategoriasByType - Result:', { data, error, count: data?.length });
  if (error) throw error;
  return (data ?? []) as { id: string; name: string; type: 'receita' | 'despesa'; is_default?: boolean }[];
}

export async function addCategoria(params: { sessionId: string; name: string; type: 'receita' | 'despesa' }) {
  const { sessionId, name, type } = params;
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('categorias_clientes')
    .insert({ session_id: sessionIdNum.toString(), name, type, is_default: false })
    .select('id, name, type, is_default')
    .single();
  if (error) throw error;
  return data as { id: string; name: string; type: 'receita' | 'despesa'; is_default?: boolean };
}

export async function seedCategoriasIfEmpty(sessionId: string, type: 'receita' | 'despesa') {
  const existing = await getCategoriasByType(sessionId, type);
  const hasDefaults = existing.some(c => c.is_default);
  
  if (!hasDefaults) {
    const defaults: string[] = type === 'despesa'
      ? ['Alimentação','Transporte','Casa','Saúde','Educação','Lazer','Utilidades','Outros']
      : ['Salário','Freelance','Investimentos','Reembolsos','Outros'];
    const sessionIdNum = BigInt(sessionId);
    const rows = defaults.map(name => ({ session_id: sessionIdNum.toString(), name, type, is_default: true }));
    const { error } = await supabase.from('categorias_clientes').insert(rows);
    if (error) throw error;
  }
  
  return getCategoriasByType(sessionId, type);
}

export async function getGastosPorCategoria(sessionId: string, year: number, month: number) {
  const { startIso, endIso } = getMonthRange(year, month);
  console.log('📊 getGastosPorCategoria:', { sessionId, year, month, startIso, endIso });
  const sessionIdNum = BigInt(sessionId);
  const { data, error } = await supabase
    .from('financeiro_clientes')
    .select('categoria, tipo, valor')
    .eq('session_id', sessionIdNum.toString())
    .gte('data_transacao', startIso)
    .lte('data_transacao', endIso);
  
  console.log('📊 getGastosPorCategoria - Result:', { data, error, count: data?.length });
  if (error) throw error;
  
  const gastos: Record<string, { despesas: number; receitas: number }> = {};
  
  (data ?? []).forEach((row: any) => {
    const cat = row.categoria || 'Sem Categoria';
    if (!gastos[cat]) {
      gastos[cat] = { despesas: 0, receitas: 0 };
    }
    if (row.tipo === 'saida') {
      gastos[cat].despesas += Math.abs(row.valor);
    } else {
      gastos[cat].receitas += Math.abs(row.valor);
    }
  });
  
  return gastos;
}
