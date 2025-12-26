
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "@/hooks/useAdminMetrics";
import { Users, UserX, PercentCircle, FlaskConical, Crown, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

const icons: Record<string, any> = {
  "Total de Usuários": Users,
  "Usuários em Teste": FlaskConical,
  "VIP Total": Crown,
  "Vendas (mês)": ShoppingCart,
  "Faturamento (MRR)": DollarSign,
  "Potencial Faturamento": TrendingUp,
  "Não Renovaram": UserX,
  "Taxa de Conversão": PercentCircle,
};

export const AdminMetricsGrid = ({ metrics }: { metrics: Metric[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => {
        const Icon = icons[m.label] || Users;
        return (
          <Card key={m.label} className={`border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-16 h-16" />
             </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{m.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
};
