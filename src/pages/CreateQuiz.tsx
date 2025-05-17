
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Quiz, ColorOption, VisibilityOption } from "@/types";
import AddQuizModal from "@/components/QuizForms/AddQuizModal";

const CreateQuiz = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateQuiz = async (quizData: Omit<Quiz, "id" | "user_id" | "created_at">) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um quiz.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          ...quizData,
          user_id: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      toast({
        title: "Quiz criado com sucesso!",
        description: "Você já pode começar a adicionar questões.",
      });

      // Navigate to the quiz page
      navigate(`/quiz/${data.id}`);
    } catch (error) {
      console.error("Erro ao criar quiz:", error);
      toast({
        title: "Erro ao criar quiz",
        description: "Ocorreu um erro ao criar o quiz. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/quizzes");
  };

  return (
    <div className="container py-8">
      <AddQuizModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleCreateQuiz}
      />
    </div>
  );
};

export default CreateQuiz;
