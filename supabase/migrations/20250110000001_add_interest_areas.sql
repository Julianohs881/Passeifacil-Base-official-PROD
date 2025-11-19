-- Create interest_areas table
CREATE TABLE IF NOT EXISTS interest_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default interest areas
INSERT INTO interest_areas (name, description, icon, color) VALUES
('Nutrição', 'Área de estudos sobre alimentação e saúde', 'Apple', '#10B981'),
('Engenharia', 'Área de estudos técnicos e tecnológicos', 'Wrench', '#3B82F6'),
('Medicina', 'Área de estudos médicos e saúde', 'Heart', '#EF4444'),
('Direito', 'Área de estudos jurídicos e legais', 'Scale', '#8B5CF6'),
('Administração', 'Área de estudos empresariais e gestão', 'Briefcase', '#F59E0B'),
('Psicologia', 'Área de estudos do comportamento humano', 'Brain', '#EC4899'),
('Educação', 'Área de estudos pedagógicos e ensino', 'GraduationCap', '#06B6D4'),
('Tecnologia', 'Área de estudos de programação e TI', 'Code', '#6366F1'),
('Arquitetura', 'Área de estudos de design e construção', 'Home', '#84CC16'),
('Economia', 'Área de estudos financeiros e econômicos', 'TrendingUp', '#F97316'),
('História', 'Área de estudos históricos e culturais', 'BookOpen', '#6B7280'),
('Biologia', 'Área de estudos das ciências biológicas', 'Dna', '#10B981'),
('Física', 'Área de estudos das ciências físicas', 'Atom', '#3B82F6'),
('Química', 'Área de estudos das ciências químicas', 'FlaskConical', '#8B5CF6'),
('Matemática', 'Área de estudos matemáticos e estatísticos', 'Calculator', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- Add interest_areas field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS interest_areas UUID[] DEFAULT '{}';

-- Add area_of_interest field to quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS area_of_interest UUID REFERENCES interest_areas(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_interest_areas ON profiles USING GIN (interest_areas);
CREATE INDEX IF NOT EXISTS idx_quizzes_area_of_interest ON quizzes(area_of_interest);

-- Enable Row Level Security
ALTER TABLE interest_areas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interest_areas
-- Anyone can view interest areas
CREATE POLICY "Anyone can view interest areas" ON interest_areas
  FOR SELECT USING (true);

-- Only authenticated users can insert interest areas (for admin purposes)
CREATE POLICY "Authenticated users can insert interest areas" ON interest_areas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update interest areas (for admin purposes)
CREATE POLICY "Authenticated users can update interest areas" ON interest_areas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete interest areas (for admin purposes)
CREATE POLICY "Authenticated users can delete interest areas" ON interest_areas
  FOR DELETE USING (auth.role() = 'authenticated');

