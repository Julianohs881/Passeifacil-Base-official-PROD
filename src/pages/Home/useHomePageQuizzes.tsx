
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, VisibilityOption } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const useHomePageQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile } = useAuth();

  const fetchQuizzes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      console.log("Fetching quizzes for user:", user.id, "Profile plan:", userProfile?.plan);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuizzes(data as Quiz[]);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [user, userProfile?.plan]); // Re-fetch quizzes when the user or their plan changes

  const handleToggleVisibility = async (quiz: Quiz, newVisibility: VisibilityOption) => {
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

  return {
    quizzes,
    isLoading,
    fetchQuizzes,
    handleToggleVisibility,
  };
};
