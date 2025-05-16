
import React from "react";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

interface PremiumFeatureGateProps {
  feature: 'ai' | 'share' | 'import' | 'explore';
  children: React.ReactNode;
  className?: string;
}

const featureNames = {
  ai: "Criar com IA",
  share: "Compartilhar",
  import: "Importar",
  explore: "Explorar"
};

const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({ feature, children, className }) => {
  const { isPro, hasReachedAILimit } = useAuth();
  
  // Check if user is PRO and if it's the AI feature, check if they've reached the limit
  const hasAccess = isPro() && (feature !== 'ai' || !hasReachedAILimit());
  
  if (hasAccess) {
    return <>{children}</>;
  }

  const message = feature === 'ai' && isPro()
    ? "Você atingiu o limite de 50 questões criadas com IA."
    : `Recurso exclusivo para assinantes PRO.`;

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-lg">
        <Lock className="w-8 h-8 text-gray-500 mb-2" />
        <p className="text-sm text-gray-700 font-medium mb-2">
          {message}
        </p>
        <Button 
          variant="default" 
          size="sm"
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
        >
          Fazer Upgrade
        </Button>
      </div>
    </div>
  );
};

export default PremiumFeatureGate;
