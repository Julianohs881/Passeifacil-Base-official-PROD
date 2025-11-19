
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
  const DRAFT_STORAGE_KEY = "quiz_form_draft";
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<VisibilityOption>("private");
  const [faculty, setFaculty] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState<string | null>(null);
  const [subareaOfInterest, setSubareaOfInterest] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes or quiz changes
  useEffect(() => {
    if (!isOpen) {
      setDraftReady(false);
      return;
    }

    if (quiz) {
      setTitle(quiz.title || "");
      setVisibility((quiz.visibility || "private") as VisibilityOption);
      setFaculty(quiz.faculty || "");
      setCourseYear(quiz.course_year || "");
      setCourse(quiz.course || "");
      setDescription(quiz.description || "");
      setAreaOfInterest(quiz.area_of_interest || null);
      setSubareaOfInterest(quiz.subarea_of_interest || null);
      setDraftReady(true);
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const storedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (storedDraft) {
          const {
            title: draftTitle,
            visibility: draftVisibility,
            faculty: draftFaculty,
            courseYear: draftCourseYear,
            course: draftCourse,
            description: draftDescription,
            areaOfInterest: draftAreaOfInterest,
            subareaOfInterest: draftSubareaOfInterest,
          } = JSON.parse(storedDraft);

          setTitle(draftTitle ?? "");
          setVisibility((draftVisibility || "private") as VisibilityOption);
          setFaculty(draftFaculty ?? "");
          setCourseYear(draftCourseYear ?? "");
          setCourse(draftCourse ?? "");
          setDescription(draftDescription ?? "");
          setAreaOfInterest(draftAreaOfInterest ?? null);
          setSubareaOfInterest(draftSubareaOfInterest ?? null);
        } else {
          setTitle("");
          setVisibility("private");
          setFaculty("");
          setCourseYear("");
          setCourse("");
          setDescription("");
          setAreaOfInterest(null);
          setSubareaOfInterest(null);
        }
      } catch (error) {
        console.error("Erro ao carregar rascunho do quiz:", error);
      }
    }

    setDraftReady(true);
  }, [isOpen, quiz]);

  useEffect(() => {
    if (quiz || !draftReady || !isOpen || typeof window === "undefined") {
      return;
    }

    const draft = {
      title,
      visibility,
      faculty,
      courseYear,
      course,
      description,
      areaOfInterest,
      subareaOfInterest,
    };

    const isEmptyDraft =
      !draft.title &&
      (!draft.faculty || draft.faculty.trim() === "") &&
      (!draft.courseYear || draft.courseYear.trim() === "") &&
      (!draft.course || draft.course.trim() === "") &&
      (!draft.description || draft.description.trim() === "") &&
      !draft.areaOfInterest &&
      !draft.subareaOfInterest &&
      draft.visibility === "private";

    try {
      if (isEmptyDraft) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } else {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      }
    } catch (error) {
      console.error("Erro ao salvar rascunho do quiz:", error);
    }
  }, [
    title,
    visibility,
    faculty,
    courseYear,
    course,
    description,
    areaOfInterest,
    subareaOfInterest,
    quiz,
    draftReady,
    isOpen,
  ]);

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
        area_of_interest: areaOfInterest || undefined,
        subarea_of_interest: subareaOfInterest || undefined,
        share_code: null, // Added to fix TypeScript error
      };
      
      console.log("Dados do quiz a serem salvos:", quizData); // Debug
      
      await onSave(quizData);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
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
            areaOfInterest={areaOfInterest}
            setAreaOfInterest={setAreaOfInterest}
            subareaOfInterest={subareaOfInterest}
            setSubareaOfInterest={setSubareaOfInterest}
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
