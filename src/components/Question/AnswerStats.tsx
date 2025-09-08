import React from 'react';
import { BarChart3, Users } from 'lucide-react';
import { AnswerStats } from '@/types';

interface AnswerStatsProps {
  stats: AnswerStats[];
  userAnswer?: number;
  loading?: boolean;
  error?: string | null;
}

const AnswerStatsComponent: React.FC<AnswerStatsProps> = ({
  stats,
  userAnswer,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Carregando estatísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Erro ao carregar estatísticas</span>
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  // Filtrar apenas opções que foram escolhidas por alguém
  const activeStats = stats.filter(stat => stat.count > 0);
  
  if (activeStats.length === 0) {
    return null;
  }

  const totalResponses = activeStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 text-blue-800 mb-3">
        <BarChart3 className="h-4 w-4" />
        <span className="text-sm font-medium">📊 Respostas da comunidade:</span>
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Users className="h-3 w-3" />
          <span>{totalResponses} {totalResponses === 1 ? 'pessoa' : 'pessoas'}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {activeStats
          .sort((a, b) => b.count - a.count) // Ordenar por quantidade (mais escolhida primeiro)
          .map((stat) => {
            const optionLetter = String.fromCharCode(65 + stat.optionIndex); // A, B, C, D
            const isUserAnswer = userAnswer === stat.optionIndex;
            
            return (
              <div
                key={stat.optionIndex}
                className={`flex items-center justify-between p-2 rounded-md ${
                  isUserAnswer 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-white border border-blue-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    isUserAnswer ? 'text-blue-800' : 'text-gray-700'
                  }`}>
                    {optionLetter}:
                  </span>
                  <span className="text-sm text-gray-600">
                    {stat.count} {stat.count === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({stat.percentage}%)
                  </span>
                </div>
                
                {/* Barra de progresso visual */}
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stat.isCorrect ? 'bg-green-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
                
                {/* Indicador de resposta correta */}
                {stat.isCorrect && (
                  <div className="text-xs text-green-600 font-medium">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
      </div>
      
      {/* Mensagem personalizada baseada na resposta do usuário */}
      {userAnswer !== undefined && activeStats.length > 0 && (
        <div className="mt-3 p-2 bg-white border border-blue-200 rounded-md">
          <p className="text-xs text-gray-600">
            {(() => {
              const userStat = activeStats.find(stat => stat.optionIndex === userAnswer);
              const mostChosen = activeStats[0]; // Já está ordenado por quantidade
              
              if (!userStat) return null;
              
              if (userStat.optionIndex === mostChosen.optionIndex) {
                return `Você escolheu ${String.fromCharCode(65 + userAnswer)}. A maioria também escolheu esta opção!`;
              } else {
                const mostChosenLetter = String.fromCharCode(65 + mostChosen.optionIndex);
                return `Você escolheu ${String.fromCharCode(65 + userAnswer)}. Mas ${mostChosen.percentage}% dos usuários escolheram ${mostChosenLetter}.`;
              }
            })()}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnswerStatsComponent;
