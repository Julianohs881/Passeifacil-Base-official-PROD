import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, X, Edit3, Save, XCircle, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import { useInterestAreas, InterestArea } from '@/hooks/useInterestAreas';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/utils/supabase';
import { getIconComponent } from '@/utils/iconMapper';

const ProfileInterestAreas: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { interestAreas, interestSubareas, loading: interestAreasLoading, createCustomArea, standardizeName, getSubareasForArea, getSubareaById } = useInterestAreas();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSubareas, setSelectedSubareas] = useState<string[]>([]);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customAreaName, setCustomAreaName] = useState('');
  const [customAreaDescription, setCustomAreaDescription] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);

  // Inicializar com as áreas e subáreas do usuário
  useEffect(() => {
    if (userProfile?.interest_areas) {
      setSelectedAreas(userProfile.interest_areas);
    }
    if (userProfile?.interest_subareas) {
      setSelectedSubareas(userProfile.interest_subareas);
    }
    // Expandir áreas que têm subáreas selecionadas
    if (userProfile?.interest_subareas && userProfile.interest_subareas.length > 0) {
      const areasToExpand = new Set<string>();
      userProfile.interest_subareas.forEach(subareaId => {
        const subarea = getSubareaById(subareaId);
        if (subarea) {
          areasToExpand.add(subarea.parent_area_id);
        }
      });
      setExpandedAreas(areasToExpand);
    }
  }, [userProfile?.interest_areas, userProfile?.interest_subareas]);

  const filteredAreas = interestAreas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAreaToggle = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      // Remove área e suas temáticas
      setSelectedAreas(selectedAreas.filter(id => id !== areaId));
      const subareasToRemove = getSubareasForArea(areaId).map(sub => sub.id);
      setSelectedSubareas(selectedSubareas.filter(id => !subareasToRemove.includes(id)));
    } else if (selectedAreas.length < 5) {
      // Adiciona área
      setSelectedAreas([...selectedAreas, areaId]);
      // Expande automaticamente para mostrar temáticas
      setExpandedAreas(prev => new Set([...prev, areaId]));
    }
  };

  const handleSubareaToggle = (areaId: string, subareaId: string) => {
    if (selectedSubareas.includes(subareaId)) {
      // Remove temática
      setSelectedSubareas(selectedSubareas.filter(id => id !== subareaId));
    } else {
      // Adiciona temática
      setSelectedSubareas([...selectedSubareas, subareaId]);
      // Garante que a área está selecionada
      if (!selectedAreas.includes(areaId)) {
        if (selectedAreas.length < 5) {
          setSelectedAreas([...selectedAreas, areaId]);
        }
      }
    }
  };

  const handleRemoveArea = (areaId: string) => {
    setSelectedAreas(selectedAreas.filter(id => id !== areaId));
    const subareasToRemove = getSubareasForArea(areaId).map(sub => sub.id);
    setSelectedSubareas(selectedSubareas.filter(id => !subareasToRemove.includes(id)));
  };

  const handleRemoveSubarea = (subareaId: string) => {
    setSelectedSubareas(selectedSubareas.filter(id => id !== subareaId));
  };

  const toggleAreaExpanded = (areaId: string) => {
    setExpandedAreas(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
  };

  const getSelectedArea = (areaId: string): InterestArea | undefined => {
    return interestAreas.find(area => area.id === areaId);
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          interest_areas: selectedAreas,
          interest_subareas: selectedSubareas
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      // Atualizar o perfil local
      await updateUserProfile();

      toast({
        title: "Áreas de interesse atualizadas!",
        description: "Suas preferências foram salvas com sucesso.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar áreas de interesse:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas áreas de interesse.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reverter para as áreas e subáreas originais
    setSelectedAreas(userProfile?.interest_areas || []);
    setSelectedSubareas(userProfile?.interest_subareas || []);
    setIsEditing(false);
    setSearchTerm('');
    setShowAddCustom(false);
    setCustomAreaName('');
    setCustomAreaDescription('');
  };

  const handleAddCustomArea = async () => {
    if (!customAreaName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a área de interesse.",
        variant: "destructive",
      });
      return;
    }

    setCreatingCustom(true);
    try {
      const standardizedName = standardizeName(customAreaName);
      
      if (!standardizedName) {
        toast({
          title: "Nome inválido",
          description: "Use apenas letras. Números e caracteres especiais não são permitidos.",
          variant: "destructive",
        });
        return;
      }

      const newArea = await createCustomArea(standardizedName, customAreaDescription);
      
      // Adicionar automaticamente à seleção se não exceder o limite
      if (selectedAreas.length < 5) {
        setSelectedAreas([...selectedAreas, newArea.id]);
      }

      toast({
        title: "Área adicionada!",
        description: `"${standardizedName}" foi criada e está disponível para todos os usuários.`,
      });

      setShowAddCustom(false);
      setCustomAreaName('');
      setCustomAreaDescription('');
    } catch (error: any) {
      console.error('Erro ao criar área personalizada:', error);
      toast({
        title: "Erro ao criar área",
        description: error.message || "Não foi possível criar a área personalizada.",
        variant: "destructive",
      });
    } finally {
      setCreatingCustom(false);
    }
  };

  if (interestAreasLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            Áreas de Interesse
          </CardTitle>
          <CardDescription>
            Personalize suas recomendações de conteúdo
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>🎯</span>
              Áreas de Interesse
            </CardTitle>
            <CardDescription>
              Personalize suas recomendações de conteúdo
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!isEditing ? (
          // Modo visualização
          <div className="space-y-4">
            {selectedAreas.length > 0 || selectedSubareas.length > 0 ? (
              <div className="space-y-3">
                {selectedAreas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Áreas de Interesse</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAreas.map(areaId => {
                        const area = getSelectedArea(areaId);
                        if (!area) return null;
                        
                        return (
                          <Badge
                            key={areaId}
                            variant="secondary"
                            className="flex items-center gap-2 px-3 py-1"
                            style={{ 
                              backgroundColor: area.color + '20', 
                              color: area.color,
                              borderColor: area.color + '40'
                            }}
                          >
                            {getIconComponent(area.icon, "h-4 w-4", 16)}
                            {area.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedSubareas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Temáticas de Interesse</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubareas.map(subareaId => {
                        const subarea = getSubareaById(subareaId);
                        if (!subarea) return null;
                        const parentArea = interestAreas.find(a => a.id === subarea.parent_area_id);
                        
                        return (
                          <Badge
                            key={subareaId}
                            variant="outline"
                            className="flex items-center gap-2 px-3 py-1 text-gray-700"
                          >
                            {subarea.name}
                            {parentArea && (
                              <span className="text-xs text-gray-500">({parentArea.name})</span>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm">Nenhuma área de interesse selecionada</p>
                <p className="text-xs text-gray-400 mt-1">
                  Adicione áreas para receber recomendações personalizadas
                </p>
              </div>
            )}
          </div>
        ) : (
          // Modo edição
          <div className="space-y-4">
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

            {/* Áreas e Subáreas selecionadas */}
            {(selectedAreas.length > 0 || selectedSubareas.length > 0) && (
              <div className="space-y-3">
                {selectedAreas.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Áreas selecionadas ({selectedAreas.length}/5)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAreas.map(areaId => {
                        const area = getSelectedArea(areaId);
                        if (!area) return null;
                        
                        return (
                          <Badge
                            key={areaId}
                            variant="secondary"
                            className="flex items-center gap-2 px-3 py-1"
                            style={{ 
                              backgroundColor: area.color + '20', 
                              color: area.color 
                            }}
                          >
                            {getIconComponent(area.icon, "h-4 w-4", 16)}
                            {area.name}
                            <button
                              onClick={() => handleRemoveArea(areaId)}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedSubareas.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Temáticas selecionadas ({selectedSubareas.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubareas.map(subareaId => {
                        const subarea = getSubareaById(subareaId);
                        if (!subarea) return null;
                        const parentArea = interestAreas.find(a => a.id === subarea.parent_area_id);
                        
                        return (
                          <Badge
                            key={subareaId}
                            variant="outline"
                            className="flex items-center gap-2 px-3 py-1"
                          >
                            {subarea.name}
                            {parentArea && (
                              <span className="text-xs text-gray-500">({parentArea.name})</span>
                            )}
                            <button
                              onClick={() => handleRemoveSubarea(subareaId)}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lista de áreas disponíveis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Áreas disponíveis
                </h4>
                {!showAddCustom && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCustom(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Outros
                  </Button>
                )}
              </div>

              {/* Formulário para adicionar área personalizada */}
              {showAddCustom && (
                <div className="p-4 border border-dashed border-violet-300 rounded-lg bg-violet-50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-violet-700">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Adicionar nova área de interesse</span>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Nome da área *
                      </label>
                      <Input
                        value={customAreaName}
                        onChange={(e) => setCustomAreaName(e.target.value)}
                        placeholder="Ex: Física, Química, História..."
                        className="mt-1"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Apenas letras. Números e caracteres especiais serão removidos.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Descrição (opcional)
                      </label>
                      <Input
                        value={customAreaDescription}
                        onChange={(e) => setCustomAreaDescription(e.target.value)}
                        placeholder="Descreva brevemente esta área..."
                        className="mt-1"
                        maxLength={100}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAddCustomArea}
                        disabled={creatingCustom || !customAreaName.trim()}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {creatingCustom ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                            Criando...
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-2" />
                            Criar área
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddCustom(false);
                          setCustomAreaName('');
                          setCustomAreaDescription('');
                        }}
                        disabled={creatingCustom}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAreas.map(area => {
                  const isSelected = selectedAreas.includes(area.id);
                  const canSelect = selectedAreas.length < 5 || isSelected;
                  const areaSubareas = getSubareasForArea(area.id);
                  const isExpanded = expandedAreas.has(area.id);
                  const hasSelectedSubareas = areaSubareas.some(sub => selectedSubareas.includes(sub.id));
                  
                  return (
                    <div key={area.id} className="border rounded-lg overflow-hidden">
                      <div
                        className={`p-3 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'ring-2 ring-violet-500 bg-violet-50 border-violet-200'
                            : canSelect
                            ? 'hover:shadow-md hover:border-violet-300'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canSelect && handleAreaToggle(area.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {area.icon && (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                                style={{ backgroundColor: area.color || '#6B7280' }}
                              >
                                {getIconComponent(area.icon, "h-4 w-4 text-white", 16)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">{area.name}</h5>
                                {area.is_custom && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                    Personalizada
                                  </Badge>
                                )}
                                {hasSelectedSubareas && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                    {areaSubareas.filter(sub => selectedSubareas.includes(sub.id)).length} temática(s)
                                  </Badge>
                                )}
                              </div>
                              {area.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {area.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Check className="h-4 w-4 text-violet-600" />
                            )}
                            {areaSubareas.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAreaExpanded(area.id);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Temáticas */}
                      {isExpanded && areaSubareas.length > 0 && (
                        <div className="px-3 pb-3 bg-gray-50 border-t">
                          <div className="pt-2 space-y-2">
                            <p className="text-xs font-medium text-gray-600 mb-2">Temáticas:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {areaSubareas.map(subarea => {
                                const isSubareaSelected = selectedSubareas.includes(subarea.id);
                                
                                return (
                                  <div
                                    key={subarea.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSubareaToggle(area.id, subarea.id);
                                    }}
                                    className={`p-2 rounded cursor-pointer transition-all ${
                                      isSubareaSelected
                                        ? 'bg-violet-100 border border-violet-300'
                                        : 'hover:bg-gray-100 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">{subarea.name}</p>
                                        {subarea.description && (
                                          <p className="text-xs text-gray-500 mt-0.5">{subarea.description}</p>
                                        )}
                                      </div>
                                      {isSubareaSelected && (
                                        <Check className="h-3 w-3 text-violet-600" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

            {/* Botões de ação */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar ({selectedAreas.length} selecionadas)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileInterestAreas;

