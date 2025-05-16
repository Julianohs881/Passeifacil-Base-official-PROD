
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ImportCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportCodeDialog({
  isOpen,
  onClose,
  onSuccess,
}: ImportCodeDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImport = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar por código</DialogTitle>
          <DialogDescription>
            Insira um código de compartilhamento para importar um quiz ou questão.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="import-code"
                placeholder="Digite o código (ex: Q1234567 ou P1234567)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-center text-lg"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!code.trim() || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              "Importar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
