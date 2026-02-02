import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, Eye, TrendingUp, HandCoins } from "lucide-react";
import { Link } from "react-router-dom";

const questions = [
    {
        id: 1,
        question: "Você sente que seu dinheiro some da conta sem você nem perceber?",
        icon: Eye,
        color: "text-red-400",
        description: "Aquela sensação de 'trabalhei o mês todo e não sei onde o dinheiro foi'."
    },
    {
        id: 2,
        question: "Quantas planilhas você já começou e abandonou por serem chatas de manter?",
        icon: AlertTriangle,
        color: "text-orange-400",
        description: "O problema não é você, o problema é o método antigo e manual."
    },
    {
        id: 3,
        question: "Se você recuperasse R$ 6.000 por ano apenas mandando áudios, você faria?",
        icon: HandCoins,
        color: "text-green-400",
        description: "É isso que a organização média economiza para nossos usuários."
    },
    {
        id: 4,
        question: "Você prefere continuar no escuro ou ter clareza total em 10 segundos?",
        icon: TrendingUp,
        color: "text-blue-400",
        description: "A decisão entre a dúvida constante ou o controle absoluto."
    }
];

export const PersuasiveAssessment = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-4">
            <AnimatePresence mode="wait">
                {!isFinished ? (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[3rem] p-8 md:p-12 shadow-luxury overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-purple" />

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="bg-primary/10 p-5 rounded-3xl shrink-0">
                                {(() => {
                                    const Icon = questions[currentStep].icon;
                                    return <Icon className={`w-10 h-10 ${questions[currentStep].color}`} />;
                                })()}
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">DESAFIO {currentStep + 1}/4</span>
                                    <h3 className="text-3xl md:text-5xl font-black leading-tight text-white mb-4">
                                        {questions[currentStep].question}
                                    </h3>
                                    <p className="text-xl md:text-2xl text-white/70 font-bold leading-relaxed">
                                        {questions[currentStep].description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        onClick={handleNext}
                                        size="lg"
                                        className="flex-1 py-10 text-xl font-bold rounded-2xl bg-white text-black hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                                    >
                                        Sim, eu sinto isso
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        size="lg"
                                        variant="outline"
                                        className="flex-1 py-10 text-xl font-bold rounded-2xl border-white/20 text-white hover:bg-white/5 transition-all active:scale-95"
                                    >
                                        Talvez...
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-purple p-1px rounded-[3.5rem] shadow-glow"
                    >
                        <div className="bg-black/90 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-16 text-center space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    Seu diagnóstico: <br />
                                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent italic">Vazamento Financeiro Crítico</span>
                                </h3>
                                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
                                    O que te falta não é mais dinheiro. <br className="hidden md:block" />
                                    <span className="text-primary font-black underline decoration-primary underline-offset-[12px]">O que te falta é ORGANIZAÇÃO.</span>
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 text-left">
                                <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 shadow-xl">
                                    <p className="text-white/80 text-sm font-black uppercase tracking-[0.2em] mb-3">Impacto Anual Estimado</p>
                                    <p className="text-5xl font-black text-primary">R$ 6.420,00</p>
                                    <p className="text-white/60 text-xs mt-3 italic font-medium">Baseado no desperdício médio por falta de controle.</p>
                                </div>
                                <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 shadow-xl">
                                    <p className="text-white/80 text-sm font-black uppercase tracking-[0.2em] mb-3">Esforço Necessário</p>
                                    <p className="text-5xl font-black text-purple-400">Zero Apps</p>
                                    <p className="text-white/60 text-xs mt-3 italic font-medium">Tudo através do WhatsApp que você já usa.</p>
                                </div>
                            </div>

                            <div className="pt-10">
                                <Link to="/quiz">
                                    <Button size="lg" className="w-full md:w-auto px-20 py-12 text-3xl font-black bg-primary text-black rounded-3xl hover:scale-105 transition-all shadow-glow active:scale-95">
                                        PARAR O VAZAMENTO AGORA
                                        <ArrowRight className="ml-4 h-10 w-10" />
                                    </Button>
                                </Link>
                                <p className="mt-8 text-white/60 text-base font-black uppercase tracking-[0.1em]">
                                    Teste 100% Grátis • Configuração em 30 segundos
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
