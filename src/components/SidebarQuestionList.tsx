import { useState, useEffect } from "react";
import { Question } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect';

export interface QuestionMeta {
  id: string;
  status: QuestionStatus;
}

interface SidebarQuestionListProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  questionsStatus: Record<string, QuestionStatus>;
  isQuestionAccessible?: (index: number) => boolean;
  isProUser?: boolean;
}

const SidebarQuestionList = ({
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  questionsStatus,
  isQuestionAccessible,
  isProUser = true,
}: SidebarQuestionListProps) => {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle closing drawer after selecting a question on mobile
  const handleQuestionSelect = (index: number) => {
    onSelectQuestion(index);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  // Get status class for question
  const getQuestionStatusClass = (questionId: string, index: number) => {
    if (currentQuestionIndex === index) {
      return "current";
    }
    
    // Verificar se a questão está bloqueada para usuários não-PRO
    if (!isProUser && isQuestionAccessible && !isQuestionAccessible(index)) {
      return "locked";
    }
    
    const status = questionsStatus[questionId] || 'unanswered';
    switch (status) {
      case 'correct':
        return "correct";
      case 'incorrect':
        return "incorrect";
      default:
        return "pending";
    }
  };

  // Get status class for question number
  const getNumberStatusClass = (questionId: string, index: number) => {
    if (currentQuestionIndex === index) {
      return "current";
    }
    
    // Verificar se a questão está bloqueada para usuários não-PRO
    if (!isProUser && isQuestionAccessible && !isQuestionAccessible(index)) {
      return "locked";
    }
    
    const status = questionsStatus[questionId] || 'unanswered';
    switch (status) {
      case 'correct':
        return "correct";
      case 'incorrect':
        return "incorrect";
      default:
        return "pending";
    }
  };

  // Generate accessibility text
  const getAriaLabel = (index: number, questionId: string) => {
    // Verificar se a questão está bloqueada para usuários não-PRO
    if (!isProUser && isQuestionAccessible && !isQuestionAccessible(index)) {
      return `Questão ${index + 1} — bloqueada (requer plano PRO)`;
    }
    
    const status = questionsStatus[questionId] || 'unanswered';
    const statusText = status === 'correct' 
      ? 'correta' 
      : status === 'incorrect' 
        ? 'incorreta' 
        : 'não respondida';
    
    return `Questão ${index + 1} — ${statusText}`;
  };

  // The actual question list component
  const QuestionList = () => (
    <>
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <h2 className="font-medium text-lg">Questões</h2>
      </div>
      <div className="p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500 justify-start">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#198754]"></span>
            Correta
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#DC3545]"></span>
            Incorreta
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#ADB5BD]"></span>
            Não respondida
          </span>
          {!isProUser && (
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-gray-400" />
              Bloqueada
            </span>
          )}
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-110px)]">
        <div className="p-3">
          {questions.map((question, index) => {
            const statusClass = getQuestionStatusClass(question.id, index);
            const numberStatusClass = getNumberStatusClass(question.id, index);
            const isCurrent = currentQuestionIndex === index;

            return (
              <div
                key={question.id}
                onClick={() => handleQuestionSelect(index)}
                className={`flex cursor-pointer mb-2 p-3 rounded-lg transition-colors
                  ${
                    isCurrent
                      ? "bg-[#E7F1FF] border-l-4 border-[#0D6EFD]"
                      : statusClass === "locked"
                        ? "bg-gray-100 border-l-4 border-gray-300 opacity-60"
                        : statusClass === "correct"
                          ? "bg-[#D1F7E9] border-l-4 border-[#198754]"
                          : statusClass === "incorrect"
                            ? "bg-[#FDEDEB] border-l-4 border-[#DC3545]"
                            : "bg-white border-l-4 border-[#ADB5BD]"
                  }`}
                aria-current={isCurrent}
                aria-label={getAriaLabel(index, question.id)}
              >
                <div className="flex-shrink-0 mr-3">
                  <div 
                    className={`w-8 h-8 flex items-center justify-center text-white font-medium rounded ${
                      numberStatusClass === "current"
                        ? "bg-[#0D6EFD]"
                        : numberStatusClass === "locked"
                          ? "bg-gray-400"
                          : numberStatusClass === "correct"
                            ? "bg-[#198754]"
                            : numberStatusClass === "incorrect"
                              ? "bg-[#DC3545]"
                              : "bg-[#ADB5BD]"
                    }`}
                  >
                    {numberStatusClass === "locked" ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-[14px] line-clamp-2 ${
                    statusClass === "locked"
                      ? "text-gray-500"
                      : statusClass === "correct"
                        ? "text-[#155D40]"
                        : statusClass === "incorrect"
                          ? "text-[#B02A1D]"
                          : "text-[#212529]"
                  }`}>
                    {question.statement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu size={24} />
          <span className="sr-only">Open question list</span>
        </Button>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="w-[80vw] max-w-[320px] h-full p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between gap-2">
                <h2 className="font-medium text-lg">Questões</h2>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon">
                    <X size={18} />
                    <span className="sr-only">Close</span>
                  </Button>
                </DrawerClose>
              </div>
              <div className="p-2 border-b bg-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500 justify-start">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#198754]"></span>
                    Correta
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#DC3545]"></span>
                    Incorreta
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#ADB5BD]"></span>
                    Não respondida
                  </span>
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-110px)]">
                <div className="p-3">
                  {questions.map((question, index) => {
                    const statusClass = getQuestionStatusClass(question.id, index);
                    const numberStatusClass = getNumberStatusClass(question.id, index);
                    const isCurrent = currentQuestionIndex === index;

                    return (
                      <div
                        key={question.id}
                        onClick={() => handleQuestionSelect(index)}
                        className={`flex cursor-pointer mb-2 p-3 rounded-lg transition-colors
                          ${
                            isCurrent
                              ? "bg-[#E7F1FF] border-l-4 border-[#0D6EFD]"
                              : statusClass === "correct"
                                ? "bg-[#D1F7E9] border-l-4 border-[#198754]"
                                : statusClass === "incorrect"
                                  ? "bg-[#FDEDEB] border-l-4 border-[#DC3545]"
                                  : "bg-white border-l-4 border-[#ADB5BD]"
                          }`}
                        aria-current={isCurrent}
                        aria-label={getAriaLabel(index, question.id)}
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div 
                            className={`w-8 h-8 flex items-center justify-center text-white font-medium rounded ${
                              numberStatusClass === "current"
                                ? "bg-[#0D6EFD]"
                                : numberStatusClass === "correct"
                                  ? "bg-[#198754]"
                                  : numberStatusClass === "incorrect"
                                    ? "bg-[#DC3545]"
                                    : "bg-[#ADB5BD]"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <p className={`text-[14px] line-clamp-2 ${
                            statusClass === "correct"
                              ? "text-[#155D40]"
                              : statusClass === "incorrect"
                                ? "text-[#B02A1D]"
                                : "text-[#212529]"
                          }`}>
                            {question.statement}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div className="w-[280px] border-r flex-shrink-0 h-full bg-gray-50 hidden md:flex md:flex-col">
      <QuestionList />
    </div>
  );
};

export default SidebarQuestionList;
