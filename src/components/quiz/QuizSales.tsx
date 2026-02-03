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
            <div className="text-center space-y-2">
                <div className="inline-block bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase border border-primary/20">
                    Resultado da Análise
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Você está <span className="text-primary italic">perdendo</span> dinheiro por falta de organização.
                </h1>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Nossa IA identificou falhas graves na sua organização que estão drenando seu dinheiro todos os meses sem você perceber.
                </p>
            </div>

            {/* PART 1: Comparison */}
            <div className="grid grid-cols-1 gap-4 w-full">
                {/* Combined Card */}
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-[2rem] overflow-hidden">
                    <div className="grid grid-cols-2 border-b border-white/[0.05]">
                        <div className="p-4 text-center border-r border-white/[0.05] bg-destructive/5">
                            <span className="text-[8px] font-bold text-destructive uppercase tracking-widest block mb-1">Hoje</span>
                            <span className="text-xs font-bold">Caos Financeiro</span>
                        </div>
                        <div className="p-4 text-center bg-primary/5">
                            <span className="text-[8px] font-bold text-primary uppercase tracking-widest block mb-1">Com IA</span>
                            <span className="text-xs font-bold">Liberdade Total</span>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {[
                            { label: "Registro de Gastos", before: "Manual/Nenhum", after: "Áudio no WhatsApp" },
                            { label: "Visão do Futuro", before: "Nuvem Passageira", after: "Relatórios Claros" },
                            { label: "Sobra de Dinheiro", before: "R$ 0,00", after: "Dinheiro no Bolso" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground font-medium">{item.label}</span>
                                <div className="flex items-center gap-4 text-right">
                                    <span className="text-destructive line-through opacity-50">{item.before}</span>
                                    <span className="text-primary font-bold">{item.after}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price section with Badge */}
            <div className="w-full relative pt-10 pb-4 text-center space-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1 rounded-full shadow-glow animate-bounce z-10">
                    OFERTA VITALÍCIA - 71% OFF
                </div>
                
                <div className="space-y-1">
                    <p className="text-muted-foreground line-through text-lg">De R$ 197,00</p>
                    <p className="text-5xl font-black text-white tracking-tight">R$ 57,00</p>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest">Pagamento Único • Para Sempre</p>
                </div>
            </div>

            <Button 
                onClick={() => {
                    const eventId = `initconf_${Date.now()}`;
                    // @ts-expect-error - fbq is defined in index.html
                    if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: 57.00, currency: 'BRL' }, { eventID: eventId });
                    
                    import('@/lib/meta-capi').then(({ sendCapiEvent }) => {
                        sendCapiEvent({
                            eventName: 'InitiateCheckout',
                            eventId: eventId,
                            sourceUrl: window.location.href,
                            customData: { value: 57.00, currency: 'BRL' }
                        });
                    });
                    
                    onNext();
                }} 
                className="w-full py-8 text-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow transition-transform hover:scale-[1.02] active:scale-95"
            >
                Resgatar Oferta Agora
            </Button>
        </motion.div>
    </div>
  );
};
