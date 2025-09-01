
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quiz, VisibilityOption } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { QuizFormFields } from "./QuizFormFields";

interface AddQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Omit<Quiz, "id" | "user_id" | "created_at">) => Promise<void>;
  quiz?: Quiz; // For editing an existing quiz
}

const AddQuizModal: React.FC<AddQuizModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quiz,
}) => {
  const [title, setTitle] = useState("");

  const [visibility, setVisibility] = useState<VisibilityOption>("private");
  const [faculty, setFaculty] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes or quiz changes
  useEffect(() => {
          if (isOpen) {
        setTitle(quiz?.title || "");
        setVisibility((quiz?.visibility || "private") as VisibilityOption);
        setFaculty(quiz?.faculty || "");
        setCourseYear(quiz?.course_year || "");
        setCourse(quiz?.course || "");
        setDescription(quiz?.description || "");
      }
  }, [isOpen, quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submetendo formulário com description:", description); // Debug
    
    if (!title.trim()) {
      toast({
        title: "Título necessário",
        description: "Por favor, forneça um título para o quiz.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process courseYear value to handle the "none-specified" case
      const processedCourseYear = courseYear === "none-specified" ? "" : courseYear;
      
      const quizData = { 
        title, 
        color: "bg-gray-50", // Cor padrão fixa
        visibility,
        faculty: faculty.trim() || undefined,
        course_year: processedCourseYear || undefined,
        course: course.trim() || undefined,
        description: description.trim() || undefined,
        share_code: null, // Added to fix TypeScript error
      };
      
      console.log("Dados do quiz a serem salvos:", quizData); // Debug
      
      await onSave(quizData);
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o quiz. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{quiz ? "Editar Quiz" : "Novo Quiz"}</DialogTitle>
          <DialogDescription>
            {quiz
              ? "Modifique os detalhes do quiz abaixo."
              : "Crie um novo quiz preenchendo os detalhes abaixo."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <QuizFormFields 
            title={title}
            setTitle={setTitle}
            visibility={visibility}
            setVisibility={setVisibility}
            faculty={faculty}
            setFaculty={setFaculty}
            courseYear={courseYear}
            setCourseYear={setCourseYear}
            course={course}
            setCourse={setCourse}
            description={description}
            setDescription={setDescription}
          />
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-violet-500 hover:bg-violet-600"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Salvando..."
                : quiz
                ? "Salvar Alterações"
                : "Criar Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizModal;
