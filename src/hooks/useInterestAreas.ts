import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export interface InterestSubarea {
  id: string;
  parent_area_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface InterestArea {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  is_custom?: boolean;
  user_id?: string | null;
  subareas?: InterestSubarea[];
}

export const useInterestAreas = () => {
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);
  const [interestSubareas, setInterestSubareas] = useState<InterestSubarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para padronizar nomes (apenas maiúsculas, sem números)
  const standardizeName = (name: string): string => {
    return name
      .replace(/[0-9]/g, '') // Remove números
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, '') // Remove caracteres especiais exceto acentos
      .trim()
      .toUpperCase(); // Converte para maiúsculas
  };

  // Função para criar área personalizada
  const createCustomArea = async (name: string, description?: string) => {
    try {
      const standardizedName = standardizeName(name);
      
      if (!standardizedName) {
        throw new Error('Nome inválido. Use apenas letras.');
      }

      // Verificar se já existe uma área com esse nome
      const existingArea = interestAreas.find(
        area => area.name.toUpperCase() === standardizedName
      );
      
      if (existingArea) {
        throw new Error('Já existe uma área com esse nome.');
      }

      // Cores e ícones aleatórios para áreas personalizadas
      const colors = ['#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#84CC16', '#F97316', '#6B7280'];
      const icons = ['📚', '🎓', '💡', '🌟', '🚀', '⚡', '🎯', '🔬', '📊', '🎨', '🎵', '🏆'];
      
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];

      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('interest_areas')
        .insert({
          name: standardizedName,
          description: description || `Área personalizada: ${standardizedName}`,
          icon: randomIcon,
          color: randomColor,
          is_custom: true,
          user_id: user?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar a lista local
      setInterestAreas(prev => [...prev, data]);
      
      return data;
    } catch (error) {
      console.error('Erro ao criar área personalizada:', error);
      throw error;
    }
  };

  const fetchInterestAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dados mockados para desenvolvimento
      const mockAreas: InterestArea[] = [
        { id: '1', name: 'NUTRIÇÃO', description: 'Área de estudos sobre alimentação e saúde', icon: '🍎', color: '#10B981', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '2', name: 'ENGENHARIA', description: 'Área de estudos técnicos e tecnológicos', icon: '🔧', color: '#3B82F6', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '3', name: 'MEDICINA', description: 'Área de estudos médicos e saúde', icon: '❤️', color: '#EF4444', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '4', name: 'DIREITO', description: 'Área de estudos jurídicos e legais', icon: '⚖️', color: '#8B5CF6', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '5', name: 'ADMINISTRAÇÃO', description: 'Área de estudos empresariais e gestão', icon: '💼', color: '#F59E0B', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '6', name: 'PSICOLOGIA', description: 'Área de estudos do comportamento humano', icon: '🧠', color: '#EC4899', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '7', name: 'EDUCAÇÃO', description: 'Área de estudos pedagógicos e ensino', icon: '🎓', color: '#06B6D4', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '8', name: 'TECNOLOGIA', description: 'Área de estudos de programação e TI', icon: '💻', color: '#6366F1', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '9', name: 'ARQUITETURA', description: 'Área de estudos de design e construção', icon: '🏠', color: '#84CC16', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '10', name: 'ECONOMIA', description: 'Área de estudos financeiros e econômicos', icon: '📈', color: '#F97316', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '11', name: 'HISTÓRIA', description: 'Área de estudos históricos e culturais', icon: '📚', color: '#6B7280', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '12', name: 'BIOLOGIA', description: 'Área de estudos das ciências biológicas', icon: '🧬', color: '#10B981', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '13', name: 'FÍSICA', description: 'Área de estudos das ciências físicas', icon: '⚛️', color: '#3B82F6', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '14', name: 'QUÍMICA', description: 'Área de estudos das ciências químicas', icon: '🧪', color: '#8B5CF6', created_at: new Date().toISOString(), is_custom: false, user_id: null },
        { id: '15', name: 'MATEMÁTICA', description: 'Área de estudos matemáticos e estatísticos', icon: '🧮', color: '#F59E0B', created_at: new Date().toISOString(), is_custom: false, user_id: null }
      ];

      // Dados mockados de temáticas
      const mockSubareas: InterestSubarea[] = [
        // Nutrição
        { id: 'sub1', parent_area_id: '1', name: 'Nutrição Animal', description: 'Estudo da alimentação e nutrição de animais', created_at: new Date().toISOString() },
        { id: 'sub2', parent_area_id: '1', name: 'Nutrição Humana', description: 'Estudo da alimentação e nutrição humana', created_at: new Date().toISOString() },
        { id: 'sub3', parent_area_id: '1', name: 'Bioestatística', description: 'Aplicação de estatística em ciências biológicas e da saúde', created_at: new Date().toISOString() },
        { id: 'sub4', parent_area_id: '1', name: 'Nutrição Clínica', description: 'Nutrição aplicada ao tratamento de doenças', created_at: new Date().toISOString() },
        { id: 'sub5', parent_area_id: '1', name: 'Nutrição Esportiva', description: 'Nutrição voltada para atletas e praticantes de atividades físicas', created_at: new Date().toISOString() },
        // Engenharia
        { id: 'sub6', parent_area_id: '2', name: 'Engenharia Civil', description: 'Projeto e construção de infraestruturas', created_at: new Date().toISOString() },
        { id: 'sub7', parent_area_id: '2', name: 'Engenharia Elétrica', description: 'Estudo de sistemas elétricos e eletrônicos', created_at: new Date().toISOString() },
        { id: 'sub8', parent_area_id: '2', name: 'Engenharia Mecânica', description: 'Projeto e fabricação de máquinas e sistemas mecânicos', created_at: new Date().toISOString() },
        { id: 'sub9', parent_area_id: '2', name: 'Engenharia de Software', description: 'Desenvolvimento e manutenção de software', created_at: new Date().toISOString() },
        { id: 'sub10', parent_area_id: '2', name: 'Engenharia de Produção', description: 'Otimização de processos produtivos', created_at: new Date().toISOString() },
        // Medicina
        { id: 'sub11', parent_area_id: '3', name: 'Cardiologia', description: 'Estudo do coração e sistema cardiovascular', created_at: new Date().toISOString() },
        { id: 'sub12', parent_area_id: '3', name: 'Neurologia', description: 'Estudo do sistema nervoso e suas doenças', created_at: new Date().toISOString() },
        { id: 'sub13', parent_area_id: '3', name: 'Pediatria', description: 'Cuidados médicos para crianças e adolescentes', created_at: new Date().toISOString() },
        { id: 'sub14', parent_area_id: '3', name: 'Cirurgia', description: 'Procedimentos cirúrgicos e técnicas operatórias', created_at: new Date().toISOString() },
        { id: 'sub15', parent_area_id: '3', name: 'Clínica Geral', description: 'Medicina geral e atendimento primário', created_at: new Date().toISOString() },
        // Direito
        { id: 'sub16', parent_area_id: '4', name: 'Direito Penal', description: 'Estudo de crimes e penas', created_at: new Date().toISOString() },
        { id: 'sub17', parent_area_id: '4', name: 'Direito Civil', description: 'Relações entre particulares e direitos privados', created_at: new Date().toISOString() },
        { id: 'sub18', parent_area_id: '4', name: 'Direito Trabalhista', description: 'Relações de trabalho e direitos dos trabalhadores', created_at: new Date().toISOString() },
        { id: 'sub19', parent_area_id: '4', name: 'Direito Constitucional', description: 'Estudo da constituição e direitos fundamentais', created_at: new Date().toISOString() },
        { id: 'sub20', parent_area_id: '4', name: 'Direito Empresarial', description: 'Relações comerciais e direito das empresas', created_at: new Date().toISOString() },
        // Tecnologia
        { id: 'sub21', parent_area_id: '8', name: 'Desenvolvimento Web', description: 'Criação de websites e aplicações web', created_at: new Date().toISOString() },
        { id: 'sub22', parent_area_id: '8', name: 'Inteligência Artificial', description: 'Machine learning e IA', created_at: new Date().toISOString() },
        { id: 'sub23', parent_area_id: '8', name: 'Segurança da Informação', description: 'Proteção de sistemas e dados', created_at: new Date().toISOString() },
        { id: 'sub24', parent_area_id: '8', name: 'DevOps', description: 'Integração entre desenvolvimento e operações', created_at: new Date().toISOString() },
        { id: 'sub25', parent_area_id: '8', name: 'Mobile', description: 'Desenvolvimento de aplicativos móveis', created_at: new Date().toISOString() },
        // Administração
        { id: 'sub26', parent_area_id: '5', name: 'Gestão de Pessoas', description: 'Recursos humanos e gestão de talentos', created_at: new Date().toISOString() },
        { id: 'sub27', parent_area_id: '5', name: 'Marketing', description: 'Estratégias de marketing e vendas', created_at: new Date().toISOString() },
        { id: 'sub28', parent_area_id: '5', name: 'Finanças', description: 'Gestão financeira e contabilidade', created_at: new Date().toISOString() },
        { id: 'sub29', parent_area_id: '5', name: 'Logística', description: 'Gestão de cadeia de suprimentos e distribuição', created_at: new Date().toISOString() },
        { id: 'sub30', parent_area_id: '5', name: 'Empreendedorismo', description: 'Criação e gestão de novos negócios', created_at: new Date().toISOString() },
      ];
      
      setInterestSubareas(mockSubareas);
      
      // Associar temáticas às áreas
      const areasWithSubareas = mockAreas.map(area => ({
        ...area,
        subareas: mockSubareas.filter(sub => sub.parent_area_id === area.id)
      }));
      
      setInterestAreas(areasWithSubareas);
      
      // Tentar buscar do banco em background (opcional)
      try {
        const { data: areasData, error: areasError } = await supabase
          .from('interest_areas')
          .select('*')
          .order('is_custom', { ascending: true })
          .order('name');

        const { data: subareasData, error: subareasError } = await supabase
          .from('interest_subareas')
          .select('*')
          .order('name');

        if (!areasError && areasData && areasData.length > 0) {
          setInterestSubareas(subareasData || []);
          
          const areasWithSubs = areasData.map(area => ({
            ...area,
            subareas: (subareasData || []).filter(sub => sub.parent_area_id === area.id)
          }));
          
          setInterestAreas(areasWithSubs);
        }
      } catch (dbError) {
        // Ignorar erros do banco, usar dados mockados
        console.warn('Usando dados mockados para áreas de interesse');
      }
      
    } catch (err) {
      console.error('Erro ao buscar áreas de interesse:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestAreas();
  }, []);

  // Função para obter temáticas de uma área específica
  const getSubareasForArea = (areaId: string): InterestSubarea[] => {
    return interestSubareas.filter(sub => sub.parent_area_id === areaId);
  };

  // Função para obter uma temática específica
  const getSubareaById = (subareaId: string): InterestSubarea | undefined => {
    return interestSubareas.find(sub => sub.id === subareaId);
  };

  return {
    interestAreas,
    interestSubareas,
    loading,
    error,
    refetch: fetchInterestAreas,
    createCustomArea,
    standardizeName,
    getSubareasForArea,
    getSubareaById
  };
};
