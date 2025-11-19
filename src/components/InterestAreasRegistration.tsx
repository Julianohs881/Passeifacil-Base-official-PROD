import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useInterestAreas, InterestArea } from '@/hooks/useInterestAreas';
import { getIconComponent } from '@/utils/iconMapper';

interface InterestAreasRegistrationProps {
  selectedAreas: string[];
  selectedSubareas: string[];
  onAreasChange: (areas: string[]) => void;
  onSubareasChange: (subareas: string[]) => void;
  onContinue: () => void;
  onSkip: () => void;
  className?: string;
}

const InterestAreasRegistration: React.FC<InterestAreasRegistrationProps> = ({
  selectedAreas,
  selectedSubareas,
  onAreasChange,
  onSubareasChange,
  onContinue,
  onSkip,
  className = ''
}) => {
  const { interestAreas, loading, error } = useInterestAreas();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = interestAreas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAreaToggle = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      // Remove área
      onAreasChange(selectedAreas.filter(id => id !== areaId));
    } else if (selectedAreas.length < 5) {
      // Adiciona área
      onAreasChange([...selectedAreas, areaId]);
    }
  };

  const handleRemoveArea = (areaId: string) => {
    onAreasChange(selectedAreas.filter(id => id !== areaId));
  };

  const getSelectedArea = (areaId: string): InterestArea | undefined => {
    return interestAreas.find(area => area.id === areaId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        Erro ao carregar áreas de interesse: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Áreas de Interesse</CardTitle>
          <CardDescription className="text-center">
            Selecione até 5 áreas que mais te interessam e especifique temáticas para personalizar sua experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar áreas de interesse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Áreas selecionadas */}
          {selectedAreas.length > 0 && (
            <div className="space-y-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
              <h4 className="text-sm font-medium text-gray-700">
                Selecionadas ({selectedAreas.length}/5 áreas)
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedAreas.map(areaId => {
                  const area = getSelectedArea(areaId);
                  if (!area) return null;
                  
                  return (
                    <Badge
                      key={areaId}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{ backgroundColor: area.color, color: 'white' }}
                    >
                      {getIconComponent(area.icon, "h-4 w-4", 16)} {area.name}
                      <button
                        onClick={() => handleRemoveArea(areaId)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista de áreas disponíveis */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Áreas disponíveis
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredAreas.map(area => {
                const isSelected = selectedAreas.includes(area.id);
                const canSelect = selectedAreas.length < 5 || isSelected;
                
                return (
                  <Card
                    key={area.id}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-violet-500 bg-violet-50'
                        : canSelect
                        ? 'hover:shadow-md hover:border-violet-300'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => canSelect && handleAreaToggle(area.id)}
                        >
                          {area.icon && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                              style={{ backgroundColor: area.color || '#6B7280' }}
                            >
                              {getIconComponent(area.icon, "h-5 w-5 text-white", 20)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm">{area.name}</h5>
                            {area.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {area.description}
                              </p>
                            )}
                            <div className="mt-2">
                              <p className="text-xs text-violet-600 font-medium">
                                📚 Temáticas disponíveis na próxima tela
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isSelected && (
                            <Check className="h-5 w-5 text-violet-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Limite de seleções */}
          {selectedAreas.length >= 5 && (
            <p className="text-sm text-amber-600 text-center">
              Você selecionou o máximo de 5 áreas de interesse.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          className="flex-1"
        >
          Pular por enquanto
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          disabled={selectedAreas.length === 0}
        >
          Continuar ({selectedAreas.length} áreas)
        </Button>
      </div>

    </div>
  );
};

export default InterestAreasRegistration;
