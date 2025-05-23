
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAIQuestion } from "./useAIQuestion";
import AIQuestionModal from "./AIQuestionModal";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface CreateWithAIButtonProps {
  quizId: string;
  onSuccess: () => void;
}

const CreateWithAIButton: React.FC<CreateWithAIButtonProps> = ({ quizId, onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading, processingStep, createQuestionWithAI } = useAIQuestion({ quizId, onSuccess });
  const { updateAIQuestionsCreated, userProfile, hasReachedAILimit, isPro } = useAuth();
  const navigate = useNavigate();

  // First, check if user has premium access
  const hasPremiumAccess = isPro();

  // If user doesn't have premium access, don't render the component at all
  if (!hasPremiumAccess) {
    return null;
  }

  // Calculate AI usage metrics for premium users
  const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
  const aiQuestionsLimit = 50;
  const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);
  const limitReached = hasReachedAILimit();

  const handleSubmit = async (content: string, contentType: "text" | "image") => {
    // Double-check premium access before allowing submission
    if (!isPro()) {
      navigate('/subscription');
      return false;
    }
    
    const success = await createQuestionWithAI(content, contentType);
    if (success) {
      await updateAIQuestionsCreated();
      setIsModalOpen(false);
    }
    return success;
  };

  const openModal = () => {
    if (limitReached) {
      return;
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="ghost" 
                size="sm"
                className={`flex items-center gap-1 transition-colors ${
                  limitReached
                    ? "text-gray-400 hover:text-gray-500 cursor-not-allowed"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
                onClick={limitReached ? undefined : openModal}
                disabled={limitReached}
              >
                <Sparkles className="h-4 w-4" />
                <span>Criar com IA</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="p-4 max-w-xs bg-white">
            <div className="space-y-2">
              <p className="font-medium">Uso de IA este mês</p>
              <p className="text-sm text-gray-600">
                Você já criou {aiQuestionsCreated} de {aiQuestionsLimit} questões com IA.
              </p>
              <p className="text-sm text-gray-600">
                {limitReached 
                  ? "Você atingiu o limite mensal de questões geradas com IA." 
                  : `Restam ${aiQuestionsRemaining} questões para criar este mês.`}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <AIQuestionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isLoading={isLoading}
        processingStep={processingStep}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default CreateWithAIButton;
