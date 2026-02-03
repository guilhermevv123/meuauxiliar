import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizStepProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
  currentStepIndex: number;
  totalSteps: number;
}

export const QuizStep = ({ question, options, onSelect, currentStepIndex, totalSteps }: QuizStepProps) => {
  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full px-4">
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Passo {currentStepIndex} de {totalSteps}</span>
          <span>{Math.round((currentStepIndex / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <motion.h2 
        key={question}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-center mb-8"
      >
        {question}
      </motion.h2>

      <div className="grid gap-4 w-full">
        {options.map((option, index) => (
          <motion.div
            key={option}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className={cn(
                "w-full h-auto py-4 px-6 justify-start text-left text-base md:text-lg hover:border-primary hover:bg-primary/5 transition-all",
                "border-2"
              )}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-muted-foreground/30 mr-4 flex items-center justify-center text-sm font-medium text-muted-foreground group-hover:border-primary group-hover:text-primary">
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
