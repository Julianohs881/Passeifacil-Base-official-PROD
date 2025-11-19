import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';

interface RecommendedQuizzesProps {
  className?: string;
}

const RecommendedQuizzes: React.FC<RecommendedQuizzesProps> = ({ className = '' }) => {
  const { 
    recommendedQuizzes, 
    loading, 
    error, 
    getAreaName, 
    getAreaColor, 
    getAreaIcon,
    hasInterestAreas 
  } = useRecommendations();
  const navigate = useNavigate();

  if (!hasInterestAreas) {
    return null; // Não mostrar se o usuário não tem áreas de interesse
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Quizzes Recomendados
          </CardTitle>
          <CardDescription>
            Baseado nas suas áreas de interesse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Quizzes Recomendados
          </CardTitle>
          <CardDescription>
            Baseado nas suas áreas de interesse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 p-4">
            Erro ao carregar recomendações
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendedQuizzes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Quizzes Recomendados
          </CardTitle>
          <CardDescription>
            Baseado nas suas áreas de interesse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 p-4">
            Nenhum quiz encontrado nas suas áreas de interesse ainda.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          Quizzes Recomendados
        </CardTitle>
        <CardDescription>
          Baseado nas suas áreas de interesse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedQuizzes.slice(0, 5).map((quiz) => (
            <div
              key={quiz.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">
                    {quiz.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>por {quiz.createdBy}</span>
                    <span>•</span>
                    <span>{new Date(quiz.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {quiz.area_of_interest && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ 
                          backgroundColor: getAreaColor(quiz.area_of_interest) + '20',
                          color: getAreaColor(quiz.area_of_interest)
                        }}
                      >
                        {getAreaIcon(quiz.area_of_interest) && (
                          <span className="mr-1">
                            {getAreaIcon(quiz.area_of_interest)}
                          </span>
                        )}
                        {getAreaName(quiz.area_of_interest)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-violet-600 hover:text-violet-700"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {recommendedQuizzes.length > 5 && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/explore')}
                className="text-violet-600 border-violet-200 hover:bg-violet-50"
              >
                Ver mais recomendações
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedQuizzes;

