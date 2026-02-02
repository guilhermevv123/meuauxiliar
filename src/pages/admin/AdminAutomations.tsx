
import AdminLayout from "./AdminLayout";
import { Bot, Construction, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const AdminAutomations = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
                
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-xl rounded-full animate-pulse" />
                    <div className="relative p-6 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                        <Bot className="h-16 w-16 text-cyan-400" />
                        <div className="absolute -bottom-2 -right-2 bg-yellow-500/10 border border-yellow-500/20 p-1.5 rounded-full backdrop-blur-md">
                            <Construction className="h-5 w-5 text-yellow-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 max-w-lg">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Motor de Automações em Evolução
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Estamos atualizando nosso sistema de inteligência para trazer gatilhos mais precisos e ações mais poderosas para o seu negócio.
                    </p>
                </div>

                <Card className="border-border/50 bg-card/30 backdrop-blur-sm max-w-md w-full">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-sm text-left">
                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-muted-foreground">Otimizando filas de processamento</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-left">
                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse delay-150" />
                            <span className="text-muted-foreground">Integrando novos canais (WhatsApp API)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-left">
                            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse delay-300" />
                            <span className="text-muted-foreground">Refinando regras de segmentação</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-4">
                     <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
                        Voltar para Dashboard
                     </Button>
                </div>

            </div>
        </AdminLayout>
    );
};
