
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuizNavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

const QuizNavigationButtons = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
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
    <div className="nav-btns">
      <Button
        variant="outline"
        size="icon"
        className={`nav-btn prev ${
          currentIndex === 0 ? "opacity-40 pointer-events-none" : ""
        }`}
        onClick={onPrevious}
        disabled={currentIndex === 0}
        aria-label="Ir para questão anterior"
      >
        <ArrowLeft size={18} />
      </Button>
      <Button
        size="icon"
        className="nav-btn next"
        onClick={handleNext}
        aria-label="Ir para próxima questão"
      >
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};

export default QuizNavigationButtons;
