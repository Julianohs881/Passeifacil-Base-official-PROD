
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Quiz } from "@/types";
import NavBar from "@/components/NavBar";
import AddQuizModal from "@/components/QuizForms/AddQuizModal";
import RenameQuizModal from "@/components/RenameQuizModal";
import DeleteQuizDialog from "@/components/DeleteQuizDialog";
import ChangeColorPopover from "@/components/ChangeColorPopover";
import { ImportCodeDialog } from "@/components/Share/ImportCodeDialog";
import { HomePageHeader } from "./HomePageHeader";
import { QuizGrid } from "./QuizGrid";
import { useHomePageQuizzes } from "./useHomePageQuizzes";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const colorPickerAnchorRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizzes, fetchQuizzes, handleToggleVisibility } = useHomePageQuizzes();

  const handleQuizCreated = () => {
    fetchQuizzes();
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsEditDialogOpen(true);
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

      fetchQuizzes();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleOpenColorPicker = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsColorPickerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto py-8 px-4">
        <HomePageHeader 
          onOpenCreateQuiz={() => setIsDialogOpen(true)}
          onOpenImportDialog={() => setIsImportDialogOpen(true)}
        />

        <QuizGrid 
          quizzes={quizzes}
          onOpenCreateQuiz={() => setIsDialogOpen(true)}
          onDeleteQuiz={handleDeleteQuiz}
          onEditQuiz={handleEditQuiz}
          onChangeColor={handleOpenColorPicker}
          onToggleVisibility={handleToggleVisibility}
        />

        {/* Add Quiz Dialog */}
        <AddQuizModal
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={async (quiz) => {
            try {
              const { error } = await supabase
                .from("quizzes")
                .insert({
                  ...quiz,
                  user_id: user?.id,
                });

              if (error) throw error;
              
              handleQuizCreated();
            } catch (error) {
              console.error("Error creating quiz:", error);
            }
          }}
        />

        {/* Edit Quiz Dialog */}
        <RenameQuizModal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          quiz={selectedQuiz}
          onSave={async (updatedQuiz) => {
            try {
              const { error } = await supabase
                .from("quizzes")
                .update({ title: updatedQuiz.title })
                .eq("id", updatedQuiz.id);

              if (error) throw error;
              
              fetchQuizzes();
            } catch (error) {
              console.error("Error updating quiz:", error);
            }
          }}
        />

        {/* Delete Quiz Dialog */}
        <DeleteQuizDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          quiz={selectedQuiz}
          onConfirm={confirmDeleteQuiz}
        />

        {/* Color Picker Popover */}
        <ChangeColorPopover
          isOpen={isColorPickerOpen}
          onClose={() => setIsColorPickerOpen(false)}
          quiz={selectedQuiz}
          onSave={async (quiz, newColor) => {
            try {
              const { error } = await supabase
                .from("quizzes")
                .update({ color: newColor })
                .eq("id", quiz.id);

              if (error) throw error;
              
              fetchQuizzes();
            } catch (error) {
              console.error("Error updating quiz color:", error);
            }
          }}
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
