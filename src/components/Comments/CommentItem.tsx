
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Comment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formattedDate = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : "";

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
        <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm">
              Usuário
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
