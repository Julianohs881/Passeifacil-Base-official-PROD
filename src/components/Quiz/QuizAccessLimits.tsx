import React from 'react';
import { Lock, Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

interface QuizAccessLimitsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  accessibleCount: number;
  remainingFree: number;
  lockedCount: number;
  percentageUsed: number;
  percentageOfTotal: number;
  onUpgradeClick?: () => void;
}

const QuizAccessLimits: React.FC<QuizAccessLimitsProps> = ({
  currentQuestionIndex,
  totalQuestions,
  accessibleCount,
  remainingFree,
  lockedCount,
  percentageUsed,
  percentageOfTotal,
  onUpgradeClick
}) => {
  const { isPro } = useAuth();
  const isProUser = isPro();

  // Se for usuário PRO, não mostrar nada
  if (isProUser) {
    return null;
  }

  const hasReachedLimit = currentQuestionIndex >= accessibleCount;
  const isNearLimit = remainingFree <= 2 && remainingFree > 0;

  return (
    <div className="space-y-4">
      {/* Barra de Progresso */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Progresso do Quiz
              </span>
            </div>
            <span className="text-xs text-orange-600">
              {currentQuestionIndex + 1} de {totalQuestions}
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={percentageOfTotal} 
              className="h-2"
            />
            
            <div className="flex justify-between text-xs text-orange-700">
              <span>
                {percentageOfTotal}% do quiz completo
              </span>
              <span>
                {remainingFree} questões gratuitas restantes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Limite Atingido */}
      {hasReachedLimit && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-red-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">
                  Limite do plano gratuito atingido
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  Você respondeu {accessibleCount} de {totalQuestions} questões (30%). 
                  Desbloqueie o restante com o plano PRO!
                </p>
                <Button 
                  onClick={onUpgradeClick}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer upgrade para PRO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem de Quase no Limite */}
      {isNearLimit && !hasReachedLimit && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-1">
                  Quase no limite!
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Você já acessou {percentageOfTotal}% do quiz. 
                  Restam apenas {remainingFree} questões gratuitas.
                </p>
                <Button 
                  onClick={onUpgradeClick}
                  size="sm"
                  variant="outline"
                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer upgrade para PRO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre Questões Bloqueadas */}
      {lockedCount > 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>
                {lockedCount} questões bloqueadas no plano gratuito
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizAccessLimits;
