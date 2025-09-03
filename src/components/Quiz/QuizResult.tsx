import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  RotateCcw, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Star, 
  Target,
  Award,
  Zap
} from 'lucide-react';
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
    if (isPerfect) return "text-emerald-600";
    if (isGood) return "text-blue-600";
    return "text-amber-600";
  };

  const getProgressColor = () => {
    if (isPerfect) return "bg-emerald-500";
    if (isGood) return "bg-blue-500";
    return "bg-amber-500";
  };

  const getProgressBgColor = () => {
    if (isPerfect) return "bg-emerald-100";
    if (isGood) return "bg-blue-100";
    return "bg-amber-100";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com mensagem de progresso */}
      <div className={`text-center p-6 rounded-2xl ${getProgressBgColor()} border border-opacity-20`}>
        <div className="flex items-center justify-center gap-3 mb-4">
          {isPerfect ? (
            <Award className="w-8 h-8 text-emerald-600" />
          ) : isGood ? (
            <Star className="w-8 h-8 text-blue-600" />
          ) : (
            <Target className="w-8 h-8 text-amber-600" />
          )}
          <h1 className={`text-3xl font-bold ${getResultColor()}`}>
            {getResultMessage()}
          </h1>
        </div>
        
        {/* Barra de progresso horizontal */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span className="font-semibold">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Resultado anterior (se for retry) */}
      {isRetry && previousResult && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">📊 Comparação de Resultados</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Antes</div>
                <div className="text-2xl font-bold text-gray-700">{previousResult.correctAnswers}/{previousResult.totalQuestions}</div>
                <div className="text-sm text-gray-500">{previousResult.percentage}%</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-blue-200">
                <div className="text-sm text-gray-500 mb-1">Agora</div>
                <div className="text-2xl font-bold text-blue-600">{correctAnswers}/{totalQuestions}</div>
                <div className="text-sm text-blue-600 font-semibold">{percentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de estatísticas em grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Acertos */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">{correctAnswers}</div>
            <div className="text-sm font-medium text-gray-600">Acertos</div>
            <div className="text-xs text-gray-500 mt-1">
              {((correctAnswers / totalQuestions) * 100).toFixed(0)}% do total
            </div>
          </CardContent>
        </Card>

        {/* Card de Erros */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-3xl font-bold text-rose-500 mb-2">{incorrectAnswers}</div>
            <div className="text-sm font-medium text-gray-600">Erros</div>
            <div className="text-xs text-gray-500 mt-1">
              {((incorrectAnswers / totalQuestions) * 100).toFixed(0)}% do total
            </div>
          </CardContent>
        </Card>

        {/* Card de Aproveitamento */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{percentage}%</div>
            <div className="text-sm font-medium text-gray-600">Aproveitamento</div>
            <div className="text-xs text-gray-500 mt-1">
              {isPerfect ? "Perfeito!" : isGood ? "Bom!" : "Continue praticando!"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem de incentivo */}
      {isRetry && improvement && improvement.correctImprovement > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-green-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-800">Excelente Progresso!</h3>
            </div>
            <p className="text-emerald-700 font-medium">
              {incorrectAnswers > 0 
                ? `Gostaria de responder as ${incorrectAnswers} questão${incorrectAnswers > 1 ? 'ões' : ''} que faltam para ficar 100%?`
                : "🎉 Perfeito! Você acertou todas as questões!"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Botões de ação */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incorrectAnswers > 0 && (
            <Button
              onClick={onRetryIncorrect}
              variant="outline"
              size="lg"
              className="h-14 flex items-center justify-center gap-3 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Refazer apenas os erros</div>
                <div className="text-sm opacity-75">({incorrectAnswers} questão{incorrectAnswers > 1 ? 'ões' : ''})</div>
              </div>
            </Button>
          )}
          
          <Button
            onClick={onRetryAll}
            size="lg"
            className="h-14 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Refazer todo o quiz</div>
              <div className="text-sm opacity-90">({totalQuestions} questões)</div>
            </div>
          </Button>
        </div>
        
        <Button
          onClick={handleGoToCommunity}
          variant="outline"
          size="lg"
          className="w-full h-12 flex items-center justify-center gap-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">Explorar Comunidade</span>
        </Button>
      </div>

      {/* Mensagem motivacional baseada no resultado */}
      {!isRetry && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-slate-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              {isPerfect ? (
                <>
                  <Award className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-emerald-800">🏆 Excelente trabalho!</h3>
                </>
              ) : isGood ? (
                <>
                  <Star className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">👍 Bom trabalho!</h3>
                </>
              ) : (
                <>
                  <Target className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-800">💪 Continue praticando!</h3>
                </>
              )}
            </div>
            <p className="text-gray-600">
              {isPerfect && "Você domina este conteúdo!"}
              {!isPerfect && isGood && "Continue praticando para melhorar ainda mais!"}
              {!isGood && "A prática leva à perfeição. Tente novamente!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizResult;