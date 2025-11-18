import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, TrendingDown, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { addCategoria, deleteCategoria, seedCategoriasIfEmpty, getGastosPorCategoria } from "@/lib/api";
import { getSession } from "@/lib/session";
import { toast } from "sonner";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export const CategoriesTab = () => {
  const sessionId = getSession()?.sessionId ?? "";
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { data: despesas = [], refetch: refetchDespesas } = useQuery({
    queryKey: ["categorias", sessionId, "despesa"],
    queryFn: () => seedCategoriasIfEmpty(sessionId, "despesa"),
    enabled: !!sessionId,
  });
  const { data: receitas = [], refetch: refetchReceitas } = useQuery({
    queryKey: ["categorias", sessionId, "receita"],
    queryFn: () => seedCategoriasIfEmpty(sessionId, "receita"),
    enabled: !!sessionId,
  });
  const { data: gastos = {} } = useQuery({
    queryKey: ["gastos-categoria", sessionId, currentYear, currentMonth],
    queryFn: () => getGastosPorCategoria(sessionId, currentYear, currentMonth),
    enabled: !!sessionId,
  });

  const [novaDespesa, setNovaDespesa] = useState("");
  const [novaReceita, setNovaReceita] = useState("");
  const [viewMode, setViewMode] = useState<"despesas" | "receitas" | "comparar" | "todas">("todas");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  const add = async (type: "despesa" | "receita", name: string) => {
    if (!name.trim()) { toast.error("Informe um nome"); return; }
    try {
      await addCategoria({ sessionId, name: name.trim(), type });
      toast.success("Categoria adicionada");
      if (type === "despesa") { setNovaDespesa(""); refetchDespesas(); }
      else { setNovaReceita(""); refetchReceitas(); }
    } catch {
      toast.error("Falha ao adicionar categoria");
    }
  };

  const del = async (id: string, type: "despesa" | "receita") => {
    try {
      await deleteCategoria(id);
      toast.success("Categoria removida");
      if (type === "despesa") refetchDespesas(); else refetchReceitas();
    } catch {
      toast.error("Falha ao remover categoria");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const chartData = useMemo(() => {
    const data: any[] = [];
    Object.entries(gastos).forEach(([categoria, valores]: [string, any]) => {
      if (selectedCategory !== "todas" && categoria !== selectedCategory) return;
      
      if (viewMode === "despesas" || viewMode === "todas") {
        if (valores.despesas > 0) {
          data.push({
            categoria,
            tipo: "Despesas",
            valor: valores.despesas,
            fill: '#ef4444'
          });
        }
      }
      if (viewMode === "receitas" || viewMode === "todas") {
        if (valores.receitas > 0) {
          data.push({
            categoria,
            tipo: "Receitas",
            valor: valores.receitas,
            fill: '#10b981'
          });
        }
      }
      if (viewMode === "comparar") {
        data.push({
          categoria,
          Despesas: valores.despesas,
          Receitas: valores.receitas
        });
      }
    });
    return data;
  }, [gastos, viewMode, selectedCategory]);

  const pieData = useMemo(() => {
    const data: any[] = [];
    Object.entries(gastos).forEach(([categoria, valores]: [string, any], index) => {
      if (selectedCategory !== "todas" && categoria !== selectedCategory) return;
      
      let valor = 0;
      if (viewMode === "despesas") valor = valores.despesas;
      else if (viewMode === "receitas") valor = valores.receitas;
      else valor = valores.despesas + valores.receitas;
      
      if (valor > 0) {
        data.push({
          name: categoria,
          value: valor,
          fill: COLORS[index % COLORS.length]
        });
      }
    });
    return data;
  }, [gastos, viewMode, selectedCategory]);

  const allCategories = useMemo(() => {
    return Object.keys(gastos);
  }, [gastos]);

  const totalDespesas = useMemo(() => {
    return Object.values(gastos).reduce((sum: number, v: any) => sum + v.despesas, 0);
  }, [gastos]);

  const totalReceitas = useMemo(() => {
    return Object.values(gastos).reduce((sum: number, v: any) => sum + v.receitas, 0);
  }, [gastos]);

  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Despesas</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(totalDespesas)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Receitas</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalReceitas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(saldo)}
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualização de Dados */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="despesas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
            </TabsList>

            {/* Tab Despesas */}
            <TabsContent value="despesas" className="space-y-6">
              {Object.keys(gastos).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhuma transação registrada neste mês</p>
                </div>
              ) : (
                <>
                  {/* Gráfico de Pizza */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Gráfico por categoria</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} - {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(gastos)
                              .filter(([_, v]: [string, any]) => v.despesas > 0)
                              .map(([name, v]: [string, any], index) => ({
                                name,
                                value: v.despesas,
                                fill: COLORS[index % COLORS.length]
                              }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {Object.entries(gastos)
                              .filter(([_, v]: [string, any]) => v.despesas > 0)
                              .map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Lista de Detalhes */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes</h3>
                    <div className="space-y-3">
                      {Object.entries(gastos)
                        .filter(([_, valores]: [string, any]) => valores.despesas > 0)
                        .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.despesas - a.despesas)
                        .map(([categoria, valores]: [string, any], index) => {
                          const percentage = (valores.despesas / totalDespesas) * 100;
                          return (
                            <div key={categoria} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span 
                                  className="text-sm font-medium px-3 py-1 rounded-full text-white"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                  {categoria}
                                </span>
                                <div className="text-right">
                                  <span className="text-base font-bold text-foreground">{formatCurrency(valores.despesas)}</span>
                                  <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(2)}%)</span>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Tab Receitas */}
            <TabsContent value="receitas" className="space-y-6">
              {Object.keys(gastos).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhuma transação registrada neste mês</p>
                </div>
              ) : (
                <>
                  {/* Gráfico de Pizza */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Gráfico por categoria</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} - {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(gastos)
                              .filter(([_, v]: [string, any]) => v.receitas > 0)
                              .map(([name, v]: [string, any], index) => ({
                                name,
                                value: v.receitas,
                                fill: COLORS[index % COLORS.length]
                              }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {Object.entries(gastos)
                              .filter(([_, v]: [string, any]) => v.receitas > 0)
                              .map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Lista de Detalhes */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes</h3>
                    <div className="space-y-3">
                      {Object.entries(gastos)
                        .filter(([_, valores]: [string, any]) => valores.receitas > 0)
                        .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.receitas - a.receitas)
                        .map(([categoria, valores]: [string, any], index) => {
                          const percentage = (valores.receitas / totalReceitas) * 100;
                          return (
                            <div key={categoria} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span 
                                  className="text-sm font-medium px-3 py-1 rounded-full text-white"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                  {categoria}
                                </span>
                                <div className="text-right">
                                  <span className="text-base font-bold text-foreground">{formatCurrency(valores.receitas)}</span>
                                  <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(2)}%)</span>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Gerenciar Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Categorias de Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Nova categoria" value={novaDespesa} onChange={(e) => setNovaDespesa(e.target.value)} />
            <Button onClick={() => add("despesa", novaDespesa)}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </div>
          <div className="space-y-2">
            {despesas.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{c.name}</span>
                  {c.is_default && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Padrão</span>}
                </div>
                {!c.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => del(c.id, "despesa")}> <Trash2 className="h-4 w-4" /> </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Categorias de Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Nova categoria" value={novaReceita} onChange={(e) => setNovaReceita(e.target.value)} />
            <Button onClick={() => add("receita", novaReceita)}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </div>
          <div className="space-y-2">
            {receitas.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{c.name}</span>
                  {c.is_default && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Padrão</span>}
                </div>
                {!c.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => del(c.id, "receita")}> <Trash2 className="h-4 w-4" /> </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
