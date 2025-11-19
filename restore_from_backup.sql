-- Restaurar dados do backup
-- Execute este comando no Supabase SQL Editor

-- 1. Primeiro, vamos ver o que temos no backup
SELECT 'ANTES - Perfis no backup:' as info, COUNT(*) as count FROM profiles_backup;
SELECT 'ANTES - Perfis ativos:' as info, COUNT(*) as count FROM profiles;

-- 2. Restaurar perfis do backup para a tabela ativa
-- (apenas se a tabela profiles estiver vazia)
INSERT INTO profiles (id, created_at, updated_at, username, email, full_name, avatar_url, bio, website, location, birth_date, gender, phone, is_verified, is_premium, subscription_status, subscription_expires_at, last_login_at, login_count, preferences, notification_settings, privacy_settings, social_links, interests, skills, education, experience, achievements, badges, points, level, streak, timezone, language, theme, email_verified, phone_verified, two_factor_enabled, backup_codes, recovery_phone, security_questions, last_password_change, failed_login_attempts, locked_until, status, role, permissions, tags, metadata, quiz_count, question_count, answer_count, comment_count, like_count, share_count, view_count, rating, rating_count, followers_count, following_count, posts_count, quizzes_created, quizzes_completed, quizzes_shared, quizzes_liked, quizzes_saved, achievements_unlocked, badges_earned, points_earned, level_reached, streak_current, streak_longest, time_spent, last_activity, last_quiz_taken, last_question_answered, last_comment_made, last_like_given, last_share_made, last_view_made, last_rating_given, last_follow_made, last_unfollow_made, last_post_made, last_achievement_earned, last_badge_earned, last_point_earned, last_level_reached, last_streak_updated, last_time_spent, last_activity_updated, last_quiz_taken_updated, last_question_answered_updated, last_comment_made_updated, last_like_given_updated, last_share_made_updated, last_view_made_updated, last_rating_given_updated, last_follow_made_updated, last_unfollow_made_updated, last_post_made_updated, last_achievement_earned_updated, last_badge_earned_updated, last_point_earned_updated, last_level_reached_updated, last_streak_updated_updated, last_time_spent_updated, last_activity_updated_updated)
SELECT id, created_at, updated_at, username, email, full_name, avatar_url, bio, website, location, birth_date, gender, phone, is_verified, is_premium, subscription_status, subscription_expires_at, last_login_at, login_count, preferences, notification_settings, privacy_settings, social_links, interests, skills, education, experience, achievements, badges, points, level, streak, timezone, language, theme, email_verified, phone_verified, two_factor_enabled, backup_codes, recovery_phone, security_questions, last_password_change, failed_login_attempts, locked_until, status, role, permissions, tags, metadata, quiz_count, question_count, answer_count, comment_count, like_count, share_count, view_count, rating, rating_count, followers_count, following_count, posts_count, quizzes_created, quizzes_completed, quizzes_shared, quizzes_liked, quizzes_saved, achievements_unlocked, badges_earned, points_earned, level_reached, streak_current, streak_longest, time_spent, last_activity, last_quiz_taken, last_question_answered, last_comment_made, last_like_given, last_share_made, last_view_made, last_rating_given, last_follow_made, last_unfollow_made, last_post_made, last_achievement_earned, last_badge_earned, last_point_earned, last_level_reached, last_streak_updated, last_time_spent, last_activity_updated, last_quiz_taken_updated, last_question_answered_updated, last_comment_made_updated, last_like_given_updated, last_share_made_updated, last_view_made_updated, last_rating_given_updated, last_follow_made_updated, last_unfollow_made_updated, last_post_made_updated, last_achievement_earned_updated, last_badge_earned_updated, last_point_earned_updated, last_level_reached_updated, last_streak_updated_updated, last_time_spent_updated, last_activity_updated_updated
FROM profiles_backup
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profiles_backup.id);

-- 3. Verificar resultado
SELECT 'DEPOIS - Perfis ativos:' as info, COUNT(*) as count FROM profiles;

-- 4. Listar perfis restaurados
SELECT 'Perfis restaurados:' as info, id, created_at, updated_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;





