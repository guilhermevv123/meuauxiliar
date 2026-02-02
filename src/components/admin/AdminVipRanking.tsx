
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Activity, Eye, EyeOff, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const AdminVipRanking = ({ ranking }: { ranking: Array<{ nome?: string; email?: string; whatsapp?: string; usageScore: number; isVip?: boolean }> }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="col-span-3 bg-card/40 backdrop-blur-sm border-border/50 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base font-semibold">Top Usuários (Fidelidade)</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-500/50" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pr-2">
        <div className="space-y-4">
          {ranking.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-xs">
                  <Trophy className="h-8 w-8 mb-2 opacity-20" />
                  Nenhum dado de uso ainda.
              </div>
          ) : (
             ranking.map((r, idx) => {
                let medalColor = "text-muted-foreground/50";
                let isTop3 = false;
                if (idx === 0) { medalColor = "text-yellow-500"; isTop3 = true; }
                if (idx === 1) { medalColor = "text-gray-300"; isTop3 = true; }
                if (idx === 2) { medalColor = "text-amber-700"; isTop3 = true; }

                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50 group">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`font-bold w-6 text-center shrink-0 ${medalColor} ${isTop3 ? 'text-lg' : 'text-sm'}`}>
                          {isTop3 ? <Medal className="h-5 w-5 mx-auto" /> : `#${idx + 1}`}
                        </div>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase font-bold">
                                    {r.nome ? r.nome.slice(0,2) : r.email?.slice(0,2) ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium leading-none truncate" title={r.nome || r.email || ""}>
                                        {r.nome ?? "Usuário"}
                                    </span>
                                    {r.isVip && (
                                        <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-0.5">
                                            <Crown className="h-2 w-2" /> VIP
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1">
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {r.whatsapp && showDetails ? r.whatsapp : "••••••••••"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded border border-primary/10">
                            <Activity className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold text-primary">{r.usageScore}</span>
                        </div>
                        <Eye className={`h-4 w-4 text-muted-foreground/30 ${showDetails ? 'opacity-100 text-primary/50' : 'opacity-0'}`} />
                    </div>
                  </div>
                );
             })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
