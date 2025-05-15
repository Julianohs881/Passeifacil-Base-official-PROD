
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";

interface CreateWithAIButtonProps {
  quizId: string;
  onSuccess: () => void;
}

const CreateWithAIButton: React.FC<CreateWithAIButtonProps> = ({ quizId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"text" | "image">("text");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setImagePreview(event.target.result);
          setContent(event.target.result);
          setContentType("image");
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setContentType("text");
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!content) {
      toast({
        title: "Conteúdo necessário",
        description: "Por favor, forneça texto ou uma imagem para gerar a questão.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Send to edge function
      const { data: generatedQuestion, error } = await supabase.functions.invoke("generate-question", {
        body: {
          content,
          contentType,
        },
      });

      if (error) throw error;

      if (!generatedQuestion || !generatedQuestion.statement || !generatedQuestion.options) {
        throw new Error("A resposta gerada não contém dados válidos para uma questão");
      }

      // Save the question to the database
      const { error: saveError } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            statement: generatedQuestion.statement,
            options: generatedQuestion.options,
            correct_index: generatedQuestion.correct_index,
            explanation: generatedQuestion.explanation || "",
          },
        ]);

      if (saveError) throw saveError;

      toast({
        title: "Questão criada com sucesso",
        description: "A questão gerada pela IA foi adicionada ao quiz.",
      });

      // Reset and close modal
      setContent("");
      setImagePreview(null);
      setIsModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating question with AI:", error);
      toast({
        title: "Erro ao criar questão",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Button
        variant="ghost" 
        size="sm"
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        onClick={openModal}
      >
        <Sparkles className="h-4 w-4" />
        <span>Criar com IA</span>
      </Button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Criar Questão com IA</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Inserir Texto ou Imagem
              </label>
              <div className="space-y-4">
                <textarea
                  className="w-full border rounded-md p-2 h-32"
                  placeholder="Digite ou cole o texto da questão aqui..."
                  value={contentType === "text" ? content : ""}
                  onChange={handleTextChange}
                />
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Ou envie uma imagem da questão:</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                
                {imagePreview && (
                  <div className="mt-2 border rounded p-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content || isLoading}
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
      )}
    </>
  );
};

export default CreateWithAIButton;
