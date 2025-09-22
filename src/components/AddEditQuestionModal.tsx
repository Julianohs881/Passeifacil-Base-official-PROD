
import React, { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadQuestionImage, resizeImage } from "../utils/imageUpload";

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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset form when modal opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      setStatement(question?.statement || "");
      setOptions(question?.options || ["", ""]);
      setCorrectIndex(question?.correct_index || 0);
      setExplanation(question?.explanation || "");
      setImageUrl(question?.image_url || "");
      setImageFile(null);
      setImagePreview(question?.image_url || "");
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

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      
      // Redimensionar imagem se necessário
      const resizedFile = await resizeImage(file);
      setImageFile(resizedFile);
      
      // Criar preview
      const previewUrl = URL.createObjectURL(resizedFile);
      setImagePreview(previewUrl);
      
      // Fazer upload da imagem
      const result = await uploadQuestionImage(resizedFile, quizId, question?.id);
      
      if (result.success && result.url) {
        setImageUrl(result.url);
        toast({
          title: "Imagem carregada",
          description: "A imagem foi enviada com sucesso.",
        });
      } else {
        toast({
          title: "Erro no upload",
          description: result.error || "Não foi possível enviar a imagem.",
          variant: "destructive",
        });
        // Limpar preview em caso de erro
        setImagePreview("");
        setImageFile(null);
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast({
        title: "Erro ao processar imagem",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setImagePreview("");
      setImageFile(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
        image_url: imageUrl || undefined,
        share_code: null, // Added to fix TypeScript error
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-0 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">
            {question ? "Editar Questão" : "Nova Questão"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {question
              ? "Modifique os detalhes da questão abaixo."
              : "Crie uma nova questão preenchendo os detalhes abaixo."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="statement" className="text-gray-700">Enunciado</Label>
            <Textarea
              id="statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Digite o enunciado da questão..."
              className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>

          {/* Campo de Upload de Imagem */}
          <div className="space-y-2">
            <Label className="text-gray-700">Imagem (Opcional)</Label>
            
            {!imagePreview ? (
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Clique para adicionar uma imagem
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF ou WebP (máx. 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview da questão"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-300"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 h-8 w-8"
                  disabled={isUploadingImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-sm">Enviando...</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-gray-700">Alternativas</Label>
              {options.length < MAX_OPTIONS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center space-x-1 border-blue-400 text-blue-600 hover:bg-blue-50"
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
                  className="flex items-center space-x-2 border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="text-blue-600"
                  />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Alternativa ${index + 1}`}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-gray-500 mt-2">
              Selecione o círculo à esquerda para marcar a alternativa correta.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-gray-700">Explicação</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explique por que a resposta correta é a escolhida..."
              className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
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
              className="bg-[#0D6EFD] hover:bg-blue-600 text-white"
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
