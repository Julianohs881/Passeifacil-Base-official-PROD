
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles, Loader2, Upload, X } from "lucide-react";
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
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB.",
          variant: "destructive",
        });
        return;
      }
      
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

  const clearImage = () => {
    setImagePreview(null);
    setContent("");
    setContentType("text");
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
      // Update processing step
      setProcessingStep("Processando entrada...");
      
      // Send to edge function
      setProcessingStep(contentType === "image" ? "Extraindo texto da imagem..." : "Analisando texto...");
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

      // Update processing step
      setProcessingStep("Salvando questão...");
      
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
      setProcessingStep(null);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setContent("");
      setImagePreview(null);
      setProcessingStep(null);
    }
  };

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
              disabled={isLoading}
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Criar Questão com IA</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Inserir Texto ou Imagem
              </label>
              
              {!imagePreview && (
                <div className="mb-4">
                  <textarea
                    className="w-full border rounded-md p-3 h-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Digite ou cole o texto da questão aqui..."
                    value={contentType === "text" ? content : ""}
                    onChange={handleTextChange}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              {imagePreview ? (
                <div className="mt-4 border rounded-md p-3 relative">
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    <X size={16} />
                  </button>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto object-contain rounded" 
                  />
                </div>
              ) : (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-3">Ou envie uma imagem da questão:</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-blue-600">Clique para enviar</span> ou arraste uma imagem
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG (Máx. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
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
                onClick={closeModal}
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
      )}
    </>
  );
};

export default CreateWithAIButton;
