import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Cliente = {
  id: number;
  nome?: string;
  email?: string;
  vip?: string;
  VIP?: string;
  status?: string;
  plano?: string;
  mensalidade_status?: string;
  status_pagamento?: string;
  mensalidade_atrasada?: string;
};

import AdminLayout from "./AdminLayout";

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
      const atrasada = [c.mensalidade_status, c.status_pagamento, c.mensalidade_atrasada]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((v) => v === "atrasada" || v === "sim");
      const statusVal = (c.status ?? c.plano ?? "").toString().toLowerCase();
      const matchQ = q
        ? [c.nome, c.email, c.status, c.plano].some((v) => (v ?? "").toString().toLowerCase().includes(q.toLowerCase()))
        : true;
      const matchVip = filtroVip === "todos" ? true : filtroVip === "sim" ? vipVal === "sim" : vipVal !== "sim";
      const matchStatus = filtroStatus === "todos" ? true : statusVal === filtroStatus;
      const matchAtraso = filtroAtraso === "todos" ? true : filtroAtraso === "sim" ? atrasada : !atrasada;
      return matchQ && matchVip && matchStatus && matchAtraso;
    });
  }, [dados, q, filtroVip, filtroStatus, filtroAtraso]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Mini CRM</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Buscar por nome, email, status" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={filtroVip} onValueChange={setFiltroVip}>
              <SelectTrigger><SelectValue placeholder="VIP" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">VIP: todos</SelectItem>
                <SelectItem value="sim">VIP: sim</SelectItem>
                <SelectItem value="nao">VIP: não</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger><SelectValue placeholder="Status/Plano" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Status: todos</SelectItem>
                <SelectItem value="teste">teste</SelectItem>
                <SelectItem value="vip">vip</SelectItem>
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
              <div className="p-8 text-center">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border/40">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">VIP</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Mensalidade</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((c) => {
                      const vipVal = (c.vip ?? c.VIP ?? "").toString();
                      const statusVal = (c.status ?? c.plano ?? "").toString();
                      const mensalidade = [c.mensalidade_status, c.status_pagamento, c.mensalidade_atrasada]
                        .map((v) => (v ?? "").toString())
                        .find((v) => v);
                      return (
                        <tr key={c.id} className="border-b border-border/30">
                          <td className="p-3">{c.nome ?? "—"}</td>
                          <td className="p-3">{c.email ?? "—"}</td>
                          <td className="p-3">{vipVal || "—"}</td>
                          <td className="p-3">{statusVal || "—"}</td>
                          <td className="p-3">{mensalidade || "—"}</td>
                          <td className="p-3 space-x-2">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button size="sm">Editar</Button>
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
