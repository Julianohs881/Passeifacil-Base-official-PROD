-- Verificar se há tabelas de backup ou dados recuperáveis
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar se existe a tabela profiles_backup (vi que existe na interface)
SELECT 'Total de perfis no backup:' as info, COUNT(*) as count FROM profiles_backup;

-- 2. Verificar se existem dados na tabela profiles
SELECT 'Total de perfis ativos:' as info, COUNT(*) as count FROM profiles;

-- 3. Verificar se existem dados na tabela quizzes
SELECT 'Total de quizzes:' as info, COUNT(*) as count FROM quizzes;

-- 4. Verificar se existem dados na tabela questions
SELECT 'Total de questões:' as info, COUNT(*) as count FROM questions;

-- 5. Verificar se existem dados na tabela quiz_answers
SELECT 'Total de respostas:' as info, COUNT(*) as count FROM quiz_answers;

-- 6. Verificar se existem dados na tabela comments
SELECT 'Total de comentários:' as info, COUNT(*) as count FROM comments;

-- 7. Verificar se existem dados na tabela quiz_access_logs
SELECT 'Total de logs de acesso:' as info, COUNT(*) as count FROM quiz_access_logs;

-- 8. Verificar se existem dados na tabela global_settings
SELECT 'Total de configurações:' as info, COUNT(*) as count FROM global_settings;

-- 9. Listar alguns perfis do backup para ver se há dados
SELECT 'Primeiros 5 perfis do backup:' as info, id, username, email, created_at 
FROM profiles_backup 
ORDER BY created_at DESC 
LIMIT 5;





