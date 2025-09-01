import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, VisibilityOption } from "@/types";
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

      // Buscar nome do usuário atual
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user!.id)
        .single();

      const userName = profile?.name || "Você";

      // Definir cor padrão para todos os quizzes e adicionar nome do criador
      const parsedQuizzes: Quiz[] = (data || []).map(quiz => {
        console.log("Quiz carregado:", quiz); // Debug: verificar campos
        return {
          ...quiz,
          color: "bg-gray-50", // Cor padrão fixa
          // Ensure visibility is either "public" or "private" (if not, default to "private")
          visibility: (quiz.visibility === "public" ? "public" : "private") as VisibilityOption,
          // Adicionar campo createdBy para compatibilidade com o modal
          createdBy: userName
        };
      });
      
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

  const handleStartQuiz = (quizId: string) => {
    // Navegar para a página do quiz para iniciar
    navigate(`/quiz/${quizId}`);
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
            onToggleVisibility={handleToggleVisibility}
            onStartQuiz={handleStartQuiz}
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
