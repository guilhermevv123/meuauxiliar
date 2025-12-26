
import AdminLayout from "./AdminLayout";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { AdminGatewayChart } from "@/components/admin/AdminGatewayChart";
import { AdminVipRanking } from "@/components/admin/AdminVipRanking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export const AdminDashboard = () => {
    const { metrics, ranking, series, loading, setPeriod, setDataset, period, dataset } = useAdminMetrics();

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 pt-6 pb-20 fade-in px-4 md:px-6">
                
                {/* Top Metrics Cards */}
                {/* Top Metrics Cards */}
                {/* Top Metrics Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-blue-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Total de Usuários")?.value || 0}</div>
                            <p className="text-xs text-muted-foreground">Cadastrados na plataforma</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-yellow-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuários em Teste</CardTitle>
                            <Activity className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Usuários em Teste")?.value || 0}</div>
                             <p className="text-xs text-muted-foreground">Experimentando (Trial)</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-purple-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuários VIP</CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "VIP Total")?.value || 0}</div>
                             <p className="text-xs text-muted-foreground">Assinantes Ativos</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-green-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Faturamento (MRR)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Faturamento (MRR)")?.value || "R$ 0,00"}</div>
                             <p className="text-xs text-muted-foreground">Recorrência Mensal</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-orange-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Potencial Faturamento</CardTitle>
                            <Activity className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Potencial Faturamento")?.value || "R$ 0,00"}</div>
                             <p className="text-xs text-muted-foreground">Se todos em teste converterem</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Taxa de Conversão")?.value || "0%"}</div>
                             <p className="text-xs text-muted-foreground">Trial para VIP</p>
                        </CardContent>
                    </Card>
                     
                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-red-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Não Renovaram</CardTitle>
                            <Activity className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Não Renovaram")?.value || 0}</div>
                             <p className="text-xs text-muted-foreground">Ex-assinantes ou expirados</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-cyan-500/50 transition-all hover-lift">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Novas Vendas (Mês)</CardTitle>
                            <DollarSign className="h-4 w-4 text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.find(m => m.label === "Vendas (mês)")?.value || 0}</div>
                             <p className="text-xs text-muted-foreground">Novos esse mês</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-4 h-full"> 
                         <AdminGatewayChart 
                            series={series} 
                            setPeriod={setPeriod} 
                            period={period}
                            dataset={dataset}
                            setDataset={setDataset}
                         />
                    </div>

                    {/* Ranking */}
                     <div className="lg:col-span-3 h-full">
                        <AdminVipRanking ranking={ranking} />
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
