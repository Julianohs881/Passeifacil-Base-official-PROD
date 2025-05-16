
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ColorOption, QUIZ_COLORS, Quiz, VisibilityOption } from "../types";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

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
  const [color, setColor] = useState<ColorOption>("bg-violet-500");
  const [visibility, setVisibility] = useState<VisibilityOption>("private");
  const [faculty, setFaculty] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [course, setCourse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes or quiz changes
  useEffect(() => {
    if (isOpen) {
      setTitle(quiz?.title || "");
      setColor((quiz?.color || "bg-violet-500") as ColorOption);
      setVisibility((quiz?.visibility || "private") as VisibilityOption);
      setFaculty(quiz?.faculty || "");
      setCourseYear(quiz?.course_year || "");
      setCourse(quiz?.course || "");
    }
  }, [isOpen, quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      await onSave({ 
        title, 
        color, 
        visibility,
        faculty: faculty.trim() || undefined,
        course_year: courseYear.trim() || undefined,
        course: course.trim() || undefined
      });
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

  const courseYearOptions = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "Pós-graduação"];

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
                Título
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Matemática Avançada"
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
              <Label htmlFor="courseYear" className="text-right">
                Ano do Curso
              </Label>
              <Select value={courseYear} onValueChange={setCourseYear}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o ano do curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Não especificado</SelectItem>
                  {courseYearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Cor</Label>
              <RadioGroup
                value={color}
                onValueChange={(value) => setColor(value as ColorOption)}
                className="col-span-3 flex flex-wrap gap-2"
              >
                {QUIZ_COLORS.map((colorOption) => (
                  <div key={colorOption} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={colorOption}
                      id={colorOption}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={colorOption}
                      className={`h-8 w-8 rounded-full cursor-pointer ring-offset-background transition-all hover:scale-110 ${colorOption} ${
                        color === colorOption
                          ? "ring-2 ring-offset-2 ring-slate-950"
                          : ""
                      }`}
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Visibilidade</Label>
              <div className="col-span-3 flex space-x-4">
                <div 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    visibility === 'private' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setVisibility('private')}
                >
                  <EyeOff className="h-5 w-5 mr-2 text-gray-600" />
                  <div>
                    <p className="font-medium">Privado</p>
                    <p className="text-xs text-gray-500">Somente você pode ver</p>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    visibility === 'public' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setVisibility('public')}
                >
                  <Eye className="h-5 w-5 mr-2 text-gray-600" />
                  <div>
                    <p className="font-medium">Público</p>
                    <p className="text-xs text-gray-500">Visível para todos</p>
                  </div>
                </div>
              </div>
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

export default AddQuizModal;
