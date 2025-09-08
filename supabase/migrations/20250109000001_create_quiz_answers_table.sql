-- Create quiz_answers table to store user responses for statistics
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL CHECK (selected_option >= 0),
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one answer per user per question
  UNIQUE(question_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id ON quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_created_at ON quiz_answers(created_at);

-- Enable Row Level Security
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can insert their own answers
CREATE POLICY "Users can insert their own answers" ON quiz_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view all answers for statistics (anonymous users can also view)
CREATE POLICY "Anyone can view answers for statistics" ON quiz_answers
  FOR SELECT USING (true);

-- Users can update their own answers
CREATE POLICY "Users can update their own answers" ON quiz_answers
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete their own answers" ON quiz_answers
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_quiz_answers_updated_at
  BEFORE UPDATE ON quiz_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
