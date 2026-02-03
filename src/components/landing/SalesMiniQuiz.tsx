import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertCircle, TrendingDown, Wallet, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

const questions = [
    {
        id: 1,
        question: "Qual sua maior dificuldade financeira hoje?",
        options: [
            { label: "Ver o dinheiro sumindo", icon: TrendingDown, color: "text-red-400" },
            { label: "Muitas dívidas acumuladas", icon: AlertCircle, color: "text-orange-400" },
            { label: "Não consigo fazer reserva", icon: Wallet, color: "text-blue-400" },
            { label: "Preguiça/Falta de tempo", icon: ClipboardCheck, color: "text-purple-400" },
        ]
    },
    {
        id: 2,
        question: "Como você se sente ao final do mês?",
        options: [
            { label: "Ansioso e estressado", color: "text-red-400" },
            { label: "Frustrado, trabalho e não vejo cor", color: "text-orange-400" },
            { label: "Perdido, não sei onde gastei", color: "text-blue-400" },
            { label: "Confortável, mas quero melhorar", color: "text-green-400" },
        ]
    }
];

export const SalesMiniQuiz = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = (index: number) => {
        const newAnswers = [...answers, index];
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-card/50 border border-border/50 rounded-3xl p-8 backdrop-blur-sm shadow-luxury">
            <AnimatePresence mode="wait">
                {!isFinished ? (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <span className="text-primary font-bold text-xs uppercase tracking-widest">
                                Passo {currentStep + 1} de {questions.length}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-black leading-tight text-white">
                                {questions[currentStep].question}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {questions[currentStep].options.map((option, idx) => {
                                const Icon = option.icon;
                                return (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        onClick={() => handleAnswer(idx)}
                                        className="group flex items-center justify-start gap-4 p-6 rounded-2xl border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left whitespace-normal h-auto py-5"
                                    >
                                        {Icon && <Icon className={`w-5 h-5 shrink-0 ${option.color}`} />}
                                        <span className="text-base font-medium transition-colors group-hover:text-primary">
                                            {option.label}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 py-4"
                    >
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>

                        <div className="space-y-4 text-center">
                            <h3 className="text-3xl font-black text-white">Análise Preliminar Concluída</h3>
                            <p className="text-xl text-white/80 leading-relaxed">
                                Com os seus dados, o <strong className="text-primary underline decoration-primary underline-offset-4">MeuAuxiliar</strong> identificou que o seu maior problema não é a falta de dinheiro, mas o <span className="text-red-400 font-bold italic">vazamento invisível</span> por falta de organização.
                            </p>
                        </div>

                        <div className="bg-white/10 border-2 border-primary/40 rounded-[2rem] p-8 text-lg text-white font-bold shadow-xl">
                            Nossa IA vai atuar como seu guardião financeiro 24h por dia via WhatsApp. Vamos estancar esse vazamento imediatamente.
                        </div>

                        <Link to="/quiz" className="block w-full group">
                            <Button size="lg" className="w-full bg-gradient-purple shadow-glow text-lg py-8 rounded-2xl group-hover:scale-[1.02] active:scale-95 transition-all">
                                Resgatar Meu Acesso Grátis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
