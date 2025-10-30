-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can insert chapters" ON public.chapters;
DROP POLICY IF EXISTS "Teachers can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Teachers can manage grammatical cases" ON public.grammatical_cases;
DROP POLICY IF EXISTS "Teachers can manage sentences" ON public.sentences;
DROP POLICY IF EXISTS "Teachers can manage word annotations" ON public.word_annotations;
DROP POLICY IF EXISTS "Teachers can view all exercises" ON public.exercises;
DROP POLICY IF EXISTS "Teachers can view all attempts" ON public.exercise_attempts;
DROP POLICY IF EXISTS "Teachers can view all progress" ON public.student_progress;

-- Create a helper function to check if current user is a teacher
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'teacher';
END;
$$;

-- Recreate policies using the helper function

-- RLS Policies for profiles
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_teacher());

-- RLS Policies for chapters
CREATE POLICY "Teachers can insert chapters" ON public.chapters
  FOR INSERT WITH CHECK (public.is_teacher());

CREATE POLICY "Teachers can update chapters" ON public.chapters
  FOR UPDATE USING (public.is_teacher());

CREATE POLICY "Teachers can delete chapters" ON public.chapters
  FOR DELETE USING (public.is_teacher());

-- RLS Policies for grammatical_cases
CREATE POLICY "Teachers can insert grammatical cases" ON public.grammatical_cases
  FOR INSERT WITH CHECK (public.is_teacher());

CREATE POLICY "Teachers can update grammatical cases" ON public.grammatical_cases
  FOR UPDATE USING (public.is_teacher());

CREATE POLICY "Teachers can delete grammatical cases" ON public.grammatical_cases
  FOR DELETE USING (public.is_teacher());

-- RLS Policies for sentences
CREATE POLICY "Teachers can insert sentences" ON public.sentences
  FOR INSERT WITH CHECK (public.is_teacher());

CREATE POLICY "Teachers can update sentences" ON public.sentences
  FOR UPDATE USING (public.is_teacher());

CREATE POLICY "Teachers can delete sentences" ON public.sentences
  FOR DELETE USING (public.is_teacher());

-- RLS Policies for word_annotations
CREATE POLICY "Teachers can insert word annotations" ON public.word_annotations
  FOR INSERT WITH CHECK (public.is_teacher());

CREATE POLICY "Teachers can update word annotations" ON public.word_annotations
  FOR UPDATE USING (public.is_teacher());

CREATE POLICY "Teachers can delete word annotations" ON public.word_annotations
  FOR DELETE USING (public.is_teacher());

-- RLS Policies for exercises
CREATE POLICY "Teachers can view all exercises" ON public.exercises
  FOR SELECT USING (public.is_teacher());

-- RLS Policies for exercise_attempts
CREATE POLICY "Teachers can view all attempts" ON public.exercise_attempts
  FOR SELECT USING (public.is_teacher());

-- RLS Policies for student_progress
CREATE POLICY "Teachers can view all progress" ON public.student_progress
  FOR SELECT USING (public.is_teacher());
