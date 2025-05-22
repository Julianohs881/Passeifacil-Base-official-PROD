
import React from "react";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

interface PremiumFeatureGateProps {
  feature: 'ai' | 'share' | 'import' | 'explore';
  children: React.ReactNode;
  className?: string;
  hideCompletely?: boolean;
}

const featureNames = {
  ai: "Criar com IA",
  share: "Compartilhar",
  import: "Importar",
  explore: "Explorar"
};

const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({ 
  feature, 
  children, 
  className,
  hideCompletely = true // Default to completely hiding the feature for free users
}) => {
  const { isPro, hasReachedAILimit, userProfile } = useAuth();
  
  // Calculate AI usage metrics for Pro users
  const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
  const aiQuestionsLimit = 50;
  const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);
  
  // Debug log to inspect state
  console.log("PremiumFeatureGate checking feature access:", {
    feature,
    isPro: isPro(),
    plan: userProfile?.plan,
    has_access: userProfile?.has_access,
    ai_limit_reached: hasReachedAILimit()
  });
  
  // Check if user is PRO and if it's the AI feature, check if they've reached the limit
  const hasAccess = isPro() && (feature !== 'ai' || !hasReachedAILimit());
  
  // If user has access, show the feature
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If hideCompletely is true, don't render anything for free users
  if (hideCompletely) {
    return null;
  }

  // Otherwise, show the disabled version with upgrade message (for cases where we explicitly want to show it)
  const message = feature === 'ai' && isPro()
    ? `Você atingiu o limite de ${aiQuestionsLimit} questões criadas com IA neste mês.`
    : `Recurso exclusivo para assinantes PRO.`;

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-lg">
        <Lock className="w-8 h-8 text-gray-500 mb-2" />
        <p className="text-sm text-gray-700 font-medium mb-2 text-center px-4">
          {message}
        </p>
        {feature === 'ai' && isPro() && (
          <p className="text-xs text-gray-600 mb-2 text-center px-4">
            Você já criou {aiQuestionsCreated} de {aiQuestionsLimit} questões este mês.
          </p>
        )}
        <Button 
          variant="default" 
          size="sm"
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
        >
          {feature === 'ai' && isPro() ? "Aguarde o próximo mês" : "Fazer Upgrade"}
        </Button>
      </div>
    </div>
  );
};

export default PremiumFeatureGate;
