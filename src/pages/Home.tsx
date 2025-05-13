
import { useEffect, useState } from "react";
import CardQuiz from "../components/CardQuiz";
import AddQuizModal from "../components/AddQuizModal";
import { Quiz, ColorOption, QUIZ_COLORS } from "../types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";

const Home = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>(undefined);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Erro ao carregar quizzes",
        description: "Não foi possível carregar seus quizzes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async (quiz: { title: string; color: ColorOption }) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.from("quizzes").insert([
        {
          user_id: user.id,
          title: quiz.title,
          color: quiz.color,
        },
      ]).select();

      if (error) throw error;
      
      setQuizzes([...(data || []), ...quizzes]);
      toast({
        title: "Quiz criado com sucesso!",
        description: "Seu novo quiz foi adicionado à sua coleção.",
      });
    } catch (error) {
      console.error("Error adding quiz:", error);
      toast({
        title: "Erro ao criar quiz",
        description: "Não foi possível criar o quiz.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateQuiz = async (quiz: { title: string; color: ColorOption }) => {
    if (!editingQuiz || !user) return;
    
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({
          title: quiz.title,
          color: quiz.color,
        })
        .eq("id", editingQuiz.id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setQuizzes(
        quizzes.map((q) =>
          q.id === editingQuiz.id
            ? { ...q, title: quiz.title, color: quiz.color }
            : q
        )
      );
      
      toast({
        title: "Quiz atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast({
        title: "Erro ao atualizar quiz",
        description: "Não foi possível atualizar o quiz.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
      
      toast({
        title: "Quiz excluído com sucesso!",
        description: "O quiz foi removido da sua coleção.",
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Erro ao excluir quiz",
        description: "Não foi possível excluir o quiz.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsAddModalOpen(true);
  };

  const handleSaveQuiz = async (quiz: { title: string; color: ColorOption }) => {
    if (editingQuiz) {
      await handleUpdateQuiz(quiz);
    } else {
      await handleAddQuiz(quiz);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingQuiz(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meus Quizzes</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-violet-500 hover:bg-violet-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Quiz</span>
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center my-16">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              Você ainda não tem quizzes
            </h2>
            <p className="text-gray-500 mb-8">
              Comece criando seu primeiro quiz clicando no botão acima.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {quizzes.map((quiz) => (
              <CardQuiz
                key={quiz.id}
                quiz={quiz}
                onDelete={handleDeleteQuiz}
                onEdit={handleEditQuiz}
              />
            ))}
          </div>
        )}
        
        <AddQuizModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveQuiz}
          quiz={editingQuiz}
        />
      </main>
    </div>
  );
};

export default Home;
