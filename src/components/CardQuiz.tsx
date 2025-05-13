
import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { Quiz } from "../types";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";

interface CardQuizProps {
  quiz: Quiz;
  onDelete: (id: string) => void;
  onEdit: (quiz: Quiz) => void;
}

const CardQuiz = ({ quiz, onDelete, onEdit }: CardQuizProps) => {
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

  return (
    <Link
      to={`/quiz/${quiz.id}`}
      className="group block h-48 rounded-xl transition-all duration-200 hover:translate-y-1 hover:scale-105 shadow-md"
    >
      <div
        className={`w-full h-full flex flex-col justify-between p-6 rounded-xl bg-${quiz.color}`}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-white line-clamp-2">
            {quiz.title}
          </h3>
        </div>
        
        <div className="flex justify-end mt-auto space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

export default CardQuiz;
