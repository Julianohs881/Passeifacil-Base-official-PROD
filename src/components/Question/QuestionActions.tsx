
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Share2, Info } from "lucide-react";
import { Question } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface QuestionActionsProps {
  question: Question;
  isCreator: boolean;
  onOpenEditModal: (question: Question) => void;
  onOpenDeleteDialog: () => void;
  onOpenShareDialog: () => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  question,
  isCreator,
  onOpenEditModal,
  onOpenDeleteDialog,
  onOpenShareDialog
}) => {
  const { isPro, userProfile } = useAuth();
  const hasPremiumAccess = isPro();
  const navigate = useNavigate();
  
  // Calculate AI usage metrics for premium users
  const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
  const aiQuestionsLimit = 50;
  const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);
  
  const handleShareClick = () => {
    if (hasPremiumAccess) {
      onOpenShareDialog();
    } else {
      navigate('/subscription');
    }
  };

  return (
    <div className="action-buttons-container py-[4px] flex items-center gap-2">
      {/* AI Usage Info for premium users */}
      {hasPremiumAccess && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="p-4 max-w-xs bg-white">
              <div className="space-y-2">
                <p className="font-medium">Uso de IA este mês</p>
                <p className="text-sm text-gray-600">
                  Você já criou {aiQuestionsCreated} de {aiQuestionsLimit} questões com IA.
                </p>
                <p className="text-sm text-gray-600">
                  Restam {aiQuestionsRemaining} questões para criar este mês.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Share button - only show for premium users */}
      {hasPremiumAccess && (
        <Button variant="outline" size="sm" onClick={handleShareClick} className="action-button text-gray-600 hover:text-blue-600 hover:bg-blue-50">
          <Share2 className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Compartilhar</span>
        </Button>
      )}
      
      {/* Creator-only buttons */}
      {isCreator && (
        <>
          <Button variant="outline" size="sm" onClick={() => onOpenEditModal(question)} className="action-button text-gray-600 hover:text-blue-600 hover:bg-blue-50">
            <Edit className="h-4 w-4 mr-1" />
            <span className="whitespace-nowrap">Editar</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenDeleteDialog} className="action-button text-gray-600 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="whitespace-nowrap">Excluir</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default QuestionActions;
