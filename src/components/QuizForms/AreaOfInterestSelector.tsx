import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInterestAreas } from '@/hooks/useInterestAreas';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { getIconComponent } from '@/utils/iconMapper';

interface AreaOfInterestSelectorProps {
  selectedArea: string | null;
  selectedSubarea: string | null;
  onAreaChange: (areaId: string | null) => void;
  onSubareaChange: (subareaId: string | null) => void;
  className?: string;
}

const AreaOfInterestSelector: React.FC<AreaOfInterestSelectorProps> = ({
  selectedArea,
  selectedSubarea,
  onAreaChange,
  onSubareaChange,
  className = ''
}) => {
  const { interestAreas, loading, getSubareasForArea } = useInterestAreas();
  const [availableSubareas, setAvailableSubareas] = useState<any[]>([]);

  // Buscar dados da área selecionada
  const selectedAreaData = interestAreas.find(area => area.id === selectedArea);
  const selectedSubareaData = availableSubareas.find(sub => sub.id === selectedSubarea);

  // Atualizar temáticas quando a área mudar
  useEffect(() => {
    if (selectedArea) {
      const subareas = getSubareasForArea(selectedArea);
      setAvailableSubareas(subareas);
      
      // Se a temática selecionada não pertence à nova área, limpar
      if (selectedSubarea && !subareas.find(sub => sub.id === selectedSubarea)) {
        onSubareaChange(null);
      }
    } else {
      setAvailableSubareas([]);
      onSubareaChange(null);
    }
  }, [selectedArea]);

  const handleAreaChange = (value: string) => {
    if (value === 'none') {
      onAreaChange(null);
      onSubareaChange(null);
    } else {
      onAreaChange(value);
    }
  };

  const handleSubareaChange = (value: string) => {
    if (value === 'none') {
      onSubareaChange(null);
    } else {
      onSubareaChange(value);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-700">
          Área de Interesse
        </label>
        <div className="flex items-center justify-center p-4 border rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Seletor de Área Principal */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Área de Interesse Principal
        </label>
        <Select
          value={selectedArea || 'none'}
          onValueChange={handleAreaChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma área de interesse">
              {selectedAreaData && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: selectedAreaData.color || '#6B7280' }}
                  >
                    {getIconComponent(selectedAreaData.icon, "h-4 w-4", 16)}
                  </div>
                  <span>{selectedAreaData.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-gray-500">Nenhuma área específica</span>
            </SelectItem>
            {interestAreas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: area.color || '#6B7280' }}
                  >
                    {getIconComponent(area.icon, "h-4 w-4 text-white", 16)}
                  </div>
                  <span className="font-medium">{area.name}</span>
                  {area.subareas && area.subareas.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {area.subareas.length} temáticas
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Escolha a área geral do seu quiz
        </p>
      </div>

      {/* Seletor de Temática (só aparece se uma área for selecionada e tiver temáticas) */}
      {selectedArea && availableSubareas.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-violet-600" />
            Temática Específica
            <span className="text-xs font-normal text-gray-500">(opcional)</span>
          </label>
          <Select
            value={selectedSubarea || 'none'}
            onValueChange={handleSubareaChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma temática">
                {selectedSubareaData && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs border-2"
                      style={{ 
                        borderColor: selectedAreaData?.color || '#6B7280',
                        backgroundColor: (selectedAreaData?.color || '#6B7280') + '20'
                      }}
                    >
                      📚
                    </div>
                    <span>{selectedSubareaData.name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-gray-500">Nenhuma temática específica</span>
              </SelectItem>
              {availableSubareas.map((subarea) => (
                <SelectItem key={subarea.id} value={subarea.id}>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{subarea.name}</span>
                    {subarea.description && (
                      <span className="text-xs text-gray-500">{subarea.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Especifique melhor o tema do seu quiz para facilitar a busca
          </p>
        </div>
      )}

      {/* Visualização da seleção completa */}
      {selectedArea && (
        <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Classificação:</span>
            <div className="flex items-center gap-1">
              <Badge 
                variant="secondary" 
                className="font-medium"
                style={{ 
                  backgroundColor: selectedAreaData?.color || '#6B7280',
                  color: 'white'
                }}
              >
                {selectedAreaData?.name}
              </Badge>
              {selectedSubarea && selectedSubareaData && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Badge variant="outline" className="font-medium">
                    {selectedSubareaData.name}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaOfInterestSelector;
