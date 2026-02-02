import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface QuizSalesProps {
  onNext: () => void;
}

export const QuizSales = ({ onNext }: QuizSalesProps) => {
  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto min-h-[80vh] px-4 py-8 bg-background text-foreground">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
        >
            <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-purple bg-clip-text text-transparent mb-2">
                    Análise Concluída
                </h1>
                <p className="text-muted-foreground">
                    Com base no seu perfil, montamos o plano ideal para você.
                </p>
            </div>

            {/* PART 1: Comparison (Divided in 2 parts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-destructive text-sm uppercase tracking-wider flex items-center gap-2">
                        <X className="w-4 h-4" /> Hoje
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2 text-left">
                            <span className="text-destructive">•</span> Dinheiro some sem ver
                        </li>
                        <li className="flex gap-2 text-left">
                            <span className="text-destructive">•</span> Ansiedade com boletos
                        </li>
                        <li className="flex gap-2 text-left">
                            <span className="text-destructive">•</span> Sem sobras para lazer
                        </li>
                    </ul>
                </div>

                {/* After */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                        SEU FUTURO
                    </div>
                    <h3 className="font-bold text-primary text-sm uppercase tracking-wider flex items-center gap-2">
                        <Check className="w-4 h-4" /> Com MeuAuxiliar
                    </h3>
                    <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex gap-2 text-left">
                            <span className="text-primary">✓</span> Controle total pelo WhatsApp
                        </li>
                        <li className="flex gap-2 text-left">
                            <span className="text-primary">✓</span> Sobra dinheiro para viver
                        </li>
                        <li className="flex gap-2 text-left">
                            <span className="text-primary">✓</span> Investindo todo mês
                        </li>
                    </ul>
                </div>
            </div>

            {/* PART 2: What's Included */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-luxury space-y-4">
                <h3 className="font-bold text-lg text-center text-foreground">O que está incluso no seu acesso:</h3>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                        <div className="bg-primary/20 p-2 rounded-full text-primary">
                            <Check className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-foreground">Assistente de Voz IA</p>
                            <p className="text-xs text-muted-foreground">Registre gastos mandando áudio</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                        <div className="bg-primary/20 p-2 rounded-full text-primary">
                            <Check className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-foreground">Relatórios Semanais</p>
                            <p className="text-xs text-muted-foreground">Saiba onde cortar gastos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                        <div className="bg-primary/20 p-2 rounded-full text-primary">
                            <Check className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-foreground">Consultoria Financeira</p>
                            <p className="text-xs text-muted-foreground">Dicas personalizadas para você</p>
                        </div>
                    </div>
                </div>
            </div>

            <Button 
                onClick={() => {
                    const eventId = `initconf_${Date.now()}`;
                    
                    // Browser Pixel
                    // @ts-ignore
                    if (window.fbq) {
                        // @ts-ignore
                        window.fbq('track', 'InitiateCheckout', {}, { eventID: eventId });
                    }
                    
                    // CAPI
                    import('@/lib/meta-capi').then(({ sendCapiEvent }) => {
                        sendCapiEvent({
                            eventName: 'InitiateCheckout',
                            eventId: eventId,
                            sourceUrl: window.location.href
                        });
                    });
                    
                    onNext();
                }} 
                className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow animate-pulse"
            >
                Ver Valores Promocionais
            </Button>
        </motion.div>
    </div>
  );
};
