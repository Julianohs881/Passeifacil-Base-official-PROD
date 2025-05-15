
import React, { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";

interface AIQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  processingStep: string | null;
  onSubmit: (content: string, contentType: "text" | "image") => Promise<boolean>;
}

const AIQuestionModal: React.FC<AIQuestionModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  processingStep,
  onSubmit,
}) => {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"text" | "image">("text");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setContentType("text");
    setImagePreview(null);
  };

  const handleImageChange = (imageData: string | null) => {
    if (imageData) {
      setImagePreview(imageData);
      setContent(imageData);
      setContentType("image");
    } else {
      setImagePreview(null);
      setContent("");
      setContentType("text");
    }
  };

  const handleSubmit = async () => {
    const success = await onSubmit(content, contentType);
    if (success) {
      // Reset form
      setContent("");
      setImagePreview(null);
      setContentType("text");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Criar Questão com IA</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {contentType === "image" 
              ? "Envie uma imagem contendo uma questão completa" 
              : "Digite ou cole o texto da questão aqui"}
          </label>
          
          {!imagePreview && (
            <div className="mb-4">
              <textarea
                className="w-full border rounded-md p-3 h-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Digite ou cole o texto da questão aqui, incluindo enunciado e alternativas..."
                value={contentType === "text" ? content : ""}
                onChange={handleTextChange}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                A IA irá preservar a estrutura do texto, formatando listas, parágrafos e separando corretamente o enunciado das alternativas.
              </p>
            </div>
          )}
          
          <ImageUploader 
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            disabled={isLoading}
          />
          {imagePreview && (
            <p className="text-xs text-gray-500 mt-1">
              A IA extrairá o texto da imagem, preservando a estrutura de listas, parágrafos e formatação do enunciado.
            </p>
          )}
        </div>
        
        {processingStep && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">{processingStep}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Questão
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionModal;
