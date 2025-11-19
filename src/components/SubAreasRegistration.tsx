import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Plus } from 'lucide-react';
import { useInterestAreas } from '@/hooks/useInterestAreas';
import { AddCustomSubareaModal } from '@/components/AddCustomSubareaModal';
import { getIconComponent } from '@/utils/iconMapper';

interface SubAreasRegistrationProps {
  selectedAreas: string[];
  selectedSubareas: string[];
  onSubareasChange: (subareas: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

const SubAreasRegistration: React.FC<SubAreasRegistrationProps> = ({
  selectedAreas,
  selectedSubareas,
  onSubareasChange,
  onContinue,
  onBack,
  className = ''
}) => {
  const { interestAreas, getSubareasForArea, refetch } = useInterestAreas();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSubareaModal, setShowAddSubareaModal] = useState(false);
  const [selectedAreaForSubarea, setSelectedAreaForSubarea] = useState<{id: string, name: string} | null>(null);

// Obter todas as temáticas das áreas selecionadas
  const allSubareas = selectedAreas.flatMap(areaId => {
    const area = interestAreas.find(a => a.id === areaId);
    const subareas = getSubareasForArea(areaId);
    return subareas.map(sub => ({ ...sub, parentAreaName: area?.name || 'Área' }));
  });

  const filteredSubareas = allSubareas.filter(subarea =>
    subarea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subarea.parentAreaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubareaToggle = (subareaId: string) => {
    if (selectedSubareas.includes(subareaId)) {
      onSubareasChange(selectedSubareas.filter(id => id !== subareaId));
    } else {
      onSubareasChange([...selectedSubareas, subareaId]);
    }
  };

  const handleRemoveSubarea = (subareaId: string) => {
    onSubareasChange(selectedSubareas.filter(id => id !== subareaId));
  };

  const getSelectedSubarea = (subareaId: string) => {
    return allSubareas.find(sub => sub.id === subareaId);
  };

  const handleAddCustomSubarea = (areaId: string, areaName: string) => {
    setSelectedAreaForSubarea({ id: areaId, name: areaName });
    setShowAddSubareaModal(true);
  };

  const handleSubareaAdded = async (newSubarea: any) => {
    // Atualizar a lista de áreas de interesse
    await refetch();
    
    // Adicionar automaticamente a nova temática às selecionadas
    onSubareasChange([...selectedSubareas, newSubarea.id]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Temáticas Específicas</CardTitle>
          <CardDescription className="text-center">
            Agora especifique as temáticas que mais te interessam dentro das áreas selecionadas
          </CardDescription>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              ✅ <strong>Áreas selecionadas:</strong> {selectedAreas.map(areaId => {
                const area = interestAreas.find(a => a.id === areaId);
                return area?.name;
              }).join(', ')}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar temáticas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Temáticas selecionadas */}
          {selectedSubareas.length > 0 && (
            <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-700">
                Temáticas selecionadas ({selectedSubareas.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubareas.map(subareaId => {
                  const subarea = getSelectedSubarea(subareaId);
                  if (!subarea) return null;
                  
                  return (
                    <Badge
                      key={subareaId}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{ backgroundColor: '#10B981', color: 'white' }}
                    >
                      📚 {subarea.name}
                      <button
                        onClick={() => handleRemoveSubarea(subareaId)}
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

          {/* Lista de temáticas disponíveis */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Temáticas disponíveis por área
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {selectedAreas.map(areaId => {
                const area = interestAreas.find(a => a.id === areaId);
                const areaSubareas = getSubareasForArea(areaId);
                const filteredAreaSubareas = areaSubareas.filter(subarea =>
                  subarea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (searchTerm === '')
                );

                if (filteredAreaSubareas.length === 0) return null;

                return (
                  <div key={areaId} className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {area?.icon && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                            style={{ backgroundColor: area.color || '#6B7280' }}
                          >
                            {getIconComponent(area.icon, "h-4 w-4 text-white", 16)}
                          </div>
                        )}
                        <h5 className="font-medium text-gray-800">{area?.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {filteredAreaSubareas.length} temáticas
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCustomSubarea(areaId, area?.name || 'Área')}
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
                      {filteredAreaSubareas.map(subarea => {
                        const isSelected = selectedSubareas.includes(subarea.id);
                        
                        return (
                          <div
                            key={subarea.id}
                            onClick={() => handleSubareaToggle(subarea.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all text-sm ${
                              isSelected
                                ? 'border-violet-400 bg-violet-100'
                                : 'border-gray-200 hover:border-violet-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{subarea.name}</p>
                                {subarea.description && (
                                  <p className="text-gray-500 mt-1 text-xs">
                                    {subarea.description}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="h-5 w-5 text-violet-600 ml-2 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          ← Voltar para áreas
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          className="flex-1 bg-violet-600 hover:bg-violet-700"
        >
          Finalizar Cadastro →
        </Button>
      </div>

      {/* Modal para adicionar temática personalizada */}
      {selectedAreaForSubarea && (
        <AddCustomSubareaModal
          isOpen={showAddSubareaModal}
          onClose={() => {
            setShowAddSubareaModal(false);
            setSelectedAreaForSubarea(null);
          }}
          parentAreaId={selectedAreaForSubarea.id}
          parentAreaName={selectedAreaForSubarea.name}
          onSubareaAdded={handleSubareaAdded}
        />
      )}
    </div>
  );
};

export default SubAreasRegistration;

