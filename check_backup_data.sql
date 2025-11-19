-- Verificar dados no backup e tentar recuperar
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar estrutura da tabela profiles_backup
SELECT 'Estrutura da tabela profiles_backup:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles_backup' 
ORDER BY ordinal_position;

-- 2. Verificar quantos perfis existem no backup
SELECT 'Total de perfis no backup:' as info, COUNT(*) as count FROM profiles_backup;

-- 3. Verificar quantos perfis existem na tabela ativa
SELECT 'Total de perfis ativos:' as info, COUNT(*) as count FROM profiles;

-- 4. Verificar se há diferenças entre backup e ativo
SELECT 'Perfis no backup que não estão na tabela ativa:' as info, COUNT(*) as count 
FROM profiles_backup 
WHERE id NOT IN (SELECT id FROM profiles);

-- 5. Listar alguns perfis do backup
SELECT 'Primeiros 5 perfis do backup:' as info, id, created_at 
FROM profiles_backup 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Verificar se existem quizzes (deve ser 0)
SELECT 'Total de quizzes:' as info, COUNT(*) as count FROM quizzes;

-- 7. Verificar se existem questões (deve ser 0)
SELECT 'Total de questões:' as info, COUNT(*) as count FROM questions;

-- 8. Verificar se existem respostas (deve ser 0)
SELECT 'Total de respostas:' as info, COUNT(*) as count FROM quiz_answers;





