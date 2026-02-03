
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from "lucide-react";

export const AdminGatewayChart = ({ series, setPeriod, period, dataset, setDataset }: { series: any[], setPeriod: (p: any) => void, period: string, dataset?: string, setDataset?: (d: any) => void }) => {
    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {dataset === 'vip' ? 'Crescimento de VIPs' : dataset === 'teste' ? 'Novos Testes' : 'Crescimento de Usuários'}
                        <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
                            Ao vivo
                        </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Visualização gráfica de entrada de novos leads/clientes.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {setDataset && (
                        <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg mr-2">
                             {(['usuarios', 'vip', 'teste'] as const).map((d) => (
                                <button
                                    type="button"
                                    key={d}
                                    onClick={() => setDataset(d)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                                        dataset === d 
                                            ? 'bg-primary text-primary-foreground shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {d === 'usuarios' ? 'Total' : d.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg">
                        {(['semana', 'mes', 'ano'] as const).map((p) => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                                    period === p 
                                        ? 'bg-primary text-primary-foreground shadow-sm' 
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {p === 'ano' ? 'Ano' : p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="h-full w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series.map((v, i) => ({ name: i, value: v }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#09090b', 
                                    border: '1px solid #27272a', 
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                                }}
                                itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                                labelStyle={{ display: 'none' }}
                                formatter={(value: number) => [`${value} Usuários`, 'Quantidade']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8b5cf6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
