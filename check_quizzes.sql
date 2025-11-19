-- Verificar o estado atual das tabelas
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar se existem quizzes
SELECT 'Total de quizzes:' as info, COUNT(*) as count FROM quizzes;

-- 2. Verificar se existem áreas
SELECT 'Total de áreas:' as info, COUNT(*) as count FROM interest_areas;

-- 3. Verificar se existem sub-áreas
SELECT 'Total de sub-áreas:' as info, COUNT(*) as count FROM interest_subareas;

-- 4. Verificar se existem perfis
SELECT 'Total de perfis:' as info, COUNT(*) as count FROM profiles;

-- 5. Verificar se existem usuários
SELECT 'Total de usuários:' as info, COUNT(*) as count FROM auth.users;





