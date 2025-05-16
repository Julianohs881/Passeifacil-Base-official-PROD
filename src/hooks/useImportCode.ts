
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function useImportCode(onClose: () => void, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const importQuiz = async (shareCode: string) => {
    // Fetch the original quiz
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (quizError || !quizData) {
      throw new Error("Quiz não encontrado");
    }

    // Create a copy of the quiz for the current user
    const { data: newQuiz, error: insertError } = await supabase
      .from("quizzes")
      .insert({
        title: `${quizData.title} (Importado)`,
        color: quizData.color,
        user_id: user.id,
        faculty: quizData.faculty,
        course_year: quizData.course_year,
        course: quizData.course,
        visibility: "private", // Default to private for imported quizzes
      })
      .select("id")
      .single();

    if (insertError || !newQuiz) {
      throw new Error("Erro ao criar cópia do quiz");
    }

    // Fetch all questions from the original quiz
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizData.id);

    if (!questionsError && questions && questions.length > 0) {
      // Create copies of all questions for the new quiz
      const questionCopies = questions.map(q => ({
        quiz_id: newQuiz.id,
        statement: q.statement,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      }));

      await supabase.from("questions").insert(questionCopies);
    }

    toast({
      title: "Quiz importado com sucesso!",
      description: "O quiz foi adicionado à sua coleção.",
    });

    // Navigate to the new quiz
    navigate(`/quiz/${newQuiz.id}`);
    onClose();
    if (onSuccess) onSuccess();
  };

  const importQuestion = async (shareCode: string) => {
    // Fetch the original question
    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (questionError || !questionData) {
      throw new Error("Questão não encontrada");
    }

    // Need to fetch the current quiz first
    const { data: currentQuizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    let quizId: string;
    
    if (quizzesError || !currentQuizzes || currentQuizzes.length === 0) {
      // If no quiz exists, create a new one
      const { data: newQuiz, error: newQuizError } = await supabase
        .from("quizzes")
        .insert({
          title: "Questões Importadas",
          user_id: user.id,
          color: "bg-blue-500",
          visibility: "private",
        })
        .select("id")
        .single();
      
      if (newQuizError || !newQuiz) {
        throw new Error("Erro ao criar novo quiz para a questão importada");
      }
      
      quizId = newQuiz.id;
    } else {
      quizId = currentQuizzes[0].id;
    }

    // Create a copy of the question for the current user
    const { error: insertError } = await supabase
      .from("questions")
      .insert({
        quiz_id: quizId,
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

    // Navigate to the quiz containing the new question
    navigate(`/quiz/${quizId}`);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleImport = async (code: string) => {
    if (!code.trim() || !user) return;
    
    setLoading(true);
    
    try {
      const formattedCode = code.trim().toUpperCase();

      // Check if it's a quiz code (starts with Q)
      if (formattedCode.startsWith("Q")) {
        await importQuiz(formattedCode);
      } 
      // Check if it's a question code (starts with P)
      else if (formattedCode.startsWith("P")) {
        await importQuestion(formattedCode);
      } 
      else {
        toast({
          title: "Código inválido",
          description: "O formato do código não é válido. Verifique e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro ao importar",
        description: "Não foi possível importar o item. Verifique o código e tente novamente.",
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
