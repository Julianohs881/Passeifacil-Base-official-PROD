import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Quiz, VisibilityOption } from "@/types";

interface SimpleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Omit<Quiz, "id" | "user_id" | "created_at">) => Promise<void>;
  quiz?: Quiz;
}

const SimpleQuizModal: React.FC<SimpleQuizModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quiz,
}) => {
  const [title, setTitle] = useState(quiz?.title || "");
  const [faculty, setFaculty] = useState(quiz?.faculty || "");
  const [course, setCourse] = useState(quiz?.course || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Por favor, forneça um título para o quiz.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const quizData = { 
        title, 
        color: "bg-gray-50",
        visibility: "private" as VisibilityOption,
        faculty: faculty.trim() || undefined,
        course_year: undefined,
        course: course.trim() || undefined,
        description: description.trim() || undefined,
        area_of_interest: undefined,
        share_code: null,
      };
      
      await onSave(quizData);
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Erro ao salvar quiz. Tente novamente.");
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Matemática Avançada"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="faculty" className="text-right">
                Faculdade
              </Label>
              <Input
                id="faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Engenharia"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">
                Curso/Matéria
              </Label>
              <Input
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Cálculo I"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Descreva o conteúdo e objetivo deste quiz..."
                rows={3}
              />
            </div>
          </div>
          
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

export default SimpleQuizModal;


