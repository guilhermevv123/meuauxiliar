import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Dot } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { getFinanceiroByMonth } from "@/lib/api";
import { getSession } from "@/lib/session";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = { month: number; year: number };

export const NetIncomeChart = ({ month, year }: Props) => {
  const sessionId = getSession()?.sessionId ?? "";
  
  // Buscar dados dos últimos 6 meses
  const months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      result.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    return result;
  }, [year, month]);

  const queries = months.map(({ year: y, month: m }) =>
    useQuery({
      queryKey: ["financeiro-net", sessionId, y, m],
      queryFn: () => getFinanceiroByMonth(sessionId, y, m),
      enabled: !!sessionId,
    })
  );

  const chartData = useMemo(() => {
    return months.map(({ year: y, month: m }, index) => {
      const rows = queries[index]?.data || [];
      const receitas = rows
        .filter((r) => r.tipo === "entrada")
        .reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
      const despesas = rows
        .filter((r) => r.tipo === "saida")
        .reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
      const liquido = receitas - despesas;

      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return {
        label: `${monthNames[m - 1]}, ${y}`,
        value: liquido,
      };
    });
  }, [months, queries]);

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || 0;
  const percentChange = previousValue !== 0 
    ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 
    : 0;
  const isPositive = percentChange >= 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl">
          <p className="text-sm font-bold">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-slate-300">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.label === chartData[chartData.length - 1]?.label) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#3B82F6"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border shadow-luxury-lg hover-lift">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receita Líquida
          </CardTitle>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrency(currentValue)}
            </span>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(percentChange).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted-foreground/5" 
              vertical={false}
            />
            <XAxis 
              dataKey="label" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              dy={10}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={60}
              domain={['auto', 'auto']}
              padding={{ top: 20, bottom: 20 }}
              tickFormatter={(value) => {
                if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
                if (value <= -1000) return `-R$ ${(Math.abs(value) / 1000).toFixed(1)}k`;
                return `R$ ${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Line 
              type="natural" 
              dataKey="value" 
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
