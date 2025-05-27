
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { UserPlan } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface PlanBadgeProps {
  plan: UserPlan;
  className?: string;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, className }) => {
  const { isPro } = useAuth();
  
  // Use isPro() function to determine if user is actually PRO
  if (isPro()) {
    return (
      <Badge 
        variant="outline" 
        className={`bg-gradient-to-r from-amber-400 to-yellow-500 text-white flex items-center gap-1 ${className}`}
      >
        <Crown className="h-3 w-3" />
        <span>PRO</span>
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`bg-gray-200 text-gray-700 flex items-center gap-1 ${className}`}
    >
      <span>Gratuito</span>
    </Badge>
  );
};

export default PlanBadge;
