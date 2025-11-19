-- Comando para tentar recuperar dados
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar se há dados em outras tabelas relacionadas
SELECT 'Verificando tabelas relacionadas:' as info;

-- Verificar se existem questões órfãs (sem quiz)
SELECT 'Questões órfãs:' as info, COUNT(*) as count 
FROM questions 
WHERE quiz_id NOT IN (SELECT id FROM quizzes);

-- Verificar se existem respostas órfãs (sem quiz)
SELECT 'Respostas órfãs:' as info, COUNT(*) as count 
FROM quiz_answers 
WHERE quiz_id NOT IN (SELECT id FROM quizzes);

-- Verificar se existem perfis com quizzes referenciados
SELECT 'Perfis com quizzes:' as info, COUNT(*) as count 
FROM profiles 
WHERE quizzes IS NOT NULL AND array_length(quizzes, 1) > 0;

-- 2. Verificar se há dados na tabela de auditoria (se existir)
SELECT 'Verificando tabela de auditoria:' as info;
SELECT COUNT(*) as audit_count FROM audit_logs WHERE table_name = 'quizzes' LIMIT 1;

-- 3. Verificar se há dados na lixeira (se existir)
SELECT 'Verificando lixeira:' as info;
SELECT COUNT(*) as trash_count FROM deleted_quizzes LIMIT 1;

-- 4. Listar todas as tabelas do schema público
SELECT 'Tabelas disponíveis:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;





