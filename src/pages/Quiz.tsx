import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QuizWelcome } from "@/components/quiz/QuizWelcome";
import { QuizStep2 } from "@/components/quiz/QuizStep2";
import { QuizStep3 } from "@/components/quiz/QuizStep3";
import { QuizStep4 } from "@/components/quiz/QuizStep4";
import { QuizStep5 } from "@/components/quiz/QuizStep5";
import { QuizStep6 } from "@/components/quiz/QuizStep6";
import { QuizSales } from "@/components/quiz/QuizSales";
import { QuizStep7 } from "@/components/quiz/QuizStep7";
import { QuizFinalLight } from "@/components/quiz/QuizFinalLight";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const totalSteps = 2; // Welcome, Final
  const progressMap: Record<number, number> = {
    1: 50,
    8: 100
  };
  const progress = progressMap[currentStep] || 0;

  const handleNext = () => {
    if (currentStep === 1) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(8);
      }, 3000);
    }
  };

  const handleBack = () => {
    if (currentStep === 8) {
      setCurrentStep(1);
    }
  };
  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans"
      style={{
        // @ts-expect-error - Custom CSS properties
        "--background": "210 40% 98%",
        "--foreground": "222 47% 11%",
        "--primary": "142 71% 45%", // Emerald 500
        "--primary-foreground": "0 0% 100%",
        "--border": "214 32% 91%",
        "--muted": "210 40% 96%",
        "--muted-foreground": "215 16% 47%",
        "--shadow-glow": "0 0 60px rgba(16, 185, 129, 0.2)"
      } as React.CSSProperties}
    >
      {/* Header with Progress Bar */}
      <header className="p-4 md:p-6 flex flex-col gap-4 max-w-7xl mx-auto w-full z-50 relative">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-primary">MeuAuxiliar</span>
            </div>
            
            {currentStep > 1 && currentStep < 8 && !isAnalyzing && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-transparent">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
            )}
        </div>

        {currentStep < 8 && (
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary shadow-glow transition-all duration-500"
                />
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 w-full mb-10">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center space-y-10 text-center px-6 max-w-sm mx-auto"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center animate-pulse">
                      <span className="font-black text-xl text-primary">AI</span>
                   </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white">Carregando...</h2>
                    <p className="text-muted-foreground text-sm font-medium">Liberando seu acesso e aplicando desconto exclusivo...</p>
                </div>

                <div className="space-y-3 text-left">
                   {[
                      "Garantindo sua vaga no Vitalício",
                      "Aplicando cupom de 71% OFF",
                      "Configurando seu número no WhatsApp",
                      "Preparando página de pagamento segura"
                   ].map((text, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.5 }}
                        className="flex items-center gap-3 text-sm font-medium text-foreground/80"
                      >
                         <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                         </div>
                         {text}
                      </motion.div>
                   ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full"
                >
                  <QuizWelcome onStart={handleNext} />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizStep2 onNext={handleNext} />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizStep3 onNext={handleNext} />
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizStep4 onNext={handleNext} />
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizStep5 onNext={handleNext} />
                </motion.div>
              )}

               {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizStep6 onNext={handleNext} />
                </motion.div>
              )}

               {currentStep === 7 && (
                <motion.div
                  key="sales"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizSales onNext={handleNext} />
                </motion.div>
              )}

               {currentStep === 8 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizFinalLight />
                </motion.div>
              )}


            </>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MeuAuxiliar. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:underline hover:text-primary">Privacidade</a>
            <a href="#" className="hover:underline hover:text-primary">Termos</a>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
