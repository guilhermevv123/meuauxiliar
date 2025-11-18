import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { getFinanceiroByMonth } from "@/lib/api";
import { getSession } from "@/lib/session";

type Props = { month: number; year: number };

const colors = ["#7C3AED", "#A855F7", "#C084FC", "#E9D5FF", "#6EE7B7", "#FDE68A", "#FCA5A5", "#93C5FD"];

export const CategoryChart = ({ month, year }: Props) => {
  const sessionId = getSession()?.sessionId ?? "";
  const { data: rows = [] } = useQuery({
    queryKey: ["financeiro-categories", sessionId, year, month],
    queryFn: () => getFinanceiroByMonth(sessionId, year, month),
    enabled: !!sessionId,
  });

  const expenseByCat = new Map<string, number>();
  for (const r of rows) {
    if (r.tipo === "saida") {
      const key = r.categoria || "Outros";
      expenseByCat.set(key, (expenseByCat.get(key) || 0) + (Number(r.valor) || 0));
    }
  }
  const categoryData = Array.from(expenseByCat.entries()).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  const totalValue = categoryData.reduce((s, c) => s + c.value, 0);
  return (
    <Card className="bg-card border-border shadow-luxury">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Despesas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-3">
            <div className="text-center mb-2">
              <div className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{formatCurrency(totalValue)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total a Pagar</div>
            </div>
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-sm sm:text-base text-foreground truncate">{cat.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base leading-tight">{formatCurrency(cat.value)}</div>
                  <div className="text-xs text-muted-foreground">
                    {((cat.value / totalValue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
