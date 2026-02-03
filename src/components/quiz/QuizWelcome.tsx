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
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            IA Financeira Pessoal
          </p>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
            Economize <span className="text-primary">+R$ 400</span> em 30 Dias apenas usando o WhatsApp.
          </h1>
          
          <p className="text-muted-foreground text-sm">
            Sem planilhas complicadas. Sem aplicativos chatos.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4 text-left shadow-sm"
      >
        <div className="flex items-start gap-3">
            <div className="bg-destructive/10 p-1.5 rounded-full mt-0.5">
                <X className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-sm text-foreground">
                <strong className="block text-destructive mb-0.5">Dinheiro sumindo?</strong>
                Você trabalha muito e não vê a cor do dinheiro.
            </p>
        </div>

        <div className="flex items-start gap-3">
            <div className="bg-destructive/10 p-1.5 rounded-full mt-0.5">
                <X className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-sm text-foreground">
                <strong className="block text-destructive mb-0.5">Preguiça de anotar?</strong>
                Apps e planilhas são chatos e difíceis de manter.
            </p>
        </div>

        <div className="h-px bg-border/50 w-full my-2" />

        <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                <Check className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground">
                <strong className="block text-primary mb-0.5">A Solução Definitiva</strong>
                Mande áudios no WhatsApp e a IA organiza tudo.
            </p>
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
            Teste Grátis • Cancelamento Fácil
        </p>
      </motion.div>
    </div>
  );
};
