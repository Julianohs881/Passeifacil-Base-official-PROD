
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useImportQuestionCode(
  currentQuizId: string,
  onClose: () => void,
  onSuccess?: () => void
) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async (code: string) => {
    if (!code.trim() || !currentQuizId) return;
    
    setLoading(true);
    
    try {
      const formattedCode = code.trim().toUpperCase();

      // Only allow question codes (starting with P)
      if (!formattedCode.startsWith("P")) {
        toast({
          title: "Código inválido",
          description: "O código deve começar com P para questões. Exemplo: P1234567",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch the original question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("share_code", formattedCode)
        .single();

      if (questionError || !questionData) {
        throw new Error("Questão não encontrada");
      }

      // Create a copy of the question for the current quiz
      const { error: insertError } = await supabase
        .from("questions")
        .insert({
          quiz_id: currentQuizId,
          statement: questionData.statement,
          options: questionData.options,
          correct_index: questionData.correct_index,
          explanation: questionData.explanation,
        });

      if (insertError) {
        throw new Error("Erro ao importar questão");
      }

      toast({
        title: "Questão importada com sucesso!",
        description: "A questão foi adicionada ao seu quiz.",
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar a questão. Verifique o código e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleImport,
  };
}
