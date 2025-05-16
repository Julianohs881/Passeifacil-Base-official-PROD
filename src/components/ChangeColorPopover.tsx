
import { useState, useEffect, RefObject } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { ColorOption, QUIZ_COLORS, Quiz } from "../types";

interface ChangeColorPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Quiz, newColor: ColorOption) => Promise<void>;
  quiz: Quiz | null;
  anchorRef?: RefObject<HTMLButtonElement>;
}

const ChangeColorPopover = ({ isOpen, onClose, onSave, quiz }: ChangeColorPopoverProps) => {
  const [color, setColor] = useState<ColorOption>("bg-violet-500");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes or quiz changes
  useEffect(() => {
    if (isOpen && quiz) {
      setColor((quiz.color || "bg-violet-500") as ColorOption);
    }
  }, [isOpen, quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quiz) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave(quiz, color);
      onClose();
    } catch (error) {
      console.error("Error saving quiz color:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a cor do quiz. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Mudar Cor do Quiz</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <RadioGroup
              value={color}
              onValueChange={(value) => setColor(value as ColorOption)}
              className="flex flex-wrap gap-4 justify-center"
            >
              {QUIZ_COLORS.map((colorOption) => (
                <div key={colorOption} className="flex items-center">
                  <RadioGroupItem
                    value={colorOption}
                    id={colorOption}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={colorOption}
                    className={`h-10 w-10 rounded-full cursor-pointer transition-all hover:scale-110 shadow-sm ${colorOption} ${
                      color === colorOption
                        ? "ring-2 ring-offset-2 ring-slate-950"
                        : ""
                    }`}
                  />
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-violet-500 hover:bg-violet-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeColorPopover;
