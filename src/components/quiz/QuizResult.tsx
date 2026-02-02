import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Lock, MessageCircle } from "lucide-react";

export const QuizResult = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8 max-w-2xl mx-auto py-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold">
          Sua Análise Está Pronta!
        </h1>
        <p className="text-xl text-muted-foreground">
          Identificamos que você pode economizar até <strong>R$ 480,00</strong> logo no primeiro mês com pequenas otimizações.
        </p>
      </div>

      <div className="w-full bg-card border rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-left">Seu Plano Personalizado Inclui:</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 text-left">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium">Assistente no WhatsApp</h4>
              <p className="text-sm text-muted-foreground">Controle tudo mandando áudios ou texto como se falasse com um amigo.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium">Segurança Total</h4>
              <p className="text-sm text-muted-foreground">Seus dados são criptografados e você tem privacidade absoluta.</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-bold animate-pulse shadow-xl shadow-primary/20"
            onClick={() => window.location.href = '#'} 
          >
            LIBERAR MEU ACESSO AGORA
          </Button>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Pagamento seguro • Satisfação garantida</span>
          </div>
        </div>
      </div>
    </div>
  );
};
