import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface QuizStep4Props {
  onNext: () => void;
}

export const QuizStep4 = ({ onNext }: QuizStep4Props) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1000); // Show Reminder
    const timer2 = setTimeout(() => setStep(2), 3000); // Show Spending Limit
    
    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-6 bg-background text-foreground">
      <div className="w-full space-y-12">
        {/* Section 3: Reminders */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4"
        >
            <div className="text-primary font-bold text-4xl">3.</div>
            <div className="space-y-4 w-full">
                <div className="text-xl font-medium">
                    Defina lembretes para pagar contas e não esqueça de nada <span className="italic text-muted-foreground text-base">(para uma conta única, ou frequente).</span>
                </div>
                
                <div className="space-y-2 w-full">
                     <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] text-sm shadow-md">
                        Boleto do carro todo dia 12, R$ 1300
                     </div>
                     <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-tl-none mr-auto max-w-[85%] text-sm border border-border">
                        Lembrete adicionado<br/>
                        <span className="text-destructive font-bold">📌 Boleto do carro</span><br/>
                        Data: 12<br/>
                        Frequência: Mensal
                     </div>
                </div>
            </div>
        </motion.div>

        {/* Section 4: Advance Reminders */}
        {step >= 1 && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4"
            >
                <div className="text-primary font-bold text-4xl">4.</div>
                <div className="space-y-4 w-full">
                    <div className="text-xl font-medium">
                        E seja lembrado com antecedência.
                    </div>
                    
                    <div className="space-y-2 w-full">
                        <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-tl-none mr-auto max-w-[85%] text-sm border border-border">
                            💡 Lembrete: Boleto Carro
                        </div>
                        <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] text-sm shadow-md">
                            paguei já
                        </div>
                        <div className="bg-secondary text-secondary-foreground p-3 rounded-2xl rounded-tl-none mr-auto max-w-[85%] text-sm border border-border">
                            Te lembro de novo mês que vem ✅
                        </div>
                    </div>
                </div>
            </motion.div>
        )}

        {/* Section 5: Limits */}
        {step >= 2 && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4"
            >
                <div className="text-primary font-bold text-4xl">5.</div>
                <div className="space-y-4 w-full">
                    <div className="text-xl font-medium">
                        Defina limites de gastos por categoria. <span className="font-bold text-primary">Controle quanto quer gastar.</span>
                    </div>
                    
                    <div className="w-full bg-card border border-border rounded-xl p-4 shadow-luxury">
                        <h4 className="text-center text-sm text-muted-foreground mb-2">Relatório</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Lazer</span>
                                    <span className="text-primary font-bold">60%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[60%] shadow-glow"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Delivery</span>
                                    <span className="text-primary font-bold">84%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[84%] shadow-glow"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Button onClick={onNext} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow mt-4">
                        Continuar
                    </Button>
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
};
