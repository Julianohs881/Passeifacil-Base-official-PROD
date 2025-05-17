
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, parseColorOption, ColorOption, VisibilityOption } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import QuizCard from "@/components/QuizCard";
import ProfileIncompleteAlert from "@/components/ProfileIncompleteAlert";

const HomePageHeader = ({ onCreateQuiz }: { onCreateQuiz: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Seus Quizzes</h1>
      <p className="text-gray-500">
        Crie e gerencie seus quizzes personalizados
      </p>
    </div>
    <Button onClick={onCreateQuiz} className="bg-violet-500 hover:bg-violet-600">
      <PlusCircle className="mr-2 h-4 w-4" />
      Criar Quiz
    </Button>
  </div>
);

const Home = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar quizzes:", error);
        return;
      }

      // Parse the color and visibility properties to ensure they conform to their expected types
      const parsedQuizzes: Quiz[] = (data || []).map(quiz => ({
        ...quiz,
        color: parseColorOption(quiz.color),
        // Ensure visibility is either "public" or "private" (if not, default to "private")
        visibility: (quiz.visibility === "public" ? "public" : "private") as VisibilityOption
      }));
      
      setQuizzes(parsedQuizzes);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    navigate("/quizzes/new");
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state by filtering out the deleted quiz
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    // Navigate to edit page or open edit modal
    console.log("Edit quiz:", quiz);
  };

  const handleColorChange = (quiz: Quiz) => {
    // Open color change popover or modal
    console.log("Change color for quiz:", quiz);
  };

  const handleToggleVisibility = async (quiz: Quiz, newVisibility: VisibilityOption) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ visibility: newVisibility })
        .eq("id", quiz.id);

      if (error) throw error;
      
      // Update the local state to reflect the change
      setQuizzes(quizzes.map(q => 
        q.id === quiz.id ? { ...q, visibility: newVisibility } : q
      ));
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  return (
    <div className="container py-6">
      <ProfileIncompleteAlert />
      <HomePageHeader onCreateQuiz={handleCreateQuiz} />

      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#0D6EFD]"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 rounded-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Nenhum Quiz Criado
            </CardTitle>
            <CardDescription>
              Comece a criar seus quizzes agora mesmo!
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-gray-500">
              Crie quizzes personalizados e compartilhe com seus amigos e
              alunos.
            </p>
            <Button onClick={handleCreateQuiz} className="bg-violet-500 hover:bg-violet-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Primeiro Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              onDelete={handleDeleteQuiz}
              onEdit={handleEditQuiz}
              onColorChange={handleColorChange}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
