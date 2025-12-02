import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { clearAdminSession, getAdminSession } from "@/lib/adminSession";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Metric = { label: string; value: number };

async function countFrom(table: string, filter?: { column: string; eq: string | boolean }) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.eq as any);
  const { count } = await query;
  return count || 0;
}

async function countVipSim(): Promise<number> {
  // Tenta coluna 'vip' e depois coluna 'VIP' (alguns esquemas usam caixa alta)
  const vipLower = await countFrom("clientes_meu_auxiliar", { column: "vip", eq: "sim" }).catch(() => 0);
  const vipUpper = await countFrom("clientes_meu_auxiliar", { column: "VIP", eq: "sim" }).catch(() => 0);
  const total = (vipLower || 0) + (vipUpper || 0);
  // Se nenhum dos dois existir, cai para total geral
  if (total === 0) {
    const fallbackTotal = await countFrom("clientes_meu_auxiliar");
    return fallbackTotal;
  }
  return total;
}

async function safeCountAny(table: string, candidates: Array<{ column: string; eq: string }>) {
  for (const c of candidates) {
    try {
      const v = await countFrom(table, { column: c.column, eq: c.eq });
      if (v > 0) return v;
    } catch {}
  }
  return 0;
}

async function safeMonthlyRevenue() {
  try {
    const { data, error } = await supabase
      .from("financeiro_clientes")
      .select("valor, created_at, data");
    if (error || !data) return 0;
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const sum = (data as any[])
      .filter((r) => {
        const dt = r.created_at ? new Date(r.created_at) : (r.data ? new Date(r.data) : null);
        if (!dt) return false;
        return dt.getMonth() === m && dt.getFullYear() === y;
      })
      .reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
    return Math.round(sum);
  } catch { return 0; }
}

