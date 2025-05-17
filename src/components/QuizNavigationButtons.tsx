
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuizNavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

const QuizNavigationButtons = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  className = "",
}: QuizNavigationButtonsProps) => {
  const { toast } = useToast();

  const handleNext = () => {
    if (currentIndex >= totalQuestions - 1) {
      toast({
        title: "Fim do quiz",
        description: "Você chegou ao fim do quiz."
      });
    } else {
      onNext();
    }
  };

  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      <Button
        variant="outline"
        size="lg"
        className={`h-12 w-12 rounded-full ${
          currentIndex === 0 ? "opacity-40 pointer-events-none" : ""
        }`}
        onClick={onPrevious}
        disabled={currentIndex === 0}
        aria-label="Ir para questão anterior"
      >
        <ArrowLeft size={20} />
      </Button>
      <Button
        size="lg"
        className="h-12 w-12 rounded-full"
        onClick={handleNext}
        aria-label="Ir para próxima questão"
      >
        <ArrowRight size={20} />
      </Button>
    </div>
  );
};

export default QuizNavigationButtons;
