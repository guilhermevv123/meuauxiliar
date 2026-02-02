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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(1);


  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-50 relative">
        <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-primary">MeuAuxiliar</span>
        </div>
        
        {currentStep > 1 && currentStep < 8 && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-transparent">
              <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 w-full mb-10">
        <AnimatePresence mode="wait">
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
              <QuizStep7 />
            </motion.div>
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
