
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Metric = { label: string; value: string | number };

export type AdminData = {
  metrics: Metric[];
  ranking: Array<{ nome?: string; email?: string; whatsapp?: string; usageScore: number; isVip?: boolean }>;
  series: number[];
  loading: boolean;
  setPeriod: (p: "semana" | "mes" | "ano") => void;
  setDataset: (d: "usuarios" | "vip" | "teste") => void;
  period: "semana" | "mes" | "ano";
  dataset: "usuarios" | "vip" | "teste";
};

async function countFrom(table: string, filter?: { column: string; eq: string | boolean }) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.eq as any);
  const { count } = await query;
  return count || 0;
}

async function countVipSim(): Promise<number> {
  // Using OR syntax directly in select is tricky for count only without fetching data if RLS allows.
  // We'll fetch count for both columns separate and max/sum? No, let's fetch IDs and de-duplicate in simple JS array if small enough,
  // or use the 'or' filter with head:true carefully.
  const { count } = await supabase.from("clientes_meu_auxiliar").select("*", { count: 'exact', head: true }).or('vip.eq.sim,VIP.eq.sim');
  return count || 0;
}

async function safeMonthlyVip() {
  try {
    const { data, error } = await supabase.from("clientes_meu_auxiliar").select("vip, VIP, created_at, vip_desde, vip_since");
    if (error || !data) return 0;
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const cnt = (data as any[]).filter((r) => {
      const v = (r.vip ?? r.VIP ?? "").toString().toLowerCase() === "sim";
      if (!v) return false;
      const dVip = r.vip_desde || r.vip_since;
      const dt = dVip ? new Date(dVip) : (r.created_at ? new Date(r.created_at) : null);
      if (!dt) return true;
      return dt.getMonth() === m && dt.getFullYear() === y;
    }).length;
    return cnt;
  } catch { return 0; }
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [ranking, setRanking] = useState<Array<{ nome?: string; email?: string; whatsapp?: string; usageScore: number; isVip?: boolean }>>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [period, setPeriod] = useState<"semana" | "mes" | "ano">("mes");
  const [dataset, setDataset] = useState<"usuarios" | "vip" | "teste">("usuarios");
  const [loading, setLoading] = useState(true);

  // Consolidated Fetch
  useEffect(() => {
    (async () => {
      try {
        if (metrics.length === 0) setLoading(true);
        // Fetch all clients with minimal risk of missing columns
        // We select * to see what we get, or just the ones we are reasonably sure of.
        // To be safe, let's fetch * and handle missing fields in JS.
        const { data: allClients, error } = await supabase
            .from("clientes_meu_auxiliar")
            .select("*");

        if (error) {
            console.error("Error fetching clients:", error);
        }

        const rows = allClients || [];

        // --- Calculate Metrics in JS ---
        const totalClientes = rows.length;
        
        // Robust VIP check: check both lowercase and potential case variants, and both columns if they exist
        const isVip = (r: any) => {
            const v1 = r.vip || r.VIP;
            return typeof v1 === 'string' && v1.toLowerCase() === 'sim';
        };
        
        const isTeste = (r: any) => {
             const t = r.teste || r.TESTE;
             return typeof t === 'string' && t.toLowerCase() === 'sim';
        };

        const vipCount = rows.filter(isVip).length;
        const testeCount = rows.filter(isTeste).length;

        // Monthly Sales (VIPs created/converted in current month)
        const now = new Date();
        const m = now.getMonth();
        const y = now.getFullYear();
        const vendasMes = rows.filter(r => {
             if (!isVip(r)) return false;
             // Try to find a valid date date
             const dStr = r.vip_desde || r.vip_since || r.created_at;
             if (!dStr) return false;
             const d = new Date(dStr);
             return d.getMonth() === m && d.getFullYear() === y;
        }).length;

        const naoRenovaram = rows.filter(r => !isVip(r) && !isTeste(r)).length;

        // Updated Pricing
        const faturamento = vipCount * 27.90;
        const potencial = testeCount * 27.90;
        const convBase = testeCount + vipCount;
        const conversao = convBase > 0 ? Math.round((vipCount / convBase) * 100) : 0;
        const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        setMetrics([
          { label: "Total de Usuários", value: totalClientes },
          { label: "Usuários em Teste", value: testeCount },
          { label: "VIP Total", value: vipCount },
          { label: "Vendas (mês)", value: vendasMes },
          { label: "Faturamento (MRR)", value: fmtBRL(faturamento) },
          { label: "Potencial Faturamento", value: fmtBRL(potencial) },
          { label: "Não Renovaram", value: naoRenovaram },
          { label: "Taxa de Conversão", value: `${conversao}%` },
        ]);

        // --- Series Data ---
        let buckets = 0;
        let start: Date = new Date();
        if (period === "semana") { buckets = 7; start = new Date(now); start.setDate(now.getDate() - 6); }
        if (period === "mes") { buckets = 30; start = new Date(now); start.setDate(now.getDate() - 29); }
        if (period === "ano") { buckets = 12; start = new Date(now.getFullYear(), now.getMonth() - 11, 1); }

        const points: number[] = Array(buckets).fill(0);
        
        rows.forEach((r) => {
            if (dataset === 'vip' && !isVip(r)) return;
            if (dataset === 'teste' && !isTeste(r)) return;

            const dStr = r.created_at || r.data; // Fallback
            if (!dStr) return;
            const dt = new Date(dStr);

            if (period === "ano") {
                const diffMonths = (dt.getFullYear() - start.getFullYear()) * 12 + (dt.getMonth() - start.getMonth());
                if (diffMonths >= 0 && diffMonths < buckets) points[diffMonths]++;
            } else {
                const dayIndex = Math.floor((+dt - +start) / (1000 * 60 * 60 * 24));
                if (dayIndex >= 0 && dayIndex < buckets) points[dayIndex]++;
            }
        });
        setSeries(points);

        // --- Ranking Logic ---
        // Fetch usage separate. 
        // Note: Ideally we'd optimize this but valid for <1000 users.
        const { data: finData } = await supabase.from("financeiro_clientes").select("session_id");
        const { data: lembData } = await supabase.from("lembretes").select("session_id");
        
        const usageMap: Record<string, number> = {};
        (finData || []).forEach((f: any) => { if(f.session_id) usageMap[f.session_id] = (usageMap[f.session_id] || 0) + 1; });
        (lembData || []).forEach((l: any) => { if(l.session_id) usageMap[l.session_id] = (usageMap[l.session_id] || 0) + 1; });

        const list = rows
            .map((r: any) => ({
                nome: r.nome_lead || r.nome, // User specified 'nome_lead'
                email: r.email,
                whatsapp: r.session_id, // User specified 'session_id' is the phone
                usageScore: usageMap[r.session_id] || 0,
                isVip: isVip(r)
            }))
            .sort((a, b) => b.usageScore - a.usageScore)
            .slice(0, 10);
            
        setRanking(list);
        setLoading(false);

      } catch (e) {
        console.error("Error fetching admin metrics", e);
        setLoading(false);
      }
    })();
  }, [period, dataset]);

  return { metrics, ranking, series, loading, setPeriod, setDataset, period, dataset };
}
