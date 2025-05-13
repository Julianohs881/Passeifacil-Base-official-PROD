
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
        className={`quiz-card ${quiz.color} p-5 flex flex-col justify-between`}
      >
        {/* Action buttons - consistentemente posicionados no canto superior direito */}
        <div className="absolute top-3 right-3 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
            onClick={handleEdit}
          >
            <Edit className="h-3 w-3 text-gray-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 backdrop-blur-sm"
            onClick={handleColorChange}
          >
            <Palette className="h-3 w-3 text-gray-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-white bg-opacity-70 hover:bg-opacity-80 hover:bg-red-200"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3 text-gray-700" />
          </Button>
        </div>

        {/* Título do quiz centralizado verticalmente e horizontalmente */}
        <div className="flex-grow flex items-center justify-center">
          <h3 className="text-base font-medium text-white text-center">
            {quiz.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default QuizCard;
