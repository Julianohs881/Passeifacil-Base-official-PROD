-- Verificar todos os dados disponíveis
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar estrutura completa da tabela profiles_backup
SELECT 'Estrutura completa da tabela profiles_backup:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles_backup' 
ORDER BY ordinal_position;

-- 2. Verificar quantos perfis existem no backup
SELECT 'Total de perfis no backup:' as info, COUNT(*) as count FROM profiles_backup;

-- 3. Verificar quantos perfis existem na tabela ativa
SELECT 'Total de perfis ativos:' as info, COUNT(*) as count FROM profiles;

-- 4. Verificar se existem quizzes
SELECT 'Total de quizzes:' as info, COUNT(*) as count FROM quizzes;

-- 5. Verificar se existem questões
SELECT 'Total de questões:' as info, COUNT(*) as count FROM questions;

-- 6. Verificar se existem respostas
SELECT 'Total de respostas:' as info, COUNT(*) as count FROM quiz_answers;

-- 7. Verificar se existem comentários
SELECT 'Total de comentários:' as info, COUNT(*) as count FROM comments;

-- 8. Verificar se existem logs de acesso
SELECT 'Total de logs de acesso:' as info, COUNT(*) as count FROM quiz_access_logs;

-- 9. Verificar se existem configurações
SELECT 'Total de configurações:' as info, COUNT(*) as count FROM global_settings;

-- 10. Verificar se existem áreas de interesse
SELECT 'Total de áreas de interesse:' as info, COUNT(*) as count FROM interest_areas;

-- 11. Verificar se existem sub-áreas
SELECT 'Total de sub-áreas:' as info, COUNT(*) as count FROM interest_subareas;

-- 12. Listar alguns perfis do backup com mais detalhes
SELECT 'Perfis do backup:' as info, id, created_at, updated_at
FROM profiles_backup 
ORDER BY created_at DESC 
LIMIT 10;





