import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { getFinanceiroByMonth } from "@/lib/api";
import { getSession } from "@/lib/session";

type Props = { month: number; year: number };

export const BalanceChart = ({ month, year }: Props) => {
  const [viewMode, setViewMode] = useState<"realizado" | "projetado">("realizado");
  const sessionId = getSession()?.sessionId ?? "";
  const { data: rows = [] } = useQuery({
    queryKey: ["financeiro-balance", sessionId, year, month],
    queryFn: () => getFinanceiroByMonth(sessionId, year, month),
    enabled: !!sessionId,
  });

  const balanceData = useMemo(() => {
    // aggregate by day
    const map = new Map<string, { receitas: number; despesas: number }>();
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    for (const r of rows) {
      const d = new Date(r.data_transacao);
      const key = fmt(d);
      const entry = map.get(key) || { receitas: 0, despesas: 0 };
      if (r.tipo === "entrada") entry.receitas += Number(r.valor) || 0;
      if (r.tipo === "saida") entry.despesas += Number(r.valor) || 0;
      map.set(key, entry);
    }
    const days = Array.from(map.entries()).sort((a, b) => {
      // parse dd mmm locale order by date by creating Date with current year
      const parse = (s: string) => {
        const [dd, mmm] = s.replace(".", "").split(" ");
        const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        const mi = months.indexOf(mmm.toLowerCase());
        return new Date(year, mi, Number(dd));
      };
      return parse(a[0]).getTime() - parse(b[0]).getTime();
    });
    let running = 0;
    return days.map(([label, v]) => {
      running += v.receitas - v.despesas;
      return { date: label, receitas: v.receitas, despesas: -v.despesas, realizado: running, projetado: running };
    });
  }, [rows, year]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 backdrop-blur-xl border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
          <p className="font-bold text-foreground mb-3 text-base border-b border-border pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-muted-foreground font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold text-base" style={{ color: entry.color }}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border shadow-luxury-lg hover-lift">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-foreground text-xl font-bold">Evolução do Saldo</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Acompanhe seu fluxo financeiro diário</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "realizado" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("realizado")}
              className="shadow-md hover-lift"
            >
              Realizado
            </Button>
            <Button 
              variant={viewMode === "projetado" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("projetado")}
              className="shadow-md hover-lift"
            >
              Projetado
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={balanceData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted-foreground/10" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              dy={10}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => {
                if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
                return `R$ ${value}`;
              }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingBottom: '20px',
                fontSize: '13px',
                fontWeight: 500
              }}
            />
            <Area 
              type="natural" 
              dataKey="receitas" 
              name="Receitas"
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorReceitas)"
              dot={{ fill: '#10B981', r: 3, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#10B981' }}
              animationDuration={800}
            />
            <Area 
              type="natural" 
              dataKey="despesas" 
              name="Despesas"
              stroke="#EF4444" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorDespesas)"
              dot={{ fill: '#EF4444', r: 3, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#EF4444' }}
              animationDuration={800}
            />
            <Area 
              type="natural" 
              dataKey={viewMode} 
              name={viewMode === "realizado" ? "Saldo Realizado" : "Saldo Projetado"}
              stroke="#8B5CF6" 
              strokeWidth={3.5}
              fillOpacity={1} 
              fill="url(#colorRealizado)"
              strokeDasharray={viewMode === "projetado" ? "8 4" : "0"}
              dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff', fill: '#8B5CF6', filter: 'url(#shadow)' }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
