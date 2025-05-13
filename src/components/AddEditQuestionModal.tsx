
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
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Question } from "../types";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddEditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Omit<Question, "id" | "created_at">) => Promise<void>;
  quizId: string;
  question?: Question; // For editing an existing question
}

const MAX_OPTIONS = 5;

const AddEditQuestionModal: React.FC<AddEditQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quizId,
  question,
}) => {
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      setStatement(question?.statement || "");
      setOptions(question?.options || ["", ""]);
      setCorrectIndex(question?.correct_index || 0);
      setExplanation(question?.explanation || "");
    }
  }, [isOpen, question]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast({
        title: "Operação não permitida",
        description: "Uma questão precisa ter pelo menos 2 alternativas.",
        variant: "destructive",
      });
      return;
    }
    
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Adjust correctIndex if needed
    if (index === correctIndex) {
      setCorrectIndex(0);
    } else if (index < correctIndex) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const validateForm = () => {
    if (!statement.trim()) {
      toast({
        title: "Enunciado necessário",
        description: "Por favor, forneça um enunciado para a questão.",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if there are at least 2 options and all are filled
    if (options.length < 2) {
      toast({
        title: "Alternativas insuficientes",
        description: "Uma questão precisa ter pelo menos 2 alternativas.",
        variant: "destructive",
      });
      return false;
    }
    
    const emptyOptionIndex = options.findIndex(option => !option.trim());
    if (emptyOptionIndex !== -1) {
      toast({
        title: "Alternativa vazia",
        description: `A alternativa ${emptyOptionIndex + 1} está vazia.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        quiz_id: quizId,
        statement,
        options,
        correct_index: correctIndex,
        explanation,
      });
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a questão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Editar Questão" : "Nova Questão"}
          </DialogTitle>
          <DialogDescription>
            {question
              ? "Modifique os detalhes da questão abaixo."
              : "Crie uma nova questão preenchendo os detalhes abaixo."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="statement">Enunciado</Label>
            <Textarea
              id="statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Digite o enunciado da questão..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Alternativas</Label>
              {options.length < MAX_OPTIONS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar Alternativa</span>
                </Button>
              )}
            </div>
            
            <RadioGroup
              value={correctIndex.toString()}
              onValueChange={(value) => setCorrectIndex(parseInt(value))}
              className="space-y-3"
            >
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 border rounded-lg p-3"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Alternativa ${index + 1}`}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              Selecione o círculo à esquerda para marcar a alternativa correta.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="explanation">Explicação</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explique por que a resposta correta é a escolhida..."
              className="min-h-[80px]"
            />
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
              className="bg-[#0D6EFD] hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Salvando..."
                : question
                ? "Salvar Alterações"
                : "Criar Questão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditQuestionModal;
