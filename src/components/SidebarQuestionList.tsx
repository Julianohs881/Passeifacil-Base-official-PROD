
import { useState, useEffect } from "react";
import { Question } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

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
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle closing drawer after selecting a question on mobile
  const handleQuestionSelect = (index: number) => {
    onSelectQuestion(index);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

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
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium text-lg">Questões</h2>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X size={18} />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
            <ScrollArea className="h-[calc(100%-64px)]">
              <div className="p-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionSelect(index)}
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
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div className="w-[280px] border-r flex-shrink-0 h-full bg-gray-50 hidden md:block">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-medium text-lg">Questões</h2>
      </div>
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              onClick={() => handleQuestionSelect(index)}
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
