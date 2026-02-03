import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Brain, TrendingUp } from "lucide-react";

interface QuizStep6Props {
  onNext: () => void;
}

export const QuizStep6 = ({ onNext }: QuizStep6Props) => {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-8 bg-background text-foreground">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">E Mais Recursos:</h1>
            <p className="text-lg text-muted-foreground">Além do que já mostramos <strong>também contamos com:</strong></p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-card hover:bg-secondary/50 p-4 rounded-xl border border-border flex flex-col items-center text-center shadow-luxury transition-all hover:scale-105">
                <Brain className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-bold text-sm mb-1">Categorias Automáticas</h3>
                <p className="text-xs text-muted-foreground">Você não precisa criar nada. A IA <strong>identifica e organiza</strong> todos os seus gastos sozinha.</p>
            </div>
            <div className="bg-card hover:bg-secondary/50 p-4 rounded-xl border border-border flex flex-col items-center text-center shadow-luxury transition-all hover:scale-105">
                <Zap className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-bold text-sm mb-1">Sugestões Inteligentes</h3>
                <p className="text-xs text-muted-foreground">Acompanhe dicas como: <strong>"Você está gastando mais em lazer este mês. Fique de olho."</strong></p>
            </div>
            <div className="bg-card hover:bg-secondary/50 p-4 rounded-xl border border-border flex flex-col items-center text-center shadow-luxury transition-all hover:scale-105">
                <TrendingUp className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-bold text-sm mb-1">Análise De Compras</h3>
                <p className="text-xs text-muted-foreground"><strong>Diga o que quer comprar</strong> e a IA te diz: <strong>parcelar, esperar ou pagar à vista.</strong></p>
            </div>
              <div className="bg-card hover:bg-secondary/50 p-4 rounded-xl border border-border flex flex-col items-center text-center shadow-luxury transition-all hover:scale-105">
                 <CheckCircle2 className="w-8 h-8 mb-2 text-primary" />
                 <h3 className="font-bold text-sm mb-1">Controle Sem Esforço</h3>
                 <p className="text-xs text-muted-foreground">O MeuAuxiliar trabalha para você, <strong>você não trabalha para ele.</strong></p>
             </div>
        </div>

        <div className="text-center space-y-4 mb-8">
            <p className="font-semibold text-primary">você receberá treinamento, e outros recursos...</p>
            <p className="text-sm px-4 text-muted-foreground">Nosso diferencial é justamente não ser SÓ uma ferramenta que você vai usar uma vez e esquecer.</p>
             <p className="px-4 font-black text-white text-lg leading-snug">
                Você não precisa de mais dinheiro,<br/>
                <span className="text-primary italic">você precisa de mais organização.</span>
            </p>
        </div>

        <Button onClick={onNext} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
            Continuar
        </Button>
    </div>
  );
};
