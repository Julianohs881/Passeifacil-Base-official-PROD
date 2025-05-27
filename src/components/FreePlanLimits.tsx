
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Crown } from "lucide-react";

interface FreePlanLimitsProps {
  currentCount: number;
  limit: number;
  feature: "quizzes" | "explore";
  onUpgrade?: () => void;
}

const FreePlanLimits: React.FC<FreePlanLimitsProps> = ({
  currentCount,
  limit,
  feature,
  onUpgrade
}) => {
  const { isPro } = useAuth();
  const navigate = useNavigate();
  
  // Se é usuário PRO, não mostra limitações
  if (isPro()) return null;
  
  const remaining = Math.max(0, limit - currentCount);
  const isLimitReached = currentCount >= limit;
  
  const featureNames = {
    quizzes: "quizzes criados",
    explore: "quizzes explorados"
  };
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate("/subscription");
    }
  };
  
  if (isLimitReached) {
    return (
      <Alert variant="destructive" className="border-amber-200 bg-amber-50">
        <Lock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">Limite atingido</AlertTitle>
        <AlertDescription className="text-amber-700">
          Você atingiu o limite de {limit} {featureNames[feature]} do plano gratuito.
          <div className="mt-3">
            <Button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white"
              size="sm"
            >
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade para PRO
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <AlertTitle className="text-blue-700">Plano Gratuito</AlertTitle>
      <AlertDescription className="text-blue-700">
        Você tem {remaining} de {limit} {featureNames[feature]} restantes.
        <div className="mt-2">
          <Button 
            onClick={handleUpgrade}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-100"
            size="sm"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade para ilimitado
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default FreePlanLimits;
