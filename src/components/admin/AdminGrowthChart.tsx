
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";

type Props = {
  period: "semana" | "mes" | "ano";
  dataset: "usuarios" | "vip" | "teste";
  setPeriod: (v: "semana" | "mes" | "ano") => void;
  setDataset: (v: "usuarios" | "vip" | "teste") => void;
  series: number[];
};

export const AdminGrowthChart = ({ period, dataset, setPeriod, setDataset, series }: Props) => {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-primary" />
             Crescimento
        </CardTitle>
         <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-[100px] h-8 text-xs bg-background/50 border-border/50"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="mes">Mês</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dataset} onValueChange={(v) => setDataset(v as any)}>
            <SelectTrigger className="w-[110px] h-8 text-xs bg-background/50 border-border/50"><SelectValue placeholder="Dataset" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="usuarios">Usuários</SelectItem>
              <SelectItem value="teste">Teste</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent rounded-xl border border-border/30 p-4 relative overflow-hidden group">
             {/* Grid Lines */}
             <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                <div className="w-full h-px bg-border"></div>
                <div className="w-full h-px bg-border"></div>
                <div className="w-full h-px bg-border"></div>
                <div className="w-full h-px bg-border"></div>
             </div>

             <svg viewBox="0 0 600 200" className="w-full h-full preserve-3d" style={{ filter: "drop-shadow(0px 4px 8px rgba(124, 58, 237, 0.3))" }}>
                {(() => {
                    const max = Math.max(1, ...series);
                    const stepX = series.length > 1 ? 600 / (series.length - 1) : 600;
                    // Area path
                    const areaPts = series.map((v, i) => {
                        const x = i * stepX;
                        const y = 190 - (v / max) * 180;
                        return `${x},${y}`;
                    }).join(" ");
                    
                    const areaPath = `0,200 ${areaPts} 600,200`;

                    return (
                    <>
                        {/* Area Fill */}
                        <polygon points={areaPath} fill="url(#garea)" opacity="0.4" />
                        
                        {/* Line */}
                        <polyline points={areaPts} fill="none" stroke="url(#gline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Dots */}
                        {series.map((v, i) => {
                             const x = i * stepX;
                             const y = 190 - (v / max) * 180;
                             return (
                                 <circle key={i} cx={x} cy={y} r="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             )
                        })}

                        <defs>
                        <linearGradient id="gline" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" />
                        </linearGradient>
                         <linearGradient id="garea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                        </defs>
                    </>
                    );
                })()}
            </svg>
        </div>
      </CardContent>
    </Card>
  );
};
