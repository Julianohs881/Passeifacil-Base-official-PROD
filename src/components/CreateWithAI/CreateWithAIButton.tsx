
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAIQuestion } from "./useAIQuestion";
import AIQuestionModal from "./AIQuestionModal";

interface CreateWithAIButtonProps {
  quizId: string;
  onSuccess: () => void;
}

const CreateWithAIButton: React.FC<CreateWithAIButtonProps> = ({ quizId, onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading, processingStep, createQuestionWithAI } = useAIQuestion({ quizId, onSuccess });

  const handleSubmit = async (content: string, contentType: "text" | "image") => {
    const success = await createQuestionWithAI(content, contentType);
    if (success) {
      setIsModalOpen(false);
    }
    return success;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost" 
        size="sm"
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        onClick={openModal}
      >
        <Sparkles className="h-4 w-4" />
        <span>Criar com IA</span>
      </Button>
      
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
