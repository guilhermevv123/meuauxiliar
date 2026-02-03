import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PieChart, Mic } from "lucide-react";

interface QuizStep5Props {
  onNext: () => void;
}

export const QuizStep5 = ({ onNext }: QuizStep5Props) => {
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowVoice(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-6 bg-background text-foreground">
      <div className="w-full space-y-12">
        {/* Section 6: Reports */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4"
        >
            <div className="text-primary font-bold text-4xl">6.</div>
            <div className="space-y-4 w-full">
                <div className="text-xl font-medium">
                    Relatórios Automáticos
                </div>
                <p className="text-muted-foreground">
                    Receba resumos semanais e mensais direto no WhatsApp. Saiba exatamente onde cortar gastos sem esforço.
                </p>
                
                <div className="space-y-2 w-full">
                     <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-tl-none mr-auto max-w-[90%] text-sm border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                            <PieChart className="w-4 h-4 text-primary" />
                            <span className="font-bold text-xs uppercase tracking-wider">Resumo Semanal</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span>🍔 Alimentação</span>
                                <span className="font-bold text-foreground">R$ 450,00</span>
                            </div>
                            <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[70%]"></div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                                <span>🚗 Transporte</span>
                                <span className="font-bold text-foreground">R$ 200,00</span>
                            </div>
                            <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-400 w-[30%]"></div>
                            </div>
                        </div>
                        <div className="mt-3 text-[10px] text-muted-foreground italic">
                            "Você gastou 15% a menos que semana passada! Parabéns."
                        </div>
                     </div>
                </div>
            </div>
        </motion.div>

        {/* Section 7: Voice Input */}
        {showVoice && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4"
            >
                <div className="text-primary font-bold text-4xl">7.</div>
                <div className="space-y-4 w-full">
                    <div className="text-xl font-medium">
                        Tem preguiça de digitar?
                    </div>
                    <p className="text-muted-foreground">
                        Mande um áudio de 3 segundos. Nossa IA entende tudo, transcreve e categoriza na hora.
                    </p>
                    
                    <div className="space-y-2 w-full">
                        <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] text-sm shadow-md flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                <Mic className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="h-1 bg-white/40 rounded-full w-[80%]"></div>
                                <span className="text-[10px] opacity-80">0:04 • Áudio</span>
                            </div>
                        </div>
                        <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-tl-none mr-auto max-w-[90%] text-sm border border-border">
                            ✅ Entendido!<br/>
                            Adicionei <strong>R$ 45,00</strong> em <strong>Padaria</strong> (Alimentação).
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
        
        {showVoice && (
             <Button onClick={onNext} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow mt-4">
                Ver Planos
            </Button>
        )}
      </div>
    </div>
  );
};
