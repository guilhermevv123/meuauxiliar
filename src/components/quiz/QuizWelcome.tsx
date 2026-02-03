import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface QuizWelcomeProps {
  onStart: () => void;
}

export const QuizWelcome = ({ onStart }: QuizWelcomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-6 max-w-lg mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase opacity-80">
            IA FINANCEIRA PESSOAL
          </p>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Você não precisa de mais dinheiro,<br />
            <span className="text-primary italic">precisa de mais organização.</span>
          </h1>
          
          <p className="text-muted-foreground text-sm font-medium">
            Está cansado de chegar no final do mês sem dinheiro?
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-7 text-left shadow-2xl backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-[80px]" />
        
        <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-destructive text-base leading-none">Dinheiro sumindo?</h3>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                    Você trabalha muito e não vê a cor do dinheiro.
                </p>
            </div>
        </div>

        <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-destructive text-base leading-none">Preguiça de anotar?</h3>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                    Apps e planilhas são chatos e difíceis de manter.
                </p>
            </div>
        </div>

        <div className="h-px bg-white/5 w-full !my-4" />

        <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Check className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-primary text-base leading-none">A Solução Definitiva</h3>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                    Mande áudios no WhatsApp e a IA organiza tudo.
                </p>
            </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full pt-2"
      >
        <Button 
          size="lg" 
          className="w-full text-lg font-bold py-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow transition-all active:scale-95"
          onClick={onStart}
        >
          Começar Agora
        </Button>
        <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider">
            GRÁTIS • CANCELAMENTO FÁCIL
        </p>
      </motion.div>
    </div>
  );
};
