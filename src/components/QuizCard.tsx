
import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Palette } from "lucide-react";
import { Quiz } from "../types";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuizCardProps {
  quiz: Quiz;
  onDelete: (id: string) => void;
  onEdit: (quiz: Quiz) => void;
  onColorChange: (quiz: Quiz) => void;
}

const QuizCard = ({ quiz, onDelete, onEdit, onColorChange }: QuizCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      onDelete(quiz.id);
    } catch (error) {
      toast({
        title: "Erro ao excluir quiz",
        description: "Não foi possível excluir este quiz.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(quiz);
  };

  const handleColorChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onColorChange(quiz);
  };

  return (
    <Link
      to={`/quiz/${quiz.id}`}
      className="group relative block"
    >
      <div
        className={`quiz-card ${quiz.color} p-6 h-48 rounded-xl shadow-md flex flex-col justify-between transition-all duration-200 hover:translate-y-1 hover:scale-105`}
      >
        {/* Action buttons - agora fixos no topo à direita */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm"
            onClick={handleEdit}
          >
            <Edit className="h-3 w-3 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm"
            onClick={handleColorChange}
          >
            <Palette className="h-3 w-3 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white bg-opacity-30 hover:bg-opacity-40 hover:bg-red-500 hover:bg-opacity-40"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3 text-white" />
          </Button>
        </div>

        <h3 className="text-lg font-semibold text-white text-center mt-4">
          {quiz.title}
        </h3>
      </div>
    </Link>
  );
};

export default QuizCard;
