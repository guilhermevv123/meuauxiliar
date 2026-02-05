import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Jan", receita: 4000, despesa: 2400 },
  { name: "Fev", receita: 3000, despesa: 1398 },
  { name: "Mar", receita: 2000, despesa: 9800 },
  { name: "Abr", receita: 2780, despesa: 3908 },
  { name: "Mai", receita: 1890, despesa: 4800 },
  { name: "Jun", receita: 2390, despesa: 3800 },
];

export default function BusinessDashboard() {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total (Mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas (Mês)
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.234,00</div>
            <p className="text-xs text-muted-foreground">
              -4% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contas a Receber
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 6.000,00</div>
            <p className="text-xs text-muted-foreground">
              Vencendo nos próximos 7 dias
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo em Caixa
            </CardTitle>
            <Wallet className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 82.234,00</div>
            <p className="text-xs text-muted-foreground">
              Atualizado há 1 hora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
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
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="receita" fill="#2563eb" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                  { name: "Pagamento de Fornecedor", val: "- R$ 1.200,00", date: "Hoje, 14:00", type: "out" },
                  { name: "Venda #1234", val: "+ R$ 450,00", date: "Hoje, 11:30", type: "in" },
                  { name: "Serviço de Consultoria", val: "+ R$ 2.000,00", date: "Ontem, 09:00", type: "in" },
                  { name: "Aluguel Escritório", val: "- R$ 3.500,00", date: "01/05/2026", type: "out" },
                  { name: "Venda #1233", val: "+ R$ 150,00", date: "01/05/2026", type: "in" },
              ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`space-y-1 ${item.type === 'in' ? 'border-l-4 border-green-500 pl-3' : 'border-l-4 border-red-500 pl-3'}`}>
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <div className={`ml-auto font-medium ${item.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.val}
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
