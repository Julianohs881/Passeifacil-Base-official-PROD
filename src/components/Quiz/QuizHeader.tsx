import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface QuizHeaderProps {
  title: string | undefined;
}
const QuizHeader: React.FC<QuizHeaderProps> = ({
  title
}) => {
  const navigate = useNavigate();
  return <div className="border-b bg-white fixed top-16 sm:top-20 left-0 w-full z-40 px-[94px] py-[8px]">
      <div className="container mx-auto max-w-[1200px] flex items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="min-w-[40px] min-h-[40px] text-gray-600 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <h1 className="text-base sm:text-xl font-semibold ml-2 sm:ml-4 truncate">{title || "Quiz"}</h1>
      </div>
    </div>;
};
export default QuizHeader;