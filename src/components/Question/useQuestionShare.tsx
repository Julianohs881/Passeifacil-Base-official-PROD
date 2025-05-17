
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types";

export function useQuestionShare(question: Question, isPRO: boolean) {
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isLoadingShareCode, setIsLoadingShareCode] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Effect to load share code if the question doesn't have one
  useEffect(() => {
    if (question.share_code) {
      console.log("Question has share_code:", question.share_code);
      setShareCode(question.share_code);
      return;
    }

    const fetchShareCode = async () => {
      if (!question.id) return;
      
      console.log("Fetching share code for question:", question.id);
      setIsLoadingShareCode(true);
      
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("share_code")
          .eq("id", question.id)
          .single();
          
        if (error) {
          console.error("Error fetching share code:", error);
          setShareCode(null);
          return;
        }
        
        console.log("Received share code data:", data);
        if (data && data.share_code) {
          setShareCode(data.share_code);
        } else {
          console.error("No share code found for question");
          setShareCode(null);
        }
      } catch (error) {
        console.error("Exception fetching share code:", error);
        setShareCode(null);
      } finally {
        setIsLoadingShareCode(false);
      }
    };
    
    if (isPRO && isShareDialogOpen) {
      fetchShareCode();
    }
  }, [question.id, question.share_code, isShareDialogOpen, isPRO]);

  const handleOpenShareDialog = () => {
    setShareCode(question.share_code);
    setIsShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setIsShareDialogOpen(false);
  };

  return {
    shareCode,
    isLoadingShareCode,
    isShareDialogOpen,
    handleOpenShareDialog,
    handleCloseShareDialog
  };
}
