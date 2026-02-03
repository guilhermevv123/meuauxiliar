import { useSalesMetrics } from "@/hooks/useSalesMetrics";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, CreditCard, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Download, Filter } from "lucide-react";

const Sales = () => {
  const { vendasHoje, faturamentoHoje, mrr, ticketMedio, recentSales, chartData, loading } = useSalesMetrics();

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Vendas</h2>
                <p className="text-muted-foreground">Gestão financeira e histórico de transações.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filtros
                </Button>
                <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-4 w-4" /> Exportar Relatório
                </Button>
            </div>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{vendasHoje}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" /> +{vendasHoje > 0 ? "100%" : "0%"} vs ontem
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{fmtBRL(faturamentoHoje)}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                         <span className="text-emerald-500 font-medium">Receita confirmada</span>
                    </p>
                </CardContent>
            </Card>
            
             <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Mensal (MRR)</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{fmtBRL(mrr)}</div>
                   <p className="text-xs text-muted-foreground">Recorrência mensal ativa</p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <CreditCard className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{fmtBRL(ticketMedio)}</div>
                    <p className="text-xs text-muted-foreground">Por cliente ativo</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-2 border-border/50 bg-card/40">
                <CardHeader>
                    <CardTitle>Crescimento de Receita</CardTitle>
                    <CardDescription>Visualização diária dos últimos 30 dias.</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value}`} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    formatter={(value: number) => [fmtBRL(value), "Receita"]}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions Table */}
            <Card className="border-border/50 bg-card/40 flex flex-col">
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                    <CardDescription>Últimas 15 vendas processadas.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto pr-2">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center p-4 text-muted-foreground animate-pulse">Carregando transações...</div>
                        ) : recentSales.length === 0 ? (
                            <div className="text-center p-4 text-muted-foreground">Nenhuma venda encontrada.</div>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-emerald-500/20 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Avatar className="h-9 w-9 border border-border/50">
                                            <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold uppercase text-xs">
                                                {sale.cliente.substring(0,2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate" title={sale.cliente}>{sale.cliente}</span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                {new Date(sale.data).toLocaleDateString('pt-BR')} • {sale.metodo}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-bold text-emerald-400">{fmtBRL(sale.valor)}</span>
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                            {sale.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Sales;

