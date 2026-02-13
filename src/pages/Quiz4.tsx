import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { QuizStep1 } from "@/components/quiz/QuizStep1";

// Importing Quiz Steps
import { QuizStep2 } from "@/components/quiz/QuizStep2";
import { QuizStep3 } from "@/components/quiz/QuizStep3";
import { QuizStep4 } from "@/components/quiz/QuizStep4";
import { QuizStep5 } from "@/components/quiz/QuizStep5";
import { QuizStep6 } from "@/components/quiz/QuizStep6";
import { Quiz4Offer } from "@/components/quiz/Quiz4Offer"; // The NEW Dual Offer

const Quiz4 = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to advance steps
  const handleNext = () => {
    if (currentStep === 1) {
        // Start Quiz > Go to Step 2
        setCurrentStep(2);
        window.scrollTo(0, 0);
    } else if (currentStep >= 2 && currentStep < 6) {
        // Normal Steps
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    } else if (currentStep === 6) {
        // Before Offer > Analyzing State
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setCurrentStep(7); // Show Offer
            window.scrollTo(0, 0);
        }, 3000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div 
        className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-violet-500/30"
        style={{
            // @ts-expect-error - Custom CSS properties for Light Mode override
            "--background": "0 0% 100%",
            "--foreground": "222 47% 11%",
            "--card": "0 0% 100%",
            "--card-foreground": "222 47% 11%",
            "--popover": "0 0% 100%",
            "--popover-foreground": "222 47% 11%",
            "--primary": "262 83% 58%", // Violet
            "--primary-foreground": "0 0% 100%",
            "--secondary": "210 40% 96.1%",
            "--secondary-foreground": "222 47% 11.2%",
            "--muted": "210 40% 96.1%",
            "--muted-foreground": "215 16% 47%",
            "--accent": "210 40% 96.1%",
            "--accent-foreground": "222 47% 11.2%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "210 40% 98%",
            "--border": "214.3 31.8% 91.4%",
            "--input": "214.3 31.8% 91.4%",
            "--ring": "262 83% 58%",
        } as React.CSSProperties}
    >
        
      {/* Header (Only show simplified header on Step 1, or generic header on Quiz steps) */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 1 && !isAnalyzing && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-slate-100 -ml-2">
                  <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" />
                </Button>
            )}
            <span className="font-bold text-xl tracking-tight text-violet-600">MeuAuxiliar</span>
          </div>
          
          {currentStep === 1 && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-slate-600 hover:text-violet-600 hover:bg-violet-50"
                onClick={handleNext}
              >
                Entrar
              </Button>
          )}
        </div>
        
        {/* Progress Bar for Quiz Steps */}
        {currentStep > 1 && currentStep < 7 && !isAnalyzing && (
            <div className="w-full h-1 bg-slate-100">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                    className="h-full bg-violet-600 transition-all duration-500"
                />
            </div>
        )}
      </header>

      <main className="pt-24 pb-20 px-4 max-w-md mx-auto space-y-20 min-h-screen flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* ANALYSIS LOADING STATE */}
            {isAnalyzing ? (
                <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-10 text-center px-6"
                >
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-black text-xl text-violet-600 animate-pulse">AI</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900">Analisando Perfil...</h2>
                        <div className="space-y-3 text-left max-w-xs mx-auto">
                            {["Calculando economia potencial", "Verificando planos disponíveis", "Gerando plano personalizado"].map((text, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.8 }}
                                    className="flex items-center gap-3 text-sm font-medium text-slate-600"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                                    {text}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>

                    {/* STEP 1: LANDING PAGE (Grid Layout) */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -100 }}
                        >
                            <QuizStep1 onNext={handleNext} />
                        </motion.div>
                    )}

                    {/* QUIZ STEPS */}
                    {currentStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <QuizStep2 onNext={handleNext} />
                        </motion.div>
                    )}
                    {currentStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <QuizStep3 onNext={handleNext} />
                        </motion.div>
                    )}
                    {currentStep === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <QuizStep4 onNext={handleNext} />
                        </motion.div>
                    )}
                    {currentStep === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <QuizStep5 onNext={handleNext} />
                        </motion.div>
                    )}
                    {currentStep === 6 && (
                        <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <QuizStep6 onNext={handleNext} />
                        </motion.div>
                    )}

                    {/* FINAL OFFER (STEP 7) - QUIZ 4 VERSION */}
                    {currentStep === 7 && (
                        <motion.div key="offer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Quiz4Offer />
                        </motion.div>
                    )}
                </>
            )}
          </AnimatePresence>
      </main>

      {currentStep === 1 && (
        <footer className="py-10 text-center text-slate-400 text-xs border-t border-slate-200 bg-white">
            <p>&copy; {new Date().getFullYear()} MeuAuxiliar. Todos os direitos reservados.</p>
        </footer>
      )}
    </div>
  );
};

export default Quiz4;
