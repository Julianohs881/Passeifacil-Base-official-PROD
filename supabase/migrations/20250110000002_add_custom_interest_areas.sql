-- Add custom field to interest_areas table
ALTER TABLE interest_areas 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- Add user_id field for custom interest areas
ALTER TABLE interest_areas 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing interest areas to be non-custom and standardize names
UPDATE interest_areas 
SET is_custom = FALSE,
    name = UPPER(REGEXP_REPLACE(name, '[0-9]', '', 'g'))
WHERE is_custom IS NULL;

-- Create index for custom interest areas
CREATE INDEX IF NOT EXISTS idx_interest_areas_custom ON interest_areas(is_custom, user_id);

-- Update RLS policies to allow users to manage their own custom interest areas
CREATE POLICY "Users can insert their own custom interest areas" ON interest_areas
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (is_custom = FALSE OR user_id = auth.uid())
  );

CREATE POLICY "Users can update their own custom interest areas" ON interest_areas
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    (is_custom = FALSE OR user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own custom interest areas" ON interest_areas
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    (is_custom = FALSE OR user_id = auth.uid())
  );
