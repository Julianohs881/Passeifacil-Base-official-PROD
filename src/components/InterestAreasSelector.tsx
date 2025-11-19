import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useInterestAreas, InterestArea, InterestSubarea } from '@/hooks/useInterestAreas';
import { getIconComponent } from '@/utils/iconMapper';

interface InterestAreasSelectorProps {
  selectedAreas: string[];
  selectedSubareas: string[];
  onAreasChange: (areas: string[]) => void;
  onSubareasChange: (subareas: string[]) => void;
  maxSelections?: number;
  className?: string;
}

const InterestAreasSelector: React.FC<InterestAreasSelectorProps> = ({
  selectedAreas,
  selectedSubareas,
  onAreasChange,
  onSubareasChange,
  maxSelections = 5,
  className = ''
}) => {
  const { interestAreas, loading, error, getSubareasForArea, getSubareaById } = useInterestAreas();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

  const filteredAreas = interestAreas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAreaToggle = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      // Remove área e suas temáticas
      onAreasChange(selectedAreas.filter(id => id !== areaId));
      const subareasToRemove = getSubareasForArea(areaId).map(sub => sub.id);
      onSubareasChange(selectedSubareas.filter(id => !subareasToRemove.includes(id)));
    } else if (selectedAreas.length < maxSelections) {
      // Adiciona área
      onAreasChange([...selectedAreas, areaId]);
      // Expande automaticamente para mostrar temáticas
      setExpandedAreas(prev => new Set([...prev, areaId]));
    }
  };

  const handleSubareaToggle = (areaId: string, subareaId: string) => {
    if (selectedSubareas.includes(subareaId)) {
      // Remove temática
      onSubareasChange(selectedSubareas.filter(id => id !== subareaId));
    } else {
      // Adiciona temática
      onSubareasChange([...selectedSubareas, subareaId]);
    }
  };

  const handleRemoveArea = (areaId: string) => {
    onAreasChange(selectedAreas.filter(id => id !== areaId));
    const subareasToRemove = getSubareasForArea(areaId).map(sub => sub.id);
    onSubareasChange(selectedSubareas.filter(id => !subareasToRemove.includes(id)));
  };

  const handleRemoveSubarea = (subareaId: string) => {
    onSubareasChange(selectedSubareas.filter(id => id !== subareaId));
  };

  const toggleAreaExpanded = (areaId: string) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
      }
      return newSet;
    });
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
    <div className={`space-y-4 ${className}`}>
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

      {/* Áreas e temáticas selecionadas */}
      {(selectedAreas.length > 0 || selectedSubareas.length > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selecionadas ({selectedAreas.length} áreas, {selectedSubareas.length} temáticas)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedAreas.map(areaId => {
              const area = getSelectedArea(areaId);
              if (!area) return null;
              
              const areaSubareas = getSubareasForArea(areaId);
              const selectedAreaSubareas = areaSubareas.filter(sub => selectedSubareas.includes(sub.id));
              
              return (
                <div key={areaId} className="flex flex-col gap-1">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                    style={{ backgroundColor: area.color + '20', color: area.color }}
                  >
                    {getIconComponent(area.icon, "h-4 w-4", 16)} {area.name}
                    <button
                      onClick={() => handleRemoveArea(areaId)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                  {selectedAreaSubareas.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-4">
                      {selectedAreaSubareas.map(subarea => (
                        <Badge
                          key={subarea.id}
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-0.5 text-xs"
                        >
                          {subarea.name}
                          <button
                            onClick={() => handleRemoveSubarea(subarea.id)}
                            className="hover:bg-gray-200 rounded-full p-0.5"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
        <div className="space-y-2">
          {filteredAreas.map(area => {
            const isSelected = selectedAreas.includes(area.id);
            const canSelect = selectedAreas.length < maxSelections || isSelected;
            const subareas = getSubareasForArea(area.id);
            const hasSubareas = subareas.length > 0;
            const isExpanded = expandedAreas.has(area.id);
            
            return (
              <Card
                key={area.id}
                className={`transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-violet-500 bg-violet-50'
                    : canSelect
                    ? 'hover:shadow-md hover:border-violet-300'
                    : 'opacity-50'
                }`}
              >
                <CardContent className="p-3">
                  {/* Área Principal */}
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => canSelect && handleAreaToggle(area.id)}
                    >
                      {area.icon && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: area.color || '#6B7280' }}
                        >
                          {getIconComponent(area.icon, "h-5 w-5 text-white", 20)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{area.name}</h5>
                        {area.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {area.description}
                          </p>
                        )}
                        {hasSubareas && (
                          <p className="text-xs text-violet-600 mt-1">
                            {subareas.length} temáticas disponíveis
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="h-5 w-5 text-violet-600" />
                      )}
                      {hasSubareas && isSelected && (
                        <button
                          onClick={() => toggleAreaExpanded(area.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Temáticas (só mostra se a área estiver selecionada e expandida) */}
                  {isSelected && isExpanded && hasSubareas && (
                    <div className="mt-3 ml-8 space-y-2 border-l-2 border-violet-200 pl-4">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Selecione temáticas específicas (opcional):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subareas.map(subarea => {
                          const isSubareaSelected = selectedSubareas.includes(subarea.id);
                          
                          return (
                            <div
                              key={subarea.id}
                              onClick={() => handleSubareaToggle(area.id, subarea.id)}
                              className={`p-2 border rounded-lg cursor-pointer transition-all text-xs ${
                                isSubareaSelected
                                  ? 'border-violet-400 bg-violet-50'
                                  : 'border-gray-200 hover:border-violet-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{subarea.name}</p>
                                  {subarea.description && (
                                    <p className="text-gray-500 mt-0.5 text-xs">
                                      {subarea.description}
                                    </p>
                                  )}
                                </div>
                                {isSubareaSelected && (
                                  <Check className="h-4 w-4 text-violet-600 ml-2" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Limite de seleções */}
      {selectedAreas.length >= maxSelections && (
        <p className="text-sm text-amber-600 text-center">
          Você selecionou o máximo de {maxSelections} áreas de interesse.
        </p>
      )}
    </div>
  );
};

export default InterestAreasSelector;
