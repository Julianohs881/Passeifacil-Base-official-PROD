
import { useState, useEffect } from "react";
import { Question } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarQuestionListProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

const SidebarQuestionList = ({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
}: SidebarQuestionListProps) => {
  return (
    <div className="w-[280px] border-r flex-shrink-0 h-full bg-gray-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-medium text-lg">Questões</h2>
      </div>
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              onClick={() => onSelectQuestion(index)}
              className={`flex cursor-pointer mb-2 p-3 rounded-lg transition-colors
                ${
                  currentQuestionIndex === index
                    ? "bg-[#E7F1FF] border-l-4 border-[#0D6EFD]"
                    : "bg-white border-l-4 border-transparent hover:bg-gray-100"
                }`}
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-[#0D6EFD] rounded flex items-center justify-center text-white font-medium">
                  {index + 1}
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="text-[14px] line-clamp-2">
                  {question.statement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarQuestionList;
