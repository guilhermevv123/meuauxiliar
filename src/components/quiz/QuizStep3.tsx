import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizStep3Props {
  onNext: () => void;
}

export const QuizStep3 = ({ onNext }: QuizStep3Props) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', text: React.ReactNode}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const hasSubmittedRef = useRef(false);

  const handleStartDemo = () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    // User message
    setTimeout(() => {
        setMessages(prev => [...prev, { type: 'user', text: "Quanto eu gastei nos últimos 7 dias?" }]);
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            type: 'bot', 
            text: (
              <div className="text-left">
                Os gastos aumentaram nesta semana em comparação com a semana passada, totalizando R$157,00 a mais.<br/><br/>
                O principal motivo foi a compra de <strong>gás de cozinha, realizada na Segunda-feira e na Quarta-feira.</strong>
              </div>
            ) 
          }]);
          setTimeout(() => setShowButton(true), 500);
        }, 1500);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-8"
      >
        <div className="text-center space-y-4">
             <div className="inline-block bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold shadow-glow">
                Demonstração
            </div>
            <div className="flex items-start gap-4 justify-center">
                <span className="text-4xl text-primary font-extrabold">2.</span>
                <div className="text-left">
                    <p className="text-lg text-muted-foreground">Você pode perguntar TUDO SOBRE SUAS FINANÇAS.</p>
                </div>
            </div>
        </div>

        <div className="w-full bg-card border border-border rounded-3xl p-4 min-h-[400px] flex flex-col shadow-luxury relative">
             <div className="flex-1 overflow-y-auto space-y-4 pb-20">
                <p className="text-sm font-semibold text-foreground/80 text-center mt-8">
                    Exemplo: Digamos que você quer ver quanto gastou nos últimos 7 dias:
                </p>

                {!hasSubmittedRef.current && (
                    <Button 
                        onClick={handleStartDemo}
                        className="w-full h-14 bg-gradient-purple hover:opacity-90 text-white font-semibold rounded-full animate-bounce shadow-lg"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Quanto eu gastei nos últimos 7 dias?
                    </Button>
                )}

                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                msg.type === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                    : 'bg-secondary text-secondary-foreground rounded-tl-none border border-border'
                            }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                             <div className="bg-secondary p-3 rounded-2xl rounded-tl-none border border-border">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-200"></span>
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {showButton && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
             >
                <h2 className="text-center text-foreground text-base">
                    Você nunca mais vai se fazer a pergunta <strong>"onde que eu gastei tanto esse mês"</strong>, sem ter a resposta.
                </h2>
                <Button onClick={onNext} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                    Continuar
                </Button>
             </motion.div>
        )}
      </motion.div>
    </div>
  );
};
