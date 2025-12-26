import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type TrendData = {
    date: string;
    visitors: number;
    leads: number;
    sales: number;
};

export type CohortData = {
    week: string;
    retention: number[]; // % retention for week 0, 1, 2...
};

export type TrafficSource = {
    name: string;
    value: number;
    color: string;
};

export type ConversionMetrics = {
    totalVisitors: number;
    totalLeads: number; // Trials
    totalVips: number; // Sales
    conversionRate: number; // Total -> VIP
    conversionTrialToPaid: number; // Trial -> VIP
    churnRate: number; // Simulated
    avgConversionTime: number; // Days
    funnelData: { name: string; value: number; fill: string }[];
    trendData: TrendData[];
    cohortData: CohortData[];
    trafficSources: TrafficSource[];
    conversionTimeData?: { day: string; count: number; fill: string }[];
    loading: boolean;
};

export function useConversionMetrics() {
    const [metrics, setMetrics] = useState<ConversionMetrics>({
        totalVisitors: 0,
        totalLeads: 0,
        totalVips: 0,
        conversionRate: 0,
        conversionTrialToPaid: 0,
        churnRate: 0,
        avgConversionTime: 0,
        funnelData: [],
        trendData: [],
        cohortData: [],
        trafficSources: [],
        loading: true
    });

    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase
                    .from("clientes_meu_auxiliar")
                    .select("id, created_at, vip, VIP, status, plano, vip_since");

                const rows = data || [];
                
                // Basic counts
                const totalVips = rows.filter(r => (r.vip || r.VIP || "").toString().toLowerCase() === "sim").length;
                const totalTrials = rows.filter(r => (r.status === "teste" || r.plano === "teste")).length;
                
                // Simulate "Visitors" based on leads (assuming 5% conversion from visitor to lead)
                const totalLeads = rows.length;
                const totalVisitors = Math.round(totalLeads * 20); // 1/0.05

                // Rates
                const conversionRate = totalVisitors > 0 ? (totalVips / totalVisitors) * 100 : 0;
                
                // Qualified Leads (Trial + VIPs who were likely trials)
                const qualified = totalTrials + totalVips;
                const conversionTrialToPaid = qualified > 0 ? (totalVips / qualified) * 100 : 0;

                // Simulated Stats
                const churnRate = 4.2; // Industry standard simulation
                const avgConversionTime = 14; // Avg days trial

                // Funnel Visualization
                const funnelData = [
                    { name: 'Visitantes', value: totalVisitors, fill: '#94a3b8' },
                    { name: 'Leads (Cadastros)', value: totalLeads, fill: '#60a5fa' },
                    { name: 'Em Trial', value: qualified, fill: '#818cf8' },
                    { name: 'Clientes VIP', value: totalVips, fill: '#10b981' },
                ];

                // Simulated Trend (Last 30 days)
                const trendData: TrendData[] = Array.from({ length: 14 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (13 - i));
                    return {
                        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        visitors: Math.floor(Math.random() * 500) + 1000,
                        leads: Math.floor(Math.random() * 50) + 20,
                        sales: Math.floor(Math.random() * 10) + 2
                    };
                });

                // Simulated Traffic Sources
                const trafficSources = [
                    { name: 'Instagram (Ads)', value: 45, color: '#E1306C' },
                    { name: 'Google (Orgânico)', value: 30, color: '#4285F4' },
                    { name: 'Direto / Link', value: 15, color: '#10b981' },
                    { name: 'Indicação', value: 10, color: '#8b5cf6' },
                ];

                // Simulated Cohort (Last 8 weeks)
                const cohortData: CohortData[] = [
                    { week: 'Semana 1', retention: [100, 80, 60, 50, 45, 45, 40, 40] },
                    { week: 'Semana 2', retention: [100, 75, 55, 48, 42, 40, 38] },
                    { week: 'Semana 3', retention: [100, 78, 58, 50, 46, 44] },
                    { week: 'Semana 4', retention: [100, 82, 62, 55, 50] },
                    { week: 'Semana 5', retention: [100, 80, 60, 52] },
                    { week: 'Semana 6', retention: [100, 75, 55] },
                    { week: 'Semana 7', retention: [100, 78] },
                    { week: 'Semana 8', retention: [100] },
                ];

                // Real Conversion Time Distribution
                const conversionTimeCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                
                rows.forEach((r: any) => {
                    const isVip = (r.vip || r.VIP || "").toString().toLowerCase() === "sim";
                    if (isVip && r.created_at) {
                        // Prefer vip_since, fallback to vip_desde, or created_at (instant)
                        const vipDateStr = r.vip_since || r.vip_desde;
                        if (vipDateStr) {
                            const start = new Date(r.created_at);
                            const end = new Date(vipDateStr);
                            const diffTime = Math.abs(end.getTime() - start.getTime());
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays <= 4) {
                                conversionTimeCounts[diffDays as keyof typeof conversionTimeCounts]++;
                            } else {
                                conversionTimeCounts[5]++;
                            }
                        }
                    }
                });

                const conversionTimeData = [
                    { day: 'Dia 0', count: conversionTimeCounts[0], fill: '#94a3b8' }, 
                    { day: 'Dia 1', count: conversionTimeCounts[1], fill: '#94a3b8' },
                    { day: 'Dia 2', count: conversionTimeCounts[2], fill: '#94a3b8' },
                    { day: 'Dia 3', count: conversionTimeCounts[3], fill: '#fbbf24' }, // Gold spike target
                    { day: 'Dia 4', count: conversionTimeCounts[4], fill: '#fbbf24' }, // Gold spike target
                    { day: 'Dia 5+', count: conversionTimeCounts[5], fill: '#ef4444' }, 
                ];

                setMetrics({
                    totalVisitors,
                    totalLeads,
                    totalVips,
                    conversionRate,
                    conversionTrialToPaid,
                    churnRate,
                    avgConversionTime,
                    funnelData,
                    trendData,
                    cohortData,
                    trafficSources,
                    conversionTimeData,
                    loading: false
                });

            } catch (error) {
                console.error(error);
                setMetrics(prev => ({ ...prev, loading: false }));
            }
        })();
    }, []);

    return metrics;
}
