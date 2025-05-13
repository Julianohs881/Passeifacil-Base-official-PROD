
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
        <h3 className="text-lg font-semibold text-white text-center">
          {quiz.title}
        </h3>
        
        <div className="card-actions flex justify-center mt-auto space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
            onClick={handleColorChange}
          >
            <Palette className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 hover:bg-red-500"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default QuizCard;
