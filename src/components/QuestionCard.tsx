
import React, { useState } from "react";
import { Question } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuestionCardProps {
  question: Question;
  userAnswers: Record<string, number>;
  handleAnswer: (optionIndex: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  currentIndex: number;
  totalQuestions: number;
}

const QuestionCard = ({
  question,
  userAnswers,
  handleAnswer,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteQuestion,
  currentIndex,
  totalQuestions,
}: QuestionCardProps) => {
  const { toast } = useToast();
  const showResult = userAnswers[question.id] !== undefined;

  const confirmDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir esta questão?")) {
      onDeleteQuestion(question.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 relative">
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <button
          onClick={onOpenAddModal}
          className="text-gray-500 hover:text-[#0D6EFD] transition-colors"
          title="Adicionar questão"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={() => onOpenEditModal(question)}
          className="text-gray-500 hover:text-[#0D6EFD] transition-colors"
          title="Editar questão"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={confirmDelete}
          className="text-gray-500 hover:text-red-500 transition-colors"
          title="Excluir questão"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">QUESTÃO {currentIndex + 1}</h2>
        <div className="border-b border-[#E9ECEF] mt-2 mb-4"></div>
      </div>

      <div className="w-full max-w-[960px] mx-auto">
        <p className="text-base leading-7 mb-6">{question.statement}</p>

        <h3 className="font-medium text-sm text-[#6C757D] uppercase mb-3">Alternativas</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = userAnswers[question.id] === index;
            const isCorrect = index === question.correct_index;
            
            let buttonClass = "justify-start w-full text-left p-3 px-4 border border-[#E9ECEF] font-normal bg-[#F8F9FA] rounded-md";
            
            if (showResult) {
              if (isCorrect) {
                buttonClass = "justify-start w-full text-left p-3 px-4 font-normal bg-[#D1F7E9] border border-[#1FAD7B] text-[#155D40] rounded-md";
              } else if (isSelected) {
                buttonClass = "justify-start w-full text-left p-3 px-4 font-normal bg-[#FDEDEB] border border-[#E3503E] text-[#B02A1D] rounded-md";
              }
            }
            
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto flex items-center ${buttonClass}`}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
              >
                <span className="mr-3 font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </Button>
            );
          })}
        </div>

        {showResult && question.explanation && (
          <div className="mt-6 p-4 bg-[#f0f9ff] border border-[#cfe2ff] rounded-lg">
            <h3 className="font-medium mb-2">Explicação</h3>
            <p className="text-gray-700">{question.explanation}</p>
          </div>
        )}

        <div className="quiz-progress text-sm text-[#6C757D] pt-4 mt-6">
          Questão {currentIndex + 1} de {totalQuestions}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
