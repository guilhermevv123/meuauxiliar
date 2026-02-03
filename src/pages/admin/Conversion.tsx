import { useConversionMetrics } from "@/hooks/useConversionMetrics";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, CartesianGrid, AreaChart, Area, Legend 
} from "recharts";
import { Users, Filter, Download, ArrowRight, UserCheck, TrendingUp, AlertCircle } from "lucide-react";

const Conversion = () => {
  const { 
      totalVisitors, totalLeads, totalVips, conversionRate, conversionTrialToPaid, 
      churnRate, avgConversionTime, funnelData, trendData, cohortData, trafficSources, conversionTimeData, loading 
  } = useConversionMetrics();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Conversão</h2>
                <p className="text-muted-foreground">Análise detalhada do funil e retenção de usuários.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Periodo: 30 dias
                </Button>
                <Button variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Download className="h-4 w-4" /> Exportar Dados
                </Button>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa Global</CardTitle>
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Visitante → VIP</p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trial → Paid</CardTitle>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-400">{conversionTrialToPaid.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Conversão de Leads Qualificados</p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-400">{churnRate}%</div>
                    <p className="text-xs text-muted-foreground">Cancelamentos mensais (est.)</p>
                </CardContent>
            </Card>

             <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgConversionTime} dias</div>
                    <p className="text-xs text-muted-foreground">Do cadastro à assinatura</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funnel Chart */}
            <Card className="col-span-1 lg:col-span-1 border-border/50 bg-card/40">
                <CardHeader>
                    <CardTitle>Funil de Vendas</CardTitle>
                    <CardDescription>Etapas da jornada do usuário.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 30 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} stroke="#888" interval={0} />
                             <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}}
                             />
                             <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                             </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Trend Area Chart */}
            <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/40">
                <CardHeader>
                    <CardTitle>Tendência de Aquisição</CardTitle>
                    <CardDescription>Visitantes vs Leads vs Vendas (Últimos 14 dias).</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                            <Area type="monotone" dataKey="visitors" stackId="1" stroke="#94a3b8" fill="url(#colorVisitors)" />
                            <Area type="monotone" dataKey="leads" stackId="2" stroke="#60a5fa" fill="url(#colorLeads)" />
                            <Area type="monotone" dataKey="sales" stackId="3" stroke="#10b981" fill="#10b981" />
                            <Legend />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Conversion Time Distribution (Day 3 Trend) */}
             <Card className="col-span-1 border-border/50 bg-card/40">
                <CardHeader>
                    <CardTitle>Tempo de Conversão</CardTitle>
                    <CardDescription>Dias entre cadastro e assinatura.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={conversionTimeData || []} margin={{ top: 20 }}>
                            <XAxis dataKey="day" tick={{fontSize: 10}} stroke="#888" interval={0} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} 
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {conversionTimeData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                        Pico ideal: <span className="text-amber-400 font-bold">Dia 3 e 4</span> (Fim do Trial)
                    </div>
                </CardContent>
            </Card>

             {/* Cohort Analysis (Heatmap Simulation) */}
             <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/40">
                <CardHeader>
                    <CardTitle>Retenção de Coorte (Cohort)</CardTitle>
                    <CardDescription>Retenção de usuários por semana de entrada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left font-medium text-muted-foreground border-b border-border/50">Semana</th>
                                    {Array.from({length: 8}, (_, i) => (
                                        <th key={i} className="p-2 font-medium text-muted-foreground border-b border-border/50">W{i}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cohortData.map((cohort, i) => (
                                    <tr key={i} className="hover:bg-muted/10">
                                        <td className="p-2 text-left font-medium whitespace-nowrap border-b border-border/30">{cohort.week}</td>
                                        {Array.from({length: 8}, (_, j) => {
                                             const val = cohort.retention[j];
                                             const bg = val >= 80 ? 'bg-emerald-500/80 text-white' : 
                                                        val >= 60 ? 'bg-emerald-500/50 text-white' :
                                                        val >= 40 ? 'bg-emerald-500/20 text-emerald-200' :
                                                        val ? 'bg-emerald-500/10 text-emerald-500' : '';
                                             return (
                                                 <td key={j} className="p-1 border-b border-border/30">
                                                     {val ? (
                                                         <div className={`w-full h-8 flex items-center justify-center rounded ${bg}`}>
                                                             {val}%
                                                         </div>
                                                     ) : (
                                                         <div className="w-full h-8" />
                                                     )}
                                                 </td>
                                             )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Conversion;
