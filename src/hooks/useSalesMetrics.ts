import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type SaleTransaction = {
  id: number;
  cliente: string;
  email: string;
  avatar: string;
  data: string; // ISO date
  valor: number;
  metodo: "Pix" | "Cartão" | "Boleto";
  status: "Pago" | "Pendente" | "Falhou";
};

export type SalesMetrics = {
  vendasHoje: number;
  faturamentoHoje: number;
  mrr: number;
  ticketMedio: number;
  recentSales: SaleTransaction[];
  chartData: { date: string; value: number }[];
  loading: boolean;
};

export function useSalesMetrics() {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    vendasHoje: 0,
    faturamentoHoje: 0,
    mrr: 0,
    ticketMedio: 0,
    recentSales: [],
    chartData: [],
    loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("clientes_meu_auxiliar")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data) throw new Error("Failed to fetch sales");

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const PRICE = 27.90;

        // Filter VIPs or valid sales
        // Assuming a sale happened if VIP is 'sim' or 'vip' column is set.
        // We will treat all 'vip=sim' as active sales for historial purposes, 
        // using 'created_at' or 'vip_desde' as the transaction time.
        const sales = (data as any[])
          .filter(r => (r.vip || r.VIP || "").toString().toLowerCase() === "sim")
          .map((r, idx) => {
             // Simulate Data if missing
             const dateStr = r.vip_desde || r.vip_since || r.created_at || new Date().toISOString();
             const dt = new Date(dateStr);
             
             // Pseudo-random method based on ID or index
             const methods: ("Pix" | "Cartão" | "Boleto")[] = ["Pix", "Cartão", "Cartão", "Boleto"];
             const method = methods[(r.id || idx) % methods.length];
             
             // Pseudo-random status (mostly paid for VIPs)
             const status: "Pago" | "Pendente" | "Falhou" = "Pago"; 

             return {
                id: r.id || Math.random(),
                cliente: r.nome_lead || r.nome || "Cliente Desconhecido",
                email: r.email || "email@exemplo.com",
                avatar: "", 
                data: dt.toISOString(),
                valor: PRICE,
                metodo: method,
                status: status
             };
          });

        // Metrics Calculation
        const salesToday = sales.filter(s => new Date(s.data) >= startOfDay);
        const vendasHoje = salesToday.length;
        const faturamentoHoje = vendasHoje * PRICE;
        const mrr = sales.length * PRICE; // Simplified MRR (Total Active VIPs)
        const ticketMedio = sales.length > 0 ? PRICE : 0;

        // Chart Data (Last 30 days)
        const chartMap: Record<string, number> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            chartMap[d.toLocaleDateString("pt-BR")] = 0;
        }
        
        sales.forEach(s => {
            const dStr = new Date(s.data).toLocaleDateString("pt-BR");
            if (chartMap[dStr] !== undefined) {
                chartMap[dStr] += s.valor;
            }
        });

        const chartData = Object.keys(chartMap).map(date => ({
            date: date.slice(0, 5), // DD/MM
            value: chartMap[date]
        }));

        setMetrics({
            vendasHoje,
            faturamentoHoje,
            mrr,
            ticketMedio,
            recentSales: sales.slice(0, 15), // Top 15 recent
            chartData,
            loading: false
        });

      } catch (e) {
        console.error(e);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  return metrics;
}
