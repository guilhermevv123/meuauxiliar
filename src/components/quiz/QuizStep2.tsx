import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuizStep2Props {
  onNext: () => void;
}

export const QuizStep2 = ({ onNext }: QuizStep2Props) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', text: React.ReactNode}>>([]);
  const [inputValue, setInputValue] = useState("Camisa 110");
  const [isTyping, setIsTyping] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const hasSubmittedRef = useRef(false);

  const handleSubmit = async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    // User message
    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    
    // Typing simulation
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: (
          <div className="text-left">
            <strong>Gasto adicionado</strong><br/>
            📌 Camisa  (Roupas)<br/>
            <strong> R$ 110,00</strong><br/><br/>
            {new Date().toLocaleDateString()}
          </div>
        ) 
      }]);
      
      setTimeout(() => setShowButton(true), 500);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-8"
      >
        <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Como Funciona?</h1>
            <p className="text-lg text-muted-foreground">
                Somos um assistente financeiro disponível <strong>no seu WhatsApp</strong>, disponível 24h para ser seu <strong>controle financeiro interativo.</strong>
            </p>
        </div>

        <div className="w-full bg-card border border-border rounded-3xl p-4 min-h-[400px] flex flex-col relative shadow-luxury">
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold z-10 shadow-glow">
                Demonstração
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pt-12 pb-20">
                <div className="flex items-start gap-4 p-4 text-foreground/80">
                    <span className="text-4xl text-primary font-extrabold">1.</span>
                    <div>
                        Digite o que comprou, e o quanto gastou, por exemplo <strong>"Calça 110"</strong>.<br/><br/>
                        Registre um gasto para testar<br/><br/>
                        <small className="italic text-muted-foreground">(Não se preocupe com vírgulas ou com R$, escreva do seu jeito)</small>
                    </div>
                </div>

                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
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

            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <Input 
                    value={inputValue}
                    readOnly
                    className="rounded-full border-border bg-background shadow-sm"
                />
                <Button 
                    onClick={handleSubmit} 
                    disabled={hasSubmittedRef.current}
                    className="rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 shadow-glow"
                >
                    {hasSubmittedRef.current ? <Check className="w-5 h-5 text-primary-foreground" /> : <Send className="w-5 h-5 text-primary-foreground" />}
                </Button>
            </div>
        </div>

        {showButton && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
             >
                <Button onClick={onNext} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                    Continuar
                </Button>
             </motion.div>
        )}
      </motion.div>
    </div>
  );
};
