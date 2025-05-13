import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Quiz, ColorOption } from "../types";
import NavBar from "@/components/NavBar";
import QuizCard from "@/components/QuizCard";
import CreateQuizCard from "@/components/CreateQuizCard";
import AddQuizModal from "@/components/AddQuizModal";
import RenameQuizModal from "@/components/RenameQuizModal";
import ChangeColorPopover from "@/components/ChangeColorPopover";
import DeleteQuizDialog from "@/components/DeleteQuizDialog";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
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

  const handleCreateQuiz = async (quizData: Omit<Quiz, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .insert([
          {
            user_id: user.id,
            title: quizData.title,
            color: quizData.color,
          },
        ])
        .select();

      if (error) throw error;
      
      if (data) {
        setQuizzes([...data, ...quizzes]);
        toast({
          title: "Quiz criado com sucesso!",
          description: "Seu novo quiz foi criado.",
        });
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Erro ao criar quiz",
        description: "Não foi possível criar o quiz.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateQuizTitle = async (quiz: Quiz, newTitle: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ title: newTitle })
        .eq("id", quiz.id);

      if (error) throw error;
      
      setQuizzes(
        quizzes.map((q) =>
          q.id === quiz.id ? { ...q, title: newTitle } : q
        )
      );
      
      toast({
        title: "Quiz renomeado com sucesso!",
        description: "O nome do quiz foi atualizado.",
      });
    } catch (error) {
      console.error("Error updating quiz title:", error);
      toast({
        title: "Erro ao renomear quiz",
        description: "Não foi possível renomear o quiz.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateQuizColor = async (quiz: Quiz, newColor: ColorOption) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ color: newColor })
        .eq("id", quiz.id);

      if (error) throw error;
      
      setQuizzes(
        quizzes.map((q) =>
          q.id === quiz.id ? { ...q, color: newColor } : q
        )
      );
      
      toast({
        title: "Cor atualizada com sucesso!",
        description: "A cor do quiz foi atualizada.",
      });
    } catch (error) {
      console.error("Error updating quiz color:", error);
      toast({
        title: "Erro ao atualizar cor",
        description: "Não foi possível atualizar a cor do quiz.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id);

      if (error) throw error;
      
      setQuizzes(quizzes.filter((q) => q.id !== quiz.id));
      
      toast({
        title: "Quiz excluído com sucesso!",
        description: "O quiz foi removido.",
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

  // Helper function to handle the QuizCard's onDelete prop
  const handleQuizDelete = (id: string) => {
    const quizToDelete = quizzes.find(q => q.id === id);
    if (quizToDelete) {
      setSelectedQuiz(quizToDelete);
      setIsDeleteDialogOpen(true);
    }
  };

  // Modal handlers
  const openRenameModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsRenameModalOpen(true);
  };

  const openColorPopover = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsColorPopoverOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8">Meus Quizzes</h1>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6EFD]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            <CreateQuizCard onClick={() => setIsAddQuizModalOpen(true)} />
            
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={openRenameModal}
                onColorChange={openColorPopover}
                onDelete={handleQuizDelete}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Modals */}
      <AddQuizModal
        isOpen={isAddQuizModalOpen}
        onClose={() => setIsAddQuizModalOpen(false)}
        onSave={handleCreateQuiz}
      />
      
      <RenameQuizModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onSave={handleUpdateQuizTitle}
        quiz={selectedQuiz}
      />
      
      <ChangeColorPopover
        isOpen={isColorPopoverOpen}
        onClose={() => setIsColorPopoverOpen(false)}
        onSave={handleUpdateQuizColor}
        quiz={selectedQuiz}
      />
      
      <DeleteQuizDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteQuiz}
        quiz={selectedQuiz}
      />
    </div>
  );
};

export default Home;
