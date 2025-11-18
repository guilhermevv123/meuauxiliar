import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { getFinanceiroByMonth } from "@/lib/api";
import { getSession } from "@/lib/session";

type Props = { month: number; year: number };

export const SummaryCards = ({ month, year }: Props) => {
  const session = getSession();
  const sessionId = session?.sessionId ?? "";
  
  console.log("📊 SummaryCards - Session Info:", { 
    session, 
    sessionId,
    sessionIdType: typeof sessionId,
    month,
    year
  });
  
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["financeiro", sessionId, year, month],
    queryFn: () => getFinanceiroByMonth(sessionId, year, month),
    enabled: !!sessionId,
  });

  // Debug detalhado
  console.log("📊 SummaryCards - Raw data:", { 
    sessionId, 
    month,
    year,
    totalRows: rows.length,
    isLoading,
    allRows: rows,
    firstRow: rows[0],
    allSessionIds: rows.map(r => r.session_id)
  });

  const entradasRows = rows.filter(r => r.tipo === "entrada");
  const saidasRows = rows.filter(r => r.tipo === "saida");
  
  console.log("SummaryCards - Filtered:", {
    entradasCount: entradasRows.length,
    saidasCount: saidasRows.length,
    entradasRows,
    saidasRows
  });

  // Calcular entradas recebidas e a receber
  const entradasRecebidas = entradasRows
    .filter(r => r.recebido === 'sim')
    .reduce((s, r) => s + Math.abs(Number(r.valor) || 0), 0);
  
  const entradasAReceber = entradasRows
    .filter(r => r.recebido !== 'sim')
    .reduce((s, r) => s + Math.abs(Number(r.valor) || 0), 0);

  // Calcular saídas pagas e a pagar
  const saidasPagas = saidasRows
    .filter(r => r.pago === 'sim')
    .reduce((s, r) => s + Math.abs(Number(r.valor) || 0), 0);
  
  const saidasAPagar = saidasRows
    .filter(r => r.pago !== 'sim')
    .reduce((s, r) => s + Math.abs(Number(r.valor) || 0), 0);

  // Total de entradas e saídas (realizadas + previstas)
  const totalEntradas = entradasRecebidas + entradasAReceber;
  const totalSaidas = saidasPagas + saidasAPagar;
  
  // Para exibição nos cards individuais
  const entradas = entradasRecebidas;
  const saidas = saidasPagas;
  
  // Resultado do período considera TUDO
  const resultado = totalEntradas - totalSaidas;
  
  console.log("SummaryCards - Calculado:", { 
    entradasRecebidas,
    entradasAReceber,
    saidasPagas,
    saidasAPagar,
    entradas, 
    saidas, 
    resultado
  });
  
  const previstoEntrada = entradasAReceber;
  const previstoSaida = saidasAPagar;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
      <Card className="bg-card border-border shadow-luxury hover:shadow-glow transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Resultado do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-3xl font-bold text-primary mb-2 leading-tight">
            {isLoading ? "..." : formatCurrency(resultado)}
          </div>
          <div className="flex items-center text-sm text-green-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            {resultado >= 0 ? "+" : "-"} {Math.abs(resultado) > 0 ? `${Math.abs(resultado).toFixed(2)}%` : ""}
          </div>
          <p className="text-xs text-muted-foreground mt-1">1 abr - 20 de abr</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-luxury hover:shadow-glow transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-600">Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-normal min-w-0">Realizado</span>
              <span className="text-base sm:text-xl font-bold text-green-600 shrink-0 text-right leading-tight">
                {isLoading ? "..." : formatCurrency(entradas)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-normal min-w-0">Previsto (A Receber)</span>
              <span className="text-base sm:text-xl font-bold text-purple-600 dark:text-purple-400 shrink-0 text-right leading-tight">
                {formatCurrency(previstoEntrada)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-luxury hover:shadow-glow transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-600">Saídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-normal min-w-0">Realizado</span>
              <span className="text-base sm:text-xl font-bold text-red-600 shrink-0 text-right leading-tight">
                {isLoading ? "..." : formatCurrency(saidas)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-normal min-w-0">Previsto (A Pagar)</span>
              <span className="text-base sm:text-xl font-bold text-amber-600 dark:text-amber-400 shrink-0 text-right leading-tight">
                {formatCurrency(previstoSaida)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
