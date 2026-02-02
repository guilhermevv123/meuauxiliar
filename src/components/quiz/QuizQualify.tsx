import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface QuizQualifyProps {
  onNext: () => void;
}

export const QuizQualify = ({ onNext }: QuizQualifyProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 3000); // 3 seconds loading
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-[50vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="relative">
             <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
             <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10 mx-auto" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Carregando solução...</h2>
          <p className="text-muted-foreground animate-pulse">Estamos preparando sua demonstração personalizada.</p>
        </div>

        <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden max-w-[200px] mx-auto">
          <motion.div 
             className="h-full bg-primary"
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 3, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  );
};
