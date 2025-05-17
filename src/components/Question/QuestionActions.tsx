
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Share2 } from "lucide-react";
import { Question } from "@/types";
import { useAuth } from "@/context/AuthContext";

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
  onOpenShareDialog,
}) => {
  const { isPro } = useAuth();
  const isPROUser = isPro();

  return (
    <div className="action-buttons-container">
      {/* Share button - only show for PRO users */}
      {isPROUser && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenShareDialog}
          className="action-button text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <Share2 className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Compartilhar</span>
        </Button>
      )}
      
      {/* Creator-only buttons */}
      {isCreator && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenEditModal(question)}
            className="action-button text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span className="whitespace-nowrap">Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDeleteDialog}
            className="action-button text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="whitespace-nowrap">Excluir</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default QuestionActions;
