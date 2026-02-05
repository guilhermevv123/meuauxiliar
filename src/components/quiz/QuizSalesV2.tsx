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
    <div className="flex flex-col items-center w-full max-w-lg mx-auto min-h-[80vh] px-4 py-8 bg-transparent text-slate-900">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
        >
            <div className="text-center space-y-2">
                <div className="inline-block bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase border border-primary/20">
                    Sugestão de Plano
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                    Plano Anual: Liberdade Financeira Garantida.
                </h1>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden p-6 space-y-6 shadow-sm">
                <div className="space-y-4">
                    {[
                        "Acesso Ilimitado por 12 meses",
                        "Todos os recursos de IA liberados",
                        "Suporte prioritário via WhatsApp",
                        "Relatórios semanais detalhados"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-slate-100 text-center space-y-1">
                    <p className="text-slate-400 line-through text-sm">De R$ 497,00</p>
                    <p className="text-4xl font-black text-slate-900">12x R$ 16,41</p>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest">Ou R$ 197,00 à vista</p>
                </div>
            </div>

            <div className="space-y-4">
                <Button 
                    onClick={() => window.open('https://pay.kirvano.com/a05555c3-5d05-42dc-b947-1082076810bb', '_blank')}
                    className="w-full py-8 text-xl font-black bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-2xl transition-all shadow-lg"
                >
                    Assinar Plano Anual (16,41/mês)
                </Button>

                <div className="relative p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-200 overflow-hidden group shadow-[0_5px_20px_rgba(16,185,129,0.1)] transition-all hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-all" />
                    
                    <div className="relative z-10 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-200 shrink-0">
                                <Gift className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-black text-emerald-600 text-xl md:text-2xl uppercase tracking-tighter leading-none">
                                QUER GANHAR R$ 50 DE DESCONTO AGORA?
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-bold">
                                É simples: Compartilhe o MeuAuxiliar com 3 amigos no WhatsApp e libere um cupom secreto para baixar seu plano para apenas <span className="text-emerald-500 underline decoration-2 underline-offset-4 font-black italic">R$ 12,25/mês</span>.
                            </p>
                            
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest">
                                        Seu progresso:
                                    </p>
                                    <p className="text-xs font-black text-emerald-600">
                                        {shareCount} de 3 CONCLUÍDOS
                                    </p>
                                </div>
                                <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-emerald-100 p-0.5">
                                    <motion.div 
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                        animate={{ width: `${(shareCount / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleShare}
                            className="w-full py-8 text-lg font-black bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-95 group/btn"
                        >
                            <Users className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                            LIBERAR MEU DESCONTO AGORA
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
