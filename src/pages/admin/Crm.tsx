import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Cliente = {
  id: number;
  nome?: string;
  nome_lead?: string;
  email?: string;
  vip?: string;
  VIP?: string;
  teste?: string;
  TESTE?: string;
  status?: string;
  plano?: string;
  session_id?: string;
  created_at?: string;
  teste_quant_dias?: number;
  mensalidade_status?: string;
  status_pagamento?: string;
  mensalidade_atrasada?: string;
};

import AdminLayout from "./AdminLayout";

import { Download, Check, X } from "lucide-react";

const Crm = () => {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<Cliente[]>([]);
  const [q, setQ] = useState("");
  const [filtroVip, setFiltroVip] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroAtraso, setFiltroAtraso] = useState<string>("todos");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("clientes_meu_auxiliar").select("*");
      if (!error && data) setDados(data as Cliente[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtrados = useMemo(() => {
    return dados.filter((c) => {
      const vipVal = (c.vip ?? c.VIP ?? "").toString().toLowerCase();
      const testeVal = (c.teste ?? c.TESTE ?? "").toString().toLowerCase();
      const atrasada = [c.mensalidade_status, c.status_pagamento, c.mensalidade_atrasada]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((v) => v === "atrasada" || v === "sim");
      const statusVal = (c.status ?? c.plano ?? "").toString().toLowerCase();
      
      const realName = c.nome_lead || c.nome || "";
      const phone = c.session_id || "";

      const matchQ = q
        ? [realName, c.email, c.status, c.plano, phone].some((v) => (v ?? "").toString().toLowerCase().includes(q.toLowerCase()))
        : true;
      const matchVip = filtroVip === "todos" ? true : filtroVip === "sim" ? vipVal === "sim" : vipVal !== "sim";
      const matchStatus = filtroStatus === "todos" ? true : filtroStatus === "teste" ? testeVal === "sim" : statusVal === filtroStatus;
      const matchAtraso = filtroAtraso === "todos" ? true : filtroAtraso === "sim" ? atrasada : !atrasada;
      return matchQ && matchVip && matchStatus && matchAtraso;
    });
  }, [dados, q, filtroVip, filtroStatus, filtroAtraso]);

  const exportCsv = () => {
    const header = "Nome,Email,Telefone,VIP,Teste,Plano,Mensalidade\n";
    const rows = filtrados.map(c => {
       const vipVal = (c.vip ?? c.VIP ?? "nao").toString();
       const testeVal = (c.teste ?? c.TESTE ?? "nao").toString();
       const planoVal = (c.plano ?? c.status ?? "indefinido").toString();
       const mensalidade = [c.mensalidade_status, c.status_pagamento, c.mensalidade_atrasada].find(v => v) || "ok";
       
       const realName = (c.nome_lead || c.nome || "-").replace(/,/g, ""); 
       return `${realName},${c.email || "-"},${c.session_id || "-"},${vipVal},${testeVal},${planoVal},${mensalidade}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + header + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crm_clientes.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Clientes (CRM)</h2>
            <Button variant="outline" onClick={exportCsv} className="gap-2">
                <Download className="h-4 w-4" /> Exportar
            </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="grid gap-3 md:grid-cols-4 pt-6">
            <Input placeholder="Buscar por nome, email, telefone..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={filtroVip} onValueChange={setFiltroVip}>
              <SelectTrigger><SelectValue placeholder="VIP" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">VIP: todos</SelectItem>
                <SelectItem value="sim">VIP: sim</SelectItem>
                <SelectItem value="nao">VIP: não</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger><SelectValue placeholder="Status/Teste" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Status: todos</SelectItem>
                <SelectItem value="teste">Em Teste</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroAtraso} onValueChange={setFiltroAtraso}>
              <SelectTrigger><SelectValue placeholder="Mensalidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Mensalidade: todos</SelectItem>
                <SelectItem value="sim">atrasada</SelectItem>
                <SelectItem value="nao">em dia</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center animate-pulse">Carregando dados...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border/40">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3">Dias Teste</th>
                      <th className="p-3">VIP</th>
                      <th className="p-3">Teste</th>
                      <th className="p-3">Plano</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((c) => {
                      const vipVal = (c.vip ?? c.VIP ?? "").toString().toLowerCase() === "sim";
                      const testeVal = (c.teste ?? c.TESTE ?? "").toString().toLowerCase() === "sim";
                      const planoVal = c.plano || c.status || "—";
                      
                      const realName = c.nome_lead || c.nome || "—";
                      const phone = c.session_id || "—";
                      const diasTeste = c.teste_quant_dias ?? "—";
                      const diasVip = c.vip_quant_dias ?? "—";

                      return (
                        <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{realName}</td>
                          <td className="p-3 text-muted-foreground">{c.email ?? "—"}</td>
                          <td className="p-3 whitespace-nowrap">{phone}</td>
                          <td className="p-3 whitespace-nowrap text-center text-xs">{diasTeste}</td>
                          <td className="p-3 whitespace-nowrap text-center text-xs">{diasVip}</td>
                          <td className="p-3">
                            {vipVal ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                                    VIP
                                </span>
                            ) : (
                                <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </td>
                           <td className="p-3">
                            {testeVal ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                                    Teste
                                </span>
                            ) : (
                                <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="capitalize text-xs font-medium bg-muted px-2 py-1 rounded">{planoVal}</span>
                          </td>
                          <td className="p-3 space-x-2">
                            <Button variant="ghost" size="sm">Ver</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Crm;
