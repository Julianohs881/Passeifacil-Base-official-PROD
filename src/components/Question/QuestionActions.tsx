import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Share2, Info, MoreVertical } from "lucide-react";
import { Question } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

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
  const isPROUser = isPro();
  
  // Calculate AI usage metrics for Pro users
  const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
  const aiQuestionsLimit = 50;
  const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);

  return (
    <div className="action-buttons-container py-[4px] flex items-center gap-2 justify-end w-full">
      {/* AI Usage Info for PRO users */}
      {isPROUser && (
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
      {/* Menu de três pontos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
          {isPROUser && (
            <DropdownMenuItem onClick={onOpenShareDialog} className="flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Compartilhar
            </DropdownMenuItem>
          )}
          {isCreator && (
            <DropdownMenuItem onClick={() => onOpenEditModal(question)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Editar
            </DropdownMenuItem>
          )}
          {isCreator && (
            <DropdownMenuItem onClick={onOpenDeleteDialog} className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" /> Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuestionActions;
