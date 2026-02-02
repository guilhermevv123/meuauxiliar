import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "./AdminLayout";
import { Download, Calendar, Users } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

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
};

const NewUsers = () => {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<Cliente[]>([]);
  const [q, setQ] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("hoje");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes_meu_auxiliar")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) setDados(data as Cliente[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtrados = useMemo(() => {
    return dados.filter((c) => {
      // Filtro de busca
      const realName = c.nome_lead || c.nome || "";
      const phone = c.session_id || "";
      const matchQ = q
        ? [realName, c.email, phone].some((v) => (v ?? "").toString().toLowerCase().includes(q.toLowerCase()))
        : true;

      // Filtro de período
      if (!c.created_at) return false;
      
      const createdDate = new Date(c.created_at);
      const now = new Date();
      
      let matchPeriodo = false;
      
      switch (filtroPeriodo) {
        case "hoje": {
          matchPeriodo = createdDate >= startOfDay(now) && createdDate <= endOfDay(now);
          break;
        }
        case "ontem": {
          const ontem = subDays(now, 1);
          matchPeriodo = createdDate >= startOfDay(ontem) && createdDate <= endOfDay(ontem);
          break;
        }
        case "semana_passada": {
          const inicioSemanaPassada = startOfWeek(subDays(now, 7), { locale: ptBR });
          const fimSemanaPassada = endOfWeek(subDays(now, 7), { locale: ptBR });
          matchPeriodo = createdDate >= inicioSemanaPassada && createdDate <= fimSemanaPassada;
          break;
        }
        case "ultimos_7_dias": {
          matchPeriodo = createdDate >= subDays(now, 7);
          break;
        }
        case "ultimos_30_dias": {
          matchPeriodo = createdDate >= subDays(now, 30);
          break;
        }
        case "personalizado": {
          if (dataInicio && dataFim) {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            matchPeriodo = createdDate >= startOfDay(inicio) && createdDate <= endOfDay(fim);
          } else {
            matchPeriodo = true;
          }
          break;
        }
        default:
          matchPeriodo = true;
      }

      return matchQ && matchPeriodo;
    });
  }, [dados, q, filtroPeriodo, dataInicio, dataFim]);

  const exportCsv = () => {
    const header = "Nome,Email,Telefone,Data de Cadastro,VIP,Teste,Plano\\n";
    const rows = filtrados.map(c => {
      const vipVal = (c.vip ?? c.VIP ?? "nao").toString();
      const testeVal = (c.teste ?? c.TESTE ?? "nao").toString();
      const planoVal = (c.plano ?? c.status ?? "indefinido").toString();
      const realName = (c.nome_lead || c.nome || "-").replace(/,/g, "");
      const dataFormatada = c.created_at 
        ? format(new Date(c.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
        : "-";
      
      return `${realName},${c.email || "-"},${c.session_id || "-"},${dataFormatada},${vipVal},${testeVal},${planoVal}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + header + rows.join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `novos_usuarios_${filtroPeriodo}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Novos Usuários
              </h2>
              <p className="text-sm text-muted-foreground">
                {filtrados.length} {filtrados.length === 1 ? "usuário encontrado" : "usuários encontrados"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="grid gap-3 md:grid-cols-3 pt-6">
            <Input 
              placeholder="Buscar por nome, email, telefone..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
            
            <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="ultimos_7_dias">Últimos 7 dias</SelectItem>
                <SelectItem value="semana_passada">Semana Passada</SelectItem>
                <SelectItem value="ultimos_30_dias">Últimos 30 dias</SelectItem>
                <SelectItem value="personalizado">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {filtroPeriodo === "personalizado" && (
              <>
                <Input 
                  type="date" 
                  value={dataInicio} 
                  onChange={(e) => setDataInicio(e.target.value)}
                  placeholder="Data início"
                />
                <Input 
                  type="date" 
                  value={dataFim} 
                  onChange={(e) => setDataFim(e.target.value)}
                  placeholder="Data fim"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Usuários Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center animate-pulse">Carregando dados...</div>
            ) : filtrados.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum usuário encontrado para o período selecionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border/40">
                      <th className="p-3">Nome</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3">Data de Cadastro</th>
                      <th className="p-3">VIP</th>
                      <th className="p-3">Teste</th>
                      <th className="p-3">Plano</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((c) => {
                      const vipVal = (c.vip ?? c.VIP ?? "").toString().toLowerCase() === "sim";
                      const testeVal = (c.teste ?? c.TESTE ?? "").toString().toLowerCase() === "sim";
                      const planoVal = c.plano || c.status || "—";
                      const realName = c.nome_lead || c.nome || "—";
                      const phone = c.session_id || "—";
                      const dataFormatada = c.created_at 
                        ? format(new Date(c.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : "—";

                      return (
                        <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{realName}</td>
                          <td className="p-3 text-muted-foreground">{c.email ?? "—"}</td>
                          <td className="p-3 whitespace-nowrap">{phone}</td>
                          <td className="p-3 whitespace-nowrap text-xs">{dataFormatada}</td>
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

export default NewUsers;