async function safeMonthlyVip() {
  try {
    const { data, error } = await supabase.from("clientes_meu_auxiliar").select("vip, VIP, created_at");
    if (error || !data) return 0;
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const cnt = (data as any[]).filter((r) => {
      const v = (r.vip ?? r.VIP ?? "").toString().toLowerCase() === "sim";
      const dt = r.created_at ? new Date(r.created_at) : null;
      if (!v) return false;
      if (!dt) return true;
      return dt.getMonth() === m && dt.getFullYear() === y;
    }).length;
    return cnt;
  } catch { return 0; }
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const session = getAdminSession();
  const [metrics, setMetrics] = useState<Metric[]>([ 
    { label: "Usuários ativos", value: 0 },
    { label: "Em teste", value: 0 },
    { label: "VIP", value: 0 },
    { label: "Mensalidade atrasada", value: 0 },
  ]);

  useEffect(() => {
    (async () => {
      // Usuários (cadastro existente = 'sim')
      const usuarios = await countFrom("clientes_meu_auxiliar", { column: "cadastro existente", eq: "sim" });
      // Em teste (teste = 'sim')
      const teste = await countFrom("clientes_meu_auxiliar", { column: "teste", eq: "sim" });
      // VIP (vip = 'sim' ou 'VIP' = 'sim')
      const vip = (await countFrom("clientes_meu_auxiliar", { column: "vip", eq: "sim" }))
        || (await countFrom("clientes_meu_auxiliar", { column: "VIP", eq: "sim" }));
      // Atrasada
      const atrasada = (await countFrom("clientes_meu_auxiliar", { column: "mensalidade_status", eq: "atrasada" }))
        || (await countFrom("clientes_meu_auxiliar", { column: "status_pagamento", eq: "atrasada" }))
        || (await countFrom("clientes_meu_auxiliar", { column: "mensalidade_atrasada", eq: "sim" }));
      // Não renovaram
      const naoRenovaram = await safeCountAny("clientes_meu_auxiliar", [
        { column: "renovou", eq: "nao" },
        { column: "nao_renovaram", eq: "sim" },
        { column: "status", eq: "nao_renovaram" },
      ]);
      // Cancelamentos
      const cancelados = await safeCountAny("clientes_meu_auxiliar", [
        { column: "status", eq: "cancelado" },
        { column: "cancelado", eq: "sim" },
      ]);
      // Faturamento mensal
      const faturamento = await safeMonthlyRevenue();
      // Conversão
      const convBase = teste + vip;
      const conversao = convBase > 0 ? Math.round((vip / convBase) * 100) : 0;
      // Vendas no mês (aproximação: novos VIPs este mês)
      const vendasMes = await safeMonthlyVip();

      setMetrics([
        { label: "Usuários (cadastro existente)", value: usuarios },
        { label: "Não Renovaram", value: naoRenovaram },
        { label: "Faturamento Mensal (R$)", value: faturamento },
        { label: "Taxa de Conversão (%)", value: conversao },
        { label: "Cancelamentos", value: cancelados },
        { label: "Usuários em Teste", value: teste },
        { label: "VIP", value: vip },
        { label: "Vendas (mês)", value: vendasMes },
        { label: "Mensalidade atrasada", value: atrasada },
      ]);
    })();
  }, []);

  const logout = () => { clearAdminSession(); navigate("/admin"); };

  const [period, setPeriod] = useState<"semana"|"mes"|"ano">("mes");
  const [dataset, setDataset] = useState<"usuarios"|"vip"|"teste">("usuarios");
  const [series, setSeries] = useState<number[]>([]);
  const [ranking, setRanking] = useState<Array<{ nome?: string; email?: string; dias: number }>>([]);

  function pickDate(r: any): Date | null {
    const d = r.created_at || r.data || r.vip_desde || r.vip_since || r.assinatura_inicio || r.data_inicio;
    return d ? new Date(d) : null;
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clientes_meu_auxiliar")
        .select("id, nome, email, created_at, data, \"cadastro existente\", teste, vip, VIP, vip_desde, vip_since, assinatura_inicio, data_inicio");
      const rows: any[] = (data as any[]) || [];

      const now = new Date();
      let buckets = 0;
      let start: Date = new Date();
      if (period === "semana") { buckets = 7; start = new Date(now); start.setDate(now.getDate() - 6); }
      if (period === "mes") { buckets = 30; start = new Date(now); start.setDate(now.getDate() - 29); }
      if (period === "ano") { buckets = 12; start = new Date(now.getFullYear(), now.getMonth() - 11, 1); }

      const points: number[] = Array(buckets).fill(0);
      const isVip = (r: any) => ((r.vip ?? r.VIP ?? "").toString().toLowerCase() === "sim");
      const isTeste = (r: any) => ((r.teste ?? "").toString().toLowerCase() === "sim");
      const isUsuario = (r: any) => ((r["cadastro existente"] ?? "").toString().toLowerCase() === "sim");

      const filterFn = dataset === "vip" ? isVip : dataset === "teste" ? isTeste : isUsuario;

      rows.forEach((r) => {
        if (!filterFn(r)) return;
        const dt = pickDate(r);
        if (!dt) return;
        if (period === "ano") {
          const diffMonths = (dt.getFullYear() - start.getFullYear()) * 12 + (dt.getMonth() - start.getMonth());
          if (diffMonths >= 0 && diffMonths < buckets) points[diffMonths]++;
        } else {
          const dayIndex = Math.floor((+dt - +start) / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < buckets) points[dayIndex]++;
        }
      });
      setSeries(points);

      // Ranking VIP por mais tempo
      const vipRows = rows.filter(isVip);
      const list = vipRows.map((r) => {
        const dt = pickDate(r);
        const dias = dt ? Math.max(0, Math.floor((+now - +dt) / (1000 * 60 * 60 * 24))) : 0;
        return { nome: r.nome, email: r.email, dias };
      }).sort((a, b) => b.dias - a.dias).slice(0, 10);
      setRanking(list);
    })();
  }, [period, dataset]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Card key={m.label} className={`border ${i===0?"border-emerald-400":"border-border/50"} shadow-sm`}>
              <CardHeader>
                <CardTitle>{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold">{m.value}</div>
                <p className="text-xs text-muted-foreground mt-2">Mês atual</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Crescimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={period} onValueChange={(v)=>setPeriod(v as any)}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Período" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Semana</SelectItem>
                    <SelectItem value="mes">Mês</SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dataset} onValueChange={(v)=>setDataset(v as any)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Dataset" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuarios">Usuários</SelectItem>
                    <SelectItem value="teste">Teste</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Line chart simples em SVG */}
              <svg viewBox="0 0 600 200" className="w-full h-[200px]">
                <rect x="0" y="0" width="600" height="200" fill="transparent" />
                {(() => {
                  const max = Math.max(1, ...series);
                  const stepX = series.length > 1 ? 600 / (series.length - 1) : 600;
                  const pts = series.map((v, i) => {
                    const x = i * stepX;
                    const y = 190 - (v / max) * 180;
                    return `${x},${y}`;
                  }).join(" ");
                  return (
                    <>
                      <polyline points={pts} fill="none" stroke="url(#gline)" strokeWidth="3" />
                      <defs>
                        <linearGradient id="gline" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#9333ea" />
                        </linearGradient>
                      </defs>
                    </>
                  );
                })()}
              </svg>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Ranking VIP (mais tempo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ranking.map((r, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{idx+1}. {r.nome ?? r.email ?? "—"}</span>
                    <span className="text-muted-foreground">{r.dias} dias</span>
                  </div>
                ))}
                {ranking.length === 0 && <p className="text-sm text-muted-foreground">Sem VIPs para ranquear</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
