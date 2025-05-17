
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Comment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formattedDate = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : "";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", comment.user_id)
          .single();

        if (error) throw error;

        if (data) {
          setUserName(data.name || null);
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [comment.user_id]);

  // Renderizar o indicador da resposta do usuário
  const renderAnswerBadge = () => {
    if (comment.user_answer === undefined) return null;

    return (
      <Badge
        variant="outline"
        className={`ml-2 ${
          comment.user_answer === undefined
            ? "bg-gray-100"
            : "bg-blue-50 text-blue-800 border-blue-200"
        }`}
      >
        Respondeu: {String.fromCharCode(65 + comment.user_answer)}
      </Badge>
    );
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
      <div className="flex items-start">
        <Avatar className="h-8 w-8 mr-3">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={userName || "Usuário"} />
          ) : (
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <User className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm">
              {isLoading ? "Carregando..." : (userName || "Usuário")}
            </span>
            {renderAnswerBadge()}
            <span className="text-gray-500 text-xs ml-auto">{formattedDate}</span>
          </div>
          <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
