-- Comando para restaurar dados sem afetar quizzes existentes
-- Execute este comando no Supabase SQL Editor

-- 1. Primeiro, vamos ver o que temos
SELECT 'ANTES - Total de quizzes:' as info, COUNT(*) as count FROM quizzes;
SELECT 'ANTES - Total de áreas:' as info, COUNT(*) as count FROM interest_areas;
SELECT 'ANTES - Total de sub-áreas:' as info, COUNT(*) as count FROM interest_subareas;

-- 2. Se não existem áreas, vamos recriar apenas as áreas e sub-áreas
-- (sem usar TRUNCATE para não afetar os quizzes)

-- Inserir áreas de interesse (apenas se não existirem)
INSERT INTO interest_areas (name, description, icon, color) VALUES
('Nutrição', 'Área de estudos sobre alimentação e saúde', 'Apple', '#10B981'),
('Engenharia', 'Área de estudos técnicos e tecnológicos', 'Wrench', '#3B82F6'),
('Medicina', 'Área de estudos médicos e saúde', 'Heart', '#EF4444'),
('Direito', 'Área de estudos jurídicos e legais', 'Scale', '#8B5CF6'),
('Administração', 'Área de estudos empresariais e gestão', 'Briefcase', '#F59E0B'),
('Psicologia', 'Área de estudos do comportamento humano', 'Brain', '#EC4899'),
('Educação', 'Área de estudos pedagógicos e ensino', 'GraduationCap', '#06B6D4'),
('Tecnologia', 'Área de estudos de programação e TI', 'Code', '#6366F1'),
('Arquitetura', 'Área de estudos de design e construção', 'Home', '#84CC16'),
('Economia', 'Área de estudos financeiros e econômicos', 'TrendingUp', '#F97316'),
('História', 'Área de estudos históricos e culturais', 'BookOpen', '#6B7280'),
('Biologia', 'Área de estudos das ciências biológicas', 'Dna', '#10B981'),
('Física', 'Área de estudos das ciências físicas', 'Atom', '#3B82F6'),
('Química', 'Área de estudos das ciências químicas', 'FlaskConical', '#8B5CF6'),
('Matemática', 'Área de estudos matemáticos e estatísticos', 'Calculator', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- 3. Inserir sub-áreas para Nutrição
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Nutrição Animal', 'Estudo da alimentação e nutrição de animais'
FROM interest_areas WHERE name = 'Nutrição'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Nutrição Humana', 'Estudo da alimentação e nutrição humana'
FROM interest_areas WHERE name = 'Nutrição'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Bioestatística', 'Aplicação de estatística em ciências biológicas e da saúde'
FROM interest_areas WHERE name = 'Nutrição'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Nutrição Clínica', 'Nutrição aplicada ao tratamento de doenças'
FROM interest_areas WHERE name = 'Nutrição'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Nutrição Esportiva', 'Nutrição voltada para atletas e praticantes de atividades físicas'
FROM interest_areas WHERE name = 'Nutrição'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Nutrição Funcional', 'Abordagem individualizada da nutrição baseada em bioquímica'
FROM interest_areas WHERE name = 'Nutrição'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 4. Inserir sub-áreas para Engenharia
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Engenharia Civil', 'Projeto e construção de infraestruturas'
FROM interest_areas WHERE name = 'Engenharia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Engenharia Elétrica', 'Estudo de sistemas elétricos e eletrônicos'
FROM interest_areas WHERE name = 'Engenharia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Engenharia Mecânica', 'Projeto e fabricação de máquinas e sistemas mecânicos'
FROM interest_areas WHERE name = 'Engenharia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Engenharia de Software', 'Desenvolvimento e manutenção de software'
FROM interest_areas WHERE name = 'Engenharia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Engenharia de Produção', 'Otimização de processos produtivos'
FROM interest_areas WHERE name = 'Engenharia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Engenharia Química', 'Processos químicos industriais e transformação de materiais'
FROM interest_areas WHERE name = 'Engenharia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 5. Inserir sub-áreas para Medicina
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Cardiologia', 'Estudo do coração e sistema cardiovascular'
FROM interest_areas WHERE name = 'Medicina'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Neurologia', 'Estudo do sistema nervoso e suas doenças'
FROM interest_areas WHERE name = 'Medicina'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Pediatria', 'Cuidados médicos para crianças e adolescentes'
FROM interest_areas WHERE name = 'Medicina'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Cirurgia', 'Procedimentos cirúrgicos e técnicas operatórias'
FROM interest_areas WHERE name = 'Medicina'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Clínica Geral', 'Medicina geral e atendimento primário'
FROM interest_areas WHERE name = 'Medicina'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Psiquiatria', 'Tratamento de transtornos mentais e comportamentais'
FROM interest_areas WHERE name = 'Medicina'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 6. Inserir sub-áreas para Direito
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Direito Penal', 'Estudo de crimes e penas'
FROM interest_areas WHERE name = 'Direito'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Direito Civil', 'Relações entre particulares e direitos privados'
FROM interest_areas WHERE name = 'Direito'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Direito Trabalhista', 'Relações de trabalho e direitos dos trabalhadores'
FROM interest_areas WHERE name = 'Direito'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Direito Constitucional', 'Estudo da constituição e direitos fundamentais'
FROM interest_areas WHERE name = 'Direito'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Direito Empresarial', 'Relações comerciais e direito das empresas'
FROM interest_areas WHERE name = 'Direito'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Direito Tributário', 'Sistema tributário e obrigações fiscais'
FROM interest_areas WHERE name = 'Direito'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 7. Inserir sub-áreas para Administração
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Gestão de Pessoas', 'Recursos humanos e gestão de talentos'
FROM interest_areas WHERE name = 'Administração'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Marketing', 'Estratégias de marketing e vendas'
FROM interest_areas WHERE name = 'Administração'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Finanças', 'Gestão financeira e contabilidade'
FROM interest_areas WHERE name = 'Administração'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Logística', 'Gestão de cadeia de suprimentos e distribuição'
FROM interest_areas WHERE name = 'Administração'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Empreendedorismo', 'Criação e gestão de novos negócios'
FROM interest_areas WHERE name = 'Administração'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Gestão de Projetos', 'Planejamento e execução de projetos empresariais'
FROM interest_areas WHERE name = 'Administração'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 8. Inserir sub-áreas para Psicologia
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Psicologia Clínica', 'Tratamento de transtornos psicológicos'
FROM interest_areas WHERE name = 'Psicologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Psicologia Organizacional', 'Comportamento humano no ambiente de trabalho'
FROM interest_areas WHERE name = 'Psicologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Psicologia Educacional', 'Processos de aprendizagem e desenvolvimento'
FROM interest_areas WHERE name = 'Psicologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Psicologia Social', 'Comportamento humano em grupos e sociedade'
FROM interest_areas WHERE name = 'Psicologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Neuropsicologia', 'Relação entre cérebro e comportamento'
FROM interest_areas WHERE name = 'Psicologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Psicologia do Desenvolvimento', 'Mudanças comportamentais ao longo da vida'
FROM interest_areas WHERE name = 'Psicologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 9. Inserir sub-áreas para Educação
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Educação Infantil', 'Ensino e desenvolvimento na primeira infância'
FROM interest_areas WHERE name = 'Educação'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Educação Especial', 'Atendimento educacional especializado'
FROM interest_areas WHERE name = 'Educação'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Educação a Distância', 'Modalidade de ensino mediada por tecnologia'
FROM interest_areas WHERE name = 'Educação'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Gestão Educacional', 'Administração e coordenação de instituições de ensino'
FROM interest_areas WHERE name = 'Educação'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Educação Ambiental', 'Conscientização sobre questões ambientais'
FROM interest_areas WHERE name = 'Educação'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Tecnologia Educacional', 'Uso de tecnologia no processo de ensino-aprendizagem'
FROM interest_areas WHERE name = 'Educação'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 10. Inserir sub-áreas para Tecnologia
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Desenvolvimento Web', 'Criação de websites e aplicações web'
FROM interest_areas WHERE name = 'Tecnologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Inteligência Artificial', 'Machine learning e IA'
FROM interest_areas WHERE name = 'Tecnologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Segurança da Informação', 'Proteção de sistemas e dados'
FROM interest_areas WHERE name = 'Tecnologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'DevOps', 'Integração entre desenvolvimento e operações'
FROM interest_areas WHERE name = 'Tecnologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Mobile', 'Desenvolvimento de aplicativos móveis'
FROM interest_areas WHERE name = 'Tecnologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Data Science', 'Análise de dados e ciência de dados'
FROM interest_areas WHERE name = 'Tecnologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 11. Inserir sub-áreas para Arquitetura
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Arquitetura Residencial', 'Projeto de casas e apartamentos'
FROM interest_areas WHERE name = 'Arquitetura'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Arquitetura Comercial', 'Projeto de edifícios comerciais e corporativos'
FROM interest_areas WHERE name = 'Arquitetura'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Urbanismo', 'Planejamento urbano e desenvolvimento de cidades'
FROM interest_areas WHERE name = 'Arquitetura'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Paisagismo', 'Projeto de espaços externos e jardins'
FROM interest_areas WHERE name = 'Arquitetura'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Arquitetura Sustentável', 'Projetos com foco em sustentabilidade ambiental'
FROM interest_areas WHERE name = 'Arquitetura'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Design de Interiores', 'Projeto e decoração de ambientes internos'
FROM interest_areas WHERE name = 'Arquitetura'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 12. Inserir sub-áreas para Economia
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Microeconomia', 'Estudo do comportamento de consumidores e empresas'
FROM interest_areas WHERE name = 'Economia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Macroeconomia', 'Estudo da economia como um todo'
FROM interest_areas WHERE name = 'Economia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Economia Internacional', 'Relações econômicas entre países'
FROM interest_areas WHERE name = 'Economia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Economia Comportamental', 'Aplicação da psicologia na economia'
FROM interest_areas WHERE name = 'Economia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Finanças Públicas', 'Gestão financeira do setor público'
FROM interest_areas WHERE name = 'Economia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Economia do Desenvolvimento', 'Estratégias para desenvolvimento econômico'
FROM interest_areas WHERE name = 'Economia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 13. Inserir sub-áreas para História
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'História Antiga', 'Estudo das civilizações antigas'
FROM interest_areas WHERE name = 'História'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'História Medieval', 'Período medieval e feudalismo'
FROM interest_areas WHERE name = 'História'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'História Moderna', 'Era moderna e revoluções'
FROM interest_areas WHERE name = 'História'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'História Contemporânea', 'História recente e atual'
FROM interest_areas WHERE name = 'História'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'História do Brasil', 'História específica do Brasil'
FROM interest_areas WHERE name = 'História'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'História da Arte', 'Evolução das expressões artísticas ao longo do tempo'
FROM interest_areas WHERE name = 'História'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 14. Inserir sub-áreas para Biologia
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Biologia Molecular', 'Estudo dos processos biológicos em nível molecular'
FROM interest_areas WHERE name = 'Biologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Genética', 'Estudo da hereditariedade e variação genética'
FROM interest_areas WHERE name = 'Biologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Ecologia', 'Relações entre organismos e ambiente'
FROM interest_areas WHERE name = 'Biologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Botânica', 'Estudo das plantas e vegetais'
FROM interest_areas WHERE name = 'Biologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Zoologia', 'Estudo dos animais'
FROM interest_areas WHERE name = 'Biologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Microbiologia', 'Estudo de microrganismos'
FROM interest_areas WHERE name = 'Biologia'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 15. Inserir sub-áreas para Física
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Física Quântica', 'Física das partículas e mecânica quântica'
FROM interest_areas WHERE name = 'Física'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Física Nuclear', 'Física do núcleo atômico'
FROM interest_areas WHERE name = 'Física'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Astrofísica', 'Física aplicada ao estudo do universo'
FROM interest_areas WHERE name = 'Física'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Física de Partículas', 'Estudo das partículas elementares'
FROM interest_areas WHERE name = 'Física'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Física Aplicada', 'Aplicação dos princípios físicos em tecnologia'
FROM interest_areas WHERE name = 'Física'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Física Teórica', 'Desenvolvimento de teorias físicas'
FROM interest_areas WHERE name = 'Física'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 16. Inserir sub-áreas para Química
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Química Orgânica', 'Estudo dos compostos de carbono'
FROM interest_areas WHERE name = 'Química'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Química Inorgânica', 'Estudo dos compostos não orgânicos'
FROM interest_areas WHERE name = 'Química'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Química Analítica', 'Identificação e quantificação de substâncias'
FROM interest_areas WHERE name = 'Química'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Físico-Química', 'Aplicação da física na química'
FROM interest_areas WHERE name = 'Química'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Bioquímica', 'Processos químicos em organismos vivos'
FROM interest_areas WHERE name = 'Química'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Química Ambiental', 'Impacto químico no meio ambiente'
FROM interest_areas WHERE name = 'Química'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 17. Inserir sub-áreas para Matemática
INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Álgebra', 'Estruturas algébricas e equações'
FROM interest_areas WHERE name = 'Matemática'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Geometria', 'Estudo das formas e espaços'
FROM interest_areas WHERE name = 'Matemática'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Cálculo', 'Limites, derivadas e integrais'
FROM interest_areas WHERE name = 'Matemática'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Estatística', 'Análise de dados e probabilidade'
FROM interest_areas WHERE name = 'Matemática'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Matemática Aplicada', 'Aplicação da matemática em outras áreas'
FROM interest_areas WHERE name = 'Matemática'
ON CONFLICT (parent_area_id, name) DO NOTHING;

INSERT INTO interest_subareas (parent_area_id, name, description)
SELECT id, 'Matemática Discreta', 'Matemática de conjuntos finitos e contáveis'
FROM interest_areas WHERE name = 'Matemática'
ON CONFLICT (parent_area_id, name) DO NOTHING;

-- 18. Verificar resultado final
SELECT 'DEPOIS - Total de quizzes:' as info, COUNT(*) as count FROM quizzes;
SELECT 'DEPOIS - Total de áreas:' as info, COUNT(*) as count FROM interest_areas;
SELECT 'DEPOIS - Total de sub-áreas:' as info, COUNT(*) as count FROM interest_subareas;

-- 19. Mostrar contagem por área
SELECT 
  ia.name as area_name,
  COUNT(isa.id) as subareas_count
FROM interest_areas ia
LEFT JOIN interest_subareas isa ON ia.id = isa.parent_area_id
GROUP BY ia.id, ia.name
ORDER BY ia.name;





