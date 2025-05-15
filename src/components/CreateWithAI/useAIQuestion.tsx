
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";

interface UseAIQuestionProps {
  quizId: string;
  onSuccess: () => void;
}

export const useAIQuestion = ({ quizId, onSuccess }: UseAIQuestionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const { toast } = useToast();

  const createQuestionWithAI = async (content: string, contentType: "text" | "image") => {
    if (!content) {
      toast({
        title: "Conteúdo necessário",
        description: "Por favor, forneça texto ou uma imagem para gerar a questão.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Update processing step
      setProcessingStep("Iniciando processamento...");
      
      if (contentType === "image") {
        setProcessingStep("Extraindo texto da imagem (isso pode levar alguns segundos)...");
      } else {
        setProcessingStep("Analisando texto fornecido...");
      }
      
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

      // Update processing step
      setProcessingStep("Salvando questão no banco de dados...");
      
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
        description: "A questão foi extraída e adicionada ao quiz.",
      });

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error creating question with AI:", error);
      toast({
        title: "Erro ao criar questão",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      setProcessingStep(null);
    }
  };

  return {
    isLoading,
    processingStep,
    createQuestionWithAI,
  };
};
