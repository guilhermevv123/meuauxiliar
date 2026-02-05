import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Users, Gift } from "lucide-react";
import { useState } from "react";

interface QuizSalesV2Props {
  onNext: () => void;
}

export const QuizSalesV2 = ({ onNext }: QuizSalesV2Props) => {
  const [sharing, setSharing] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const handleShare = () => {
    const text = encodeURIComponent("Olha que legal essa IA que organiza os gastos pelo WhatsApp! Acabei de garantir meu desconto aqui: " + window.location.href);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    
    // Complete sharing immediately for better conversion
    setShareCount(3);
    setTimeout(() => {
        onNext(); // Auto-proceed to the discounted final page
    }, 500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto min-h-[80vh] px-4 py-8 bg-background text-foreground">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
        >
            <div className="text-center space-y-2">
                <div className="inline-block bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase border border-primary/20">
                    Sugestão de Plano
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Plano Anual: Liberdade Financeira Garantida.
                </h1>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-[2rem] overflow-hidden p-6 space-y-6">
                <div className="space-y-4">
                    {[
                        "Acesso Ilimitado por 12 meses",
                        "Todos os recursos de IA liberados",
                        "Suporte prioritário via WhatsApp",
                        "Relatórios semanais detalhados"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground/80">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 text-center space-y-1">
                    <p className="text-muted-foreground line-through text-sm">De R$ 497,00</p>
                    <p className="text-4xl font-black text-white">12x R$ 16,41</p>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest">Ou R$ 197,00 à vista</p>
                </div>
            </div>

            <div className="space-y-4">
                <Button 
                    onClick={() => window.open('https://pay.kirvano.com/a05555c3-5d05-42dc-b947-1082076810bb', '_blank')}
                    className="w-full py-8 text-xl font-black bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl transition-all"
                >
                    Assinar Plano Anual (16,41/mês)
                </Button>

                <div className="relative p-6 bg-primary/5 rounded-2xl border border-primary/20 overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                    
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <Gift className="w-5 h-5 text-primary animate-bounce" />
                            <h3 className="font-bold text-primary uppercase tracking-tight">Presente de Amigo: Consiga mais desconto</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Compartilhe o MeuAuxiliar com 3 amigos no WhatsApp para liberar um cupom secreto e baixar ainda mais o preço.
                        </p>
                        
                        <div className="space-y-2">
                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-primary"
                                    animate={{ width: `${(shareCount / 3) * 100}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">
                                {shareCount} de 3 compartilhamentos concluídos
                            </p>
                        </div>

                        <Button 
                            onClick={handleShare}
                            className="w-full py-6 font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-glow flex items-center justify-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            Compartilhar Agora
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
