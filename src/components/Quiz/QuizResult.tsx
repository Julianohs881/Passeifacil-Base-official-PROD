import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, BarChart3, RotateCcw, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizResultProps {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  onRetryIncorrect: () => void;
  onRetryAll: () => void;
  isRetry?: boolean;
  previousResult?: {
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
  };
}

const QuizResult: React.FC<QuizResultProps> = ({
  correctAnswers,
  totalQuestions,
  percentage,
  onRetryIncorrect,
  onRetryAll,
  isRetry = false,
  previousResult
}) => {
  const navigate = useNavigate();

  const incorrectAnswers = totalQuestions - correctAnswers;
  const isPerfect = percentage === 100;
  const isGood = percentage >= 70;

  const handleGoToCommunity = () => {
    navigate('/explore');
  };

  // Calcular melhoria se for um retry
  const improvement = previousResult ? {
    correctImprovement: correctAnswers - previousResult.correctAnswers,
    percentageImprovement: percentage - previousResult.percentage
  } : null;

  const getResultMessage = () => {
    if (isRetry && improvement) {
      if (improvement.correctImprovement > 0) {
        return `✨ Você corrigiu ${improvement.correctImprovement} dos seus ${previousResult!.totalQuestions - previousResult!.correctAnswers} erros!`;
      } else {
        return "🔄 Resultado do treino";
      }
    }
    
    if (isPerfect) {
      return "🎉 Parabéns! Você acertou todas as questões!";
    } else if (isGood) {
      return "🎉 Você concluiu o quiz!";
    } else {
      return "🎯 Você concluiu o quiz!";
    }
  };

  const getResultColor = () => {
    if (isPerfect) return "text-green-600";
    if (isGood) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className={`text-2xl font-bold ${getResultColor()}`}>
            {getResultMessage()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resultado anterior (se for retry) */}
          {isRetry && previousResult && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-700 mb-2">📊 Comparação de Resultados</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-500">Antes</div>
                  <div className="font-semibold">{previousResult.correctAnswers}/{previousResult.totalQuestions}</div>
                  <div className="text-gray-500">{previousResult.percentage}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Agora</div>
                  <div className="font-semibold text-blue-600">{correctAnswers}/{totalQuestions}</div>
                  <div className="text-blue-600 font-semibold">{percentage}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Estatísticas principais */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-green-700">Acertos</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-red-700">Erros</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-sm text-blue-700">Aproveitamento</div>
            </div>
          </div>

          {/* Mensagem de incentivo */}
          {isRetry && improvement && improvement.correctImprovement > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800 font-medium">
                {incorrectAnswers > 0 
                  ? `Gostaria de responder as ${incorrectAnswers} questão${incorrectAnswers > 1 ? 'ões' : ''} que faltam para ficar 100%?`
                  : "🎉 Perfeito! Você acertou todas as questões!"
                }
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {incorrectAnswers > 0 && (
                <Button
                  onClick={onRetryIncorrect}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refazer apenas os erros ({incorrectAnswers})
                </Button>
              )}
              
              <Button
                onClick={onRetryAll}
                variant="default"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refazer todo o quiz ({totalQuestions})
              </Button>
            </div>
            
            <Button
              onClick={handleGoToCommunity}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <Users className="w-4 h-4" />
              Explorar Comunidade
            </Button>
          </div>

          {/* Mensagem motivacional baseada no resultado */}
          {!isRetry && (
            <div className="text-center text-gray-600 text-sm">
              {isPerfect && (
                <p>🏆 Excelente trabalho! Você domina este conteúdo!</p>
              )}
              {!isPerfect && isGood && (
                <p>👍 Bom trabalho! Continue praticando para melhorar ainda mais!</p>
              )}
              {!isGood && (
                <p>💪 Não desista! A prática leva à perfeição. Tente novamente!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResult;
