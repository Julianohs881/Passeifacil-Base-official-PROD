-- Verificar a estrutura da tabela profiles_backup e dados disponíveis
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar a estrutura da tabela profiles_backup
SELECT 'Estrutura da tabela profiles_backup:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles_backup' 
ORDER BY ordinal_position;

-- 2. Verificar se existem dados na tabela profiles_backup
SELECT 'Total de perfis no backup:' as info, COUNT(*) as count FROM profiles_backup;

-- 3. Verificar se existem dados na tabela profiles
SELECT 'Total de perfis ativos:' as info, COUNT(*) as count FROM profiles;

-- 4. Verificar se existem dados na tabela quizzes
SELECT 'Total de quizzes:' as info, COUNT(*) as count FROM quizzes;

-- 5. Verificar se existem dados na tabela questions
SELECT 'Total de questões:' as info, COUNT(*) as count FROM questions;

-- 6. Verificar se existem dados na tabela quiz_answers
SELECT 'Total de respostas:' as info, COUNT(*) as count FROM quiz_answers;

-- 7. Verificar se existem dados na tabela comments
SELECT 'Total de comentários:' as info, COUNT(*) as count FROM comments;

-- 8. Verificar se existem dados na tabela quiz_access_logs
SELECT 'Total de logs de acesso:' as info, COUNT(*) as count FROM quiz_access_logs;

-- 9. Verificar se existem dados na tabela global_settings
SELECT 'Total de configurações:' as info, COUNT(*) as count FROM global_settings;

-- 10. Listar alguns perfis do backup (usando colunas corretas)
SELECT 'Primeiros 5 perfis do backup:' as info, id, created_at 
FROM profiles_backup 
ORDER BY created_at DESC 
LIMIT 5;





