-- Comando corrigido para verificar a estrutura das tabelas
-- Execute este comando no Supabase SQL Editor

-- 1. Verificar a estrutura da tabela quiz_answers
SELECT 'Estrutura da tabela quiz_answers:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_answers' 
ORDER BY ordinal_position;

-- 2. Verificar a estrutura da tabela questions
SELECT 'Estrutura da tabela questions:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'questions' 
ORDER BY ordinal_position;

-- 3. Verificar a estrutura da tabela quizzes
SELECT 'Estrutura da tabela quizzes:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
ORDER BY ordinal_position;

-- 4. Verificar se existem dados em cada tabela
SELECT 'Total de quizzes:' as info, COUNT(*) as count FROM quizzes;
SELECT 'Total de questões:' as info, COUNT(*) as count FROM questions;
SELECT 'Total de respostas:' as info, COUNT(*) as count FROM quiz_answers;
SELECT 'Total de perfis:' as info, COUNT(*) as count FROM profiles;

-- 5. Listar todas as tabelas do schema público
SELECT 'Tabelas disponíveis:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;





