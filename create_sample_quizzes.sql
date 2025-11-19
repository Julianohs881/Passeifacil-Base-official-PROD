-- Criar quizzes de exemplo para testar o sistema
-- Execute este comando no Supabase SQL Editor

-- 1. Primeiro, vamos pegar alguns IDs de usuários existentes
SELECT 'Usuários disponíveis para criar quizzes:' as info, id, name 
FROM profiles 
WHERE name IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Pegar alguns IDs de áreas de interesse
SELECT 'Áreas de interesse disponíveis:' as info, id, name 
FROM interest_areas 
ORDER BY name 
LIMIT 5;

-- 3. Pegar alguns IDs de sub-áreas
SELECT 'Sub-áreas disponíveis:' as info, id, name, parent_area_id 
FROM interest_subareas 
ORDER BY name 
LIMIT 10;





