import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Quiz, VisibilityOption } from "@/types";
import AddQuizModal from "@/components/QuizForms/AddQuizModal";

const CreateQuiz = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { quizId } = useParams<{ quizId: string }>();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(!!quizId);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        try {
          const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("id", quizId)
            .single();

          if (error) throw error;
          
          setEditingQuiz({...data, color: "bg-gray-50"}); // Cor padrão fixa
        } catch (error) {
          console.error("Erro ao carregar quiz para edição:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do quiz.",
            variant: "destructive",
          });
          navigate("/quizzes");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate, toast]);

  const handleSaveQuiz = async (quizData: Omit<Quiz, "id" | "user_id" | "created_at">) => {
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

      let result;
      if (editingQuiz) {
        result = await supabase
          .from("quizzes")
          .update(quizData)
          .eq("id", editingQuiz.id)
          .select("*")
          .single();

        if (result.error) throw result.error;

        toast({
          title: "Quiz atualizado com sucesso!",
          description: "",
        });

      } else {
        result = await supabase
          .from("quizzes")
          .insert({
            ...quizData,
            user_id: user.id,
          })
          .select("*")
          .single();

        if (result.error) throw result.error;
        
        toast({
          title: "Quiz criado com sucesso!",
          description: "Você já pode começar a adicionar questões.",
        });
      }

      navigate(`/quiz/${result.data.id}`);
    } catch (error) {
      console.error("Erro ao salvar quiz:", error);
      toast({
        title: `Erro ao ${editingQuiz ? 'atualizar' : 'criar'} quiz`,
        description: "Ocorreu um erro ao salvar o quiz. Tente novamente.",
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
        onSave={handleSaveQuiz}
        quiz={editingQuiz}
      />
    </div>
  );
};

export default CreateQuiz;
