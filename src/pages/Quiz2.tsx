import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QuizWelcome } from "@/components/quiz/QuizWelcome";
import { QuizSalesV2 } from "@/components/quiz/QuizSalesV2";
import { QuizFinalV2 } from "@/components/quiz/QuizFinalV2";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Quiz2 = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Steps: 1: Welcome, 7: SalesV2, 8: FinalV2
  const totalSteps = 3; 
  const progressMap: Record<number, number> = {
    1: 33,
    7: 66,
    8: 100
  };
  const progress = progressMap[currentStep] || 0;

  const handleNext = () => {
    if (currentStep === 1) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(7);
        
        // Tracking InitiateCheckout
        const eventId = `checkout_init_${Date.now()}`;
        // Pixel
        // @ts-expect-error - fbq is in index.html
        if (window.fbq) window.fbq('track', 'InitiateCheckout', {}, { eventID: eventId });
        // CAPI
        import('@/lib/meta-capi').then(({ sendCapiEvent }) => {
          sendCapiEvent({
            eventName: 'InitiateCheckout',
            eventId: eventId,
            sourceUrl: window.location.href
          });
        });
      }, 3000);
    } else if (currentStep === 7) {
      setCurrentStep(8);
    }
  };

  const handleBack = () => {
    if (currentStep === 7) {
      setCurrentStep(1);
    } else if (currentStep === 8) {
      setCurrentStep(7);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden font-sans"
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
      <header className="p-4 md:p-6 flex flex-col gap-4 max-w-7xl mx-auto w-full z-50 relative">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-primary">MeuAuxiliar</span>
            </div>
            
            {currentStep > 1 && !isAnalyzing && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-slate-100">
                  <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" />
                </Button>
            )}
        </div>

        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary shadow-glow transition-all duration-500"
            />
        </div>
      </header>

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
                    <h2 className="text-3xl font-black text-slate-900">Configurando...</h2>
                    <p className="text-slate-500 text-sm font-medium">Preparando sua oferta exclusiva do Plano Anual...</p>
                </div>

                <div className="space-y-3 text-left">
                   {[
                      "Analisando perfil de gastos",
                      "Calculando projeção anual",
                      "Liberando bônus exclusivos",
                      "Aplicando melhor oferta disponível"
                   ].map((text, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.5 }}
                        className="flex items-center gap-3 text-sm font-medium text-slate-600"
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

              {currentStep === 7 && (
                <motion.div
                  key="sales2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizSalesV2 onNext={handleNext} />
                </motion.div>
              )}

              {currentStep === 8 && (
                <motion.div
                  key="final2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuizFinalV2 />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="p-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} MeuAuxiliar. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Quiz2;
