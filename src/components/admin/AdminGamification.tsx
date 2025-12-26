
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Trophy, Medal, Star } from "lucide-react";

export const AdminGamification = () => {
    // Mock logic - could be tied to sales volume later
    const currentLevel = "Explorador"; // Default for now
    
    return (
        <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-800">Jornada de conquistas</CardTitle>
                    <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">Saiba mais %</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>Você é <strong className="text-amber-500 font-bold">{currentLevel}</strong></span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Próximo nível: Avançado</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 mt-2">
                    {/* Level 1: Explorador (Unlocked) */}
                    <div className="flex flex-col items-center justify-center text-center space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                             <Trophy className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">Explorador</span>
                            <span className="text-[10px] text-slate-500">1ª venda</span>
                        </div>
                         <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-[10px] px-1.5 h-5">
                            <Unlock className="h-3 w-3 mr-1" /> Conquistado
                        </Badge>
                    </div>

                     {/* Level 2: Avançado (Locked) */}
                     <div className="flex flex-col items-center justify-center text-center space-y-2 p-3 bg-white rounded-xl border border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                             <Medal className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">Avançado</span>
                            <span className="text-[10px] text-slate-500">10k Faturamento</span>
                        </div>
                         <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                            <Lock className="h-3 w-3 mr-1" /> Bloqueado
                        </Badge>
                    </div>

                     {/* Level 3: Expert (Locked) */}
                     <div className="flex flex-col items-center justify-center text-center space-y-2 p-3 bg-white rounded-xl border border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                             <Star className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">Expert</span>
                            <span className="text-[10px] text-slate-500">100k Faturamento</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                            <Lock className="h-3 w-3 mr-1" /> Bloqueado
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
