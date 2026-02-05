import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Lock, Star } from "lucide-react";

export const QuizFinalV2 = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-8 bg-transparent text-slate-900 space-y-12">
        <div className="text-center space-y-4">
            <div className="inline-block bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase border border-primary/20">
                Desconto Amigo Aplicado
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-900">
                Parabéns! Você liberou o preço de <span className="text-primary italic">12x R$ 12,25</span>.
            </h1>
            <p className="text-slate-500 text-sm font-medium">
                Sua ajuda para divulgar o MeuAuxiliar garantiu esse desconto histórico. Aproveite!
            </p>
        </div>

        <div className="w-full space-y-8">
            <div className="bg-white border border-primary/20 rounded-3xl p-8 text-center space-y-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-3">
                    <Star className="w-6 h-6 text-primary fill-primary opacity-20" />
                </div>
                
                <div className="space-y-1">
                    <p className="text-slate-400 line-through text-sm">De R$ 197,00 (Anual)</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tight">12x R$ 12,25</p>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest">Ou R$ 147,00 à vista</p>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                    <Button 
                        size="lg"
                        onClick={() => window.open('https://pay.kirvano.com/5c67223b-590f-4639-95fd-a71bbc9b5e59', '_blank')}
                        className="w-full py-8 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg"
                    >
                        Garantir Meu Plano Agora
                    </Button>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                        Acesso liberado imediatamente após o pagamento
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">Compra Segura SSL</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">Dados Protegidos</span>
                </div>
            </div>

            <div className="text-center">
                <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                    ))}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                    "Melhor investimento que fiz no ano. A IA realmente mudou minha relação com o dinheiro."
                </p>
            </div>
        </div>
    </div>
  );
};
