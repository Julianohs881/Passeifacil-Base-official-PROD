-- Verificar o estado atual de todas as tabelas
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

-- 6. Verificar se existem questões
SELECT 'Total de questões:' as info, COUNT(*) as count FROM questions;

-- 7. Verificar se existem respostas
SELECT 'Total de respostas:' as info, COUNT(*) as count FROM quiz_answers;

-- 8. Listar algumas tabelas para ver o que resta
SELECT 'Últimos 5 quizzes:' as info, id, title, created_at FROM quizzes ORDER BY created_at DESC LIMIT 5;
SELECT 'Últimos 5 perfis:' as info, id, username, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;





