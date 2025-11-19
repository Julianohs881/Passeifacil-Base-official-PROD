-- Create quiz_access_logs table to track quiz views
CREATE TABLE IF NOT EXISTS quiz_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_access_logs_quiz_id ON quiz_access_logs(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_access_logs_accessed_at ON quiz_access_logs(accessed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_access_logs_user_id ON quiz_access_logs(user_id);

-- Enable Row Level Security
ALTER TABLE quiz_access_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_access_logs
-- Anyone can insert access logs (for tracking)
CREATE POLICY "Anyone can insert access logs" ON quiz_access_logs
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can view their own access logs
CREATE POLICY "Users can view their own access logs" ON quiz_access_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Add access_count field to quizzes table for caching
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

-- Create function to update access count
CREATE OR REPLACE FUNCTION update_quiz_access_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quizzes 
  SET access_count = (
    SELECT COUNT(*) 
    FROM quiz_access_logs 
    WHERE quiz_id = NEW.quiz_id
  )
  WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update access count
CREATE TRIGGER trigger_update_quiz_access_count
  AFTER INSERT ON quiz_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_access_count();


