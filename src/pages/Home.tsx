import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Quiz } from "../types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import NavBar from "@/components/NavBar";
import QuizCard from "@/components/QuizCard";
import AddQuizModal from "@/components/AddQuizModal";
import RenameQuizModal from "@/components/RenameQuizModal";
import DeleteQuizDialog from "@/components/DeleteQuizDialog";
import ChangeColorPopover from "@/components/ChangeColorPopover";
import CreateQuizCard from "@/components/CreateQuizCard";
import { ImportCodeDialog } from "@/components/Share/ImportCodeDialog";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const colorPickerAnchorRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuizzes(data as Quiz[]);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleQuizCreated = () => {
    fetchQuizzes();
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsEditDialogOpen(true);
  };

  const handleQuizUpdated = () => {
    fetchQuizzes();
  };

  const handleDeleteQuiz = (id: string) => {
    setSelectedQuiz({ id } as Quiz);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!selectedQuiz?.id) return;

    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", selectedQuiz.id);

      if (error) throw error;

      setQuizzes(quizzes.filter((quiz) => quiz.id !== selectedQuiz.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleOpenColorPicker = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsColorPickerOpen(true);
  };

  const handleColorChanged = () => {
    fetchQuizzes();
  };

  const handleToggleVisibility = async (quiz: Quiz, newVisibility: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ visibility: newVisibility })
        .eq("id", quiz.id);

      if (error) throw error;

      // Update the local state to reflect the new visibility
      setQuizzes(
        quizzes.map((q) => (q.id === quiz.id ? { ...q, visibility: newVisibility } : q))
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Meus Quizzes</h1>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="flex-1 md:flex-none"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> 
              Novo Quiz
            </Button>
            <Button 
              onClick={() => navigate("/explore")}
              variant="outline"
              className="flex-1 md:flex-none border-blue-500 text-blue-900"
            >
              Explorar
            </Button>
            <Button
              onClick={() => setIsImportDialogOpen(true)}
              variant="outline"
              className="flex-1 md:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Importar por Código
            </Button>
          </div>
        </div>

        {/* Grid of Quiz Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
          <CreateQuizCard onClick={() => setIsDialogOpen(true)} />
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={handleDeleteQuiz}
              onEdit={handleEditQuiz}
              onColorChange={handleOpenColorPicker}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>

        {/* Add Quiz Dialog */}
        <AddQuizModal
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onQuizCreated={handleQuizCreated}
        />

        {/* Edit Quiz Dialog */}
        <RenameQuizModal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          quiz={selectedQuiz}
          onQuizUpdated={handleQuizUpdated}
        />

        {/* Delete Quiz Dialog */}
        <DeleteQuizDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          quizTitle={selectedQuiz?.title || ""}
          onConfirmDelete={confirmDeleteQuiz}
        />

        {/* Color Picker Popover */}
        <ChangeColorPopover
          isOpen={isColorPickerOpen}
          onClose={() => setIsColorPickerOpen(false)}
          quiz={selectedQuiz}
          onColorChange={handleColorChanged}
          anchorRef={colorPickerAnchorRef}
        />

        {/* Import Code Dialog */}
        <ImportCodeDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onSuccess={fetchQuizzes}
        />
      </main>
    </div>
  );
};

export default Home;
