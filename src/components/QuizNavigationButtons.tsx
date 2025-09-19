
import { ArrowLeft, ArrowRight, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface QuizNavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
  isQuestionAccessible?: (index: number) => boolean;
  isProUser?: boolean;
  onUpgradeClick?: () => void;
}

const QuizNavigationButtons = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  className = "",
  isQuestionAccessible,
  isProUser = true,
  onUpgradeClick,
}: QuizNavigationButtonsProps) => {
  const { toast } = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleNext = () => {
    if (currentIndex >= totalQuestions - 1) {
      toast({
        title: "Fim do quiz",
        description: "Você chegou ao fim do quiz."
      });
    } else {
      const nextIndex = currentIndex + 1;
      // Verificar se a próxima questão está acessível
      if (!isProUser && isQuestionAccessible && !isQuestionAccessible(nextIndex)) {
        setIsUpgradeModalOpen(true);
        return;
      }
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      // Verificar se a questão anterior está acessível
      if (!isProUser && isQuestionAccessible && !isQuestionAccessible(prevIndex)) {
        setIsUpgradeModalOpen(true);
        return;
      }
      onPrevious();
    }
  };

  return (
    <>
      <div className={`flex justify-center space-x-4 ${className}`}>
        <Button
          variant="outline"
          size="lg"
          className={`h-12 w-12 rounded-full ${
            currentIndex === 0 ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={handlePrevious}
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

      {/* Modal de Upgrade PRO */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-amber-500" />
              <DialogTitle>Upgrade para PRO</DialogTitle>
            </div>
            <DialogDescription>
              Esta questão está bloqueada no plano gratuito. Faça upgrade para PRO e tenha acesso a todas as questões do quiz!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Benefícios do PRO:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Acesso a 100% das questões</li>
                <li>• Criação ilimitada de quizzes</li>
                <li>• Recursos avançados de IA</li>
                <li>• Suporte prioritário</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 border-0"
              onClick={() => {
                setIsUpgradeModalOpen(false);
                onUpgradeClick?.();
              }}
            >
              Fazer Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizNavigationButtons;
