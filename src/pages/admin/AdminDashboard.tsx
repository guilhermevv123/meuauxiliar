import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { clearAdminSession, getAdminSession } from "@/lib/adminSession";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

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
      // Ativos: clientes com VIP = 'sim' (aceita 'vip' ou 'VIP')
      const ativos = await countVipSim();
      // Em teste
      const teste = (await countFrom("clientes_meu_auxiliar", { column: "status", eq: "teste" }))
        || (await countFrom("clientes_meu_auxiliar", { column: "plano", eq: "teste" }));
      // VIP
      const vip = await countVipSim();
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
        { label: "Clientes Ativos", value: ativos },
        { label: "Não Renovaram", value: naoRenovaram },
        { label: "Faturamento Mensal (R$)", value: faturamento },
        { label: "Taxa de Conversão (%)", value: conversao },
        { label: "Cancelamentos", value: cancelados },
        { label: "Testes Grátis Ativos", value: teste },
        { label: "Vendas (mês)", value: vendasMes },
        { label: "Mensalidade atrasada", value: atrasada },
      ]);
    })();
  }, []);

  const logout = () => { clearAdminSession(); navigate("/admin"); };

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
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-x-2">
              <Button variant="outline">Revisar assinaturas irregulares</Button>
              <Button variant="outline">Contatar testes próximos do fim</Button>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Integre sua fonte de eventos aqui</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
