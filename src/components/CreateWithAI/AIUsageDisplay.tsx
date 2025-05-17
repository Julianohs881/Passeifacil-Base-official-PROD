
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";

interface AIUsageDisplayProps {
  variant?: "compact" | "detailed";
  className?: string;
}

const AIUsageDisplay: React.FC<AIUsageDisplayProps> = ({ 
  variant = "detailed",
  className = "" 
}) => {
  const { userProfile, isPro } = useAuth();
  
  // If user is not Pro, don't show anything
  if (!isPro()) return null;
  
  // Calculate usage stats
  const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
  const aiQuestionsLimit = 50;
  const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);
  const percentUsed = Math.min(100, (aiQuestionsCreated / aiQuestionsLimit) * 100);
  
  // Determine color based on usage percentage
  const getProgressColor = () => {
    if (percentUsed >= 90) return "bg-red-500";
    if (percentUsed >= 70) return "bg-amber-500";
    return "bg-green-500";
  };

  if (variant === "compact") {
    return (
      <div className={`text-xs text-gray-600 ${className}`}>
        <div className="flex justify-between mb-1">
          <span>Questões IA: {aiQuestionsCreated}/{aiQuestionsLimit}</span>
        </div>
        <Progress value={percentUsed} className="h-1.5 w-full" indicatorClassName={getProgressColor()} />
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Questões criadas com IA este mês</h4>
        <span className="text-sm font-medium">{aiQuestionsCreated}/{aiQuestionsLimit}</span>
      </div>
      
      <Progress value={percentUsed} className="h-2" indicatorClassName={getProgressColor()} />
      
      <p className="text-sm text-gray-600">
        {aiQuestionsRemaining > 0 
          ? `Restam ${aiQuestionsRemaining} questões para criar este mês.`
          : "Você atingiu o limite mensal de questões geradas com IA."
        }
      </p>
    </div>
  );
};

export default AIUsageDisplay;
