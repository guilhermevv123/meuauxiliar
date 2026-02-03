import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface QuizLoadingProps {
  onComplete: () => void;
}

const TEXTS = [
  "Analisando suas respostas...",
  "Identificando padrões de gastos...",
  "Calculando economia potencial...",
  "Gerando seu plano personalizado...",
];

export const QuizLoading = ({ onComplete }: QuizLoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const totalDuration = 4000; // 4 seconds total
    const intervalTime = 50;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      // Change text every 25% progress
      const newTextIndex = Math.min(Math.floor((newProgress / 100) * TEXTS.length), TEXTS.length - 1);
      setTextIndex(newTextIndex);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-md mx-auto text-center space-y-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-16 h-16 text-primary" />
      </motion.div>

      <div className="space-y-4 w-full">
        <motion.h2
          key={textIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-semibold"
        >
          {TEXTS[textIndex]}
        </motion.h2>

        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        <p className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</p>
      </div>
    </div>
  );
};
