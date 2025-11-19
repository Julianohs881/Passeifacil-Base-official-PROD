-- Verificar se há algum backup ou dados recuperáveis dos quizzes
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar se existem tabelas de backup relacionadas a quizzes
SELECT 'Tabelas que podem conter dados de quizzes:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%quiz%' OR table_name LIKE '%backup%' OR table_name LIKE '%deleted%')
ORDER BY table_name;

-- 2. Verificar se há dados na tabela de logs que podem indicar quizzes anteriores
SELECT 'Logs de acesso a quizzes:' as info, COUNT(*) as count FROM quiz_access_logs;

-- 3. Verificar se há dados na tabela de comentários que podem indicar quizzes anteriores
SELECT 'Comentários em questões:' as info, COUNT(*) as count FROM comments;

-- 4. Verificar se há perfis com referências a quizzes
SELECT 'Perfis com quizzes referenciados:' as info, COUNT(*) as count 
FROM profiles 
WHERE quizzes IS NOT NULL AND array_length(quizzes, 1) > 0;

-- 5. Verificar se há dados na tabela global_settings que podem ter configurações de quizzes
SELECT 'Configurações globais:' as info, COUNT(*) as count FROM global_settings;

-- 6. Listar algumas configurações se existirem
SELECT 'Configurações disponíveis:' as info, id, created_at 
FROM global_settings 
ORDER BY created_at DESC 
LIMIT 5;





