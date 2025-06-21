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
import ChangeColorPopover from "@/components/ChangeColorPopover";
import ProfileIncompleteAlert from "@/components/ProfileIncompleteAlert";
import FreePlanLimits from "@/components/FreePlanLimits";
import { HomePageHeader } from "./HomePageHeader";
import { ImportCodeDialog } from "@/components/Share/ImportCodeDialog";
import { QuizGrid } from "./QuizGrid";
import { useToast } from "@/hooks/use-toast";
import { useFreePlanLimits } from "@/hooks/useFreePlanLimits";

const Home = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { user, isPro } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    createdQuizzesCount,
    canCreateQuiz,
    getRemainingCreatedQuizzes,
    showUpgradeToast,
    refreshCounts,
    limits
  } = useFreePlanLimits();

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
      refreshCounts();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    if (!canCreateQuiz()) {
      showUpgradeToast("create");
      navigate("/subscription");
      return;
    }
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
      refreshCounts();
      toast({
        title: "Quiz excluído",
        description: "Quiz excluído com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir este quiz.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    // Navigate to edit page or open edit modal
    navigate(`/quizzes/${quiz.id}/edit`);
  };

  const handleSaveQuizColor = async (quizToUpdate: Quiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ color: quizToUpdate.color })
        .eq("id", quizToUpdate.id);

      if (error) throw error;
      
      // Update the local state with the new color
      setQuizzes(
        quizzes.map((q) => (q.id === quizToUpdate.id ? { ...q, color: quizToUpdate.color } : q))
      );
      
      toast({
        title: "Cor alterada",
        description: "Cor do quiz alterada com sucesso!",
      });
    } catch (error) {
      console.error("Error changing quiz color:", error);
      toast({
        title: "Erro ao alterar cor",
        description: "Não foi possível alterar a cor deste quiz.",
        variant: "destructive",
      });
    }
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
      
      toast({
        title: "Visibilidade alterada",
        description: `Quiz agora é ${newVisibility === 'public' ? 'público' : 'privado'}.`,
      });
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Erro ao alterar visibilidade",
        description: "Não foi possível alterar a visibilidade deste quiz.",
        variant: "destructive",
      });
    }
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  const handleImportSuccess = () => {
    fetchQuizzes();
  };

  return (
    <div className="container py-8">
      <ProfileIncompleteAlert />
      
      {/* Mostrar botão de Upgrade para usuários gratuitos */}
      {/* BOTÃO MOVIDO PARA HOMEPAGEHEADER */}
      {/* {!isPro() && (
        <div className="mb-6 flex justify-center">
          <Button 
            onClick={() => navigate("/subscription")}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Upgrade para PRO
          </Button>
        </div>
      )} */}
      
      <HomePageHeader 
        onOpenCreateQuiz={handleCreateQuiz}
        onOpenImportDialog={handleOpenImportDialog}
      />

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 rounded-lg shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">
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
            <Button 
              onClick={handleCreateQuiz} 
              className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
              disabled={!canCreateQuiz()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Primeiro Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6">
          <QuizGrid
            quizzes={quizzes}
            onOpenCreateQuiz={handleCreateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onEditQuiz={handleEditQuiz}
            onChangeColor={handleSaveQuizColor}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      )}

      <ImportCodeDialog 
        isOpen={isImportDialogOpen}
        onClose={handleCloseImportDialog}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default Home;
