
import { Plus } from "lucide-react";

interface CreateQuizCardProps {
  onClick: () => void;
}

const CreateQuizCard = ({ onClick }: CreateQuizCardProps) => {
  return (
    <button
      onClick={onClick}
      className="quiz-card bg-[#F7F9FC] border-2 border-dashed border-[#CED4DA] text-[#6C757D] p-5 flex flex-col items-center justify-center text-center"
    >
      <Plus className="h-6 w-6 mb-2" />
      <span className="text-base font-medium">Criar novo Quiz</span>
    </button>
  );
};

export default CreateQuizCard;
