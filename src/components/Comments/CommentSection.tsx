
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  questionId: string;
  userAnswer?: number;
  isPublicQuiz: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  questionId,
  userAnswer,
  isPublicQuiz,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPublicQuiz) {
      fetchComments();
    }
  }, [questionId, isPublicQuiz]);

  // Não exibir comentários em quizzes privados
  if (!isPublicQuiz) return null;

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Você precisa estar logado",
        description: "Faça login para comentar nesta questão.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva algo antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("comments").insert({
        question_id: questionId,
        user_id: user.id,
        content: newComment.trim(),
        user_answer: userAnswer,
      });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado com sucesso.",
      });

      // Atualizar lista de comentários
      fetchComments();
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar seu comentário.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-800">
        <MessageCircle className="mr-2 h-5 w-5" />
        Comentários ({comments.length})
      </h3>

      {/* Formulário para novo comentário */}
      <div className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário sobre esta questão..."
          rows={3}
          className="mb-2 resize-none"
        />
        <div className="flex justify-between items-center">
          {userAnswer !== undefined && (
            <div className="text-sm text-gray-500">
              * Sua resposta ({String.fromCharCode(65 + userAnswer)}) será incluída no comentário
            </div>
          )}
          <Button
            onClick={handleSubmitComment}
            disabled={submitting}
            className="ml-auto"
          >
            {submitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </div>

      {/* Lista de comentários */}
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#0D6EFD]"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </div>
      )}
    </div>
  );
};

export default CommentSection;
