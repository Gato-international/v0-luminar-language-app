-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create grammatical cases table
CREATE TABLE IF NOT EXISTS public.grammatical_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sentences table
CREATE TABLE IF NOT EXISTS public.sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create word annotations table (correct answers for sentences)
CREATE TABLE IF NOT EXISTS public.word_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentence_id UUID REFERENCES public.sentences(id) ON DELETE CASCADE,
  word_index INTEGER NOT NULL,
  word_text TEXT NOT NULL,
  grammatical_case_id UUID REFERENCES public.grammatical_cases(id) ON DELETE CASCADE,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sentence_id, word_index)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('practice', 'test', 'challenge')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  total_questions INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create exercise attempts table (student answers)
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  sentence_id UUID REFERENCES public.sentences(id) ON DELETE CASCADE,
  word_index INTEGER NOT NULL,
  selected_case_id UUID REFERENCES public.grammatical_cases(id),
  correct_case_id UUID REFERENCES public.grammatical_cases(id),
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  total_exercises INTEGER DEFAULT 0,
  completed_exercises INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, chapter_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammatical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for chapters (public read, teacher write)
CREATE POLICY "Anyone can view chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "Teachers can insert chapters" ON public.chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update chapters" ON public.chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for grammatical_cases (public read, teacher write)
CREATE POLICY "Anyone can view grammatical cases" ON public.grammatical_cases
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage grammatical cases" ON public.grammatical_cases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for sentences (public read, teacher write)
CREATE POLICY "Anyone can view sentences" ON public.sentences
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage sentences" ON public.sentences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for word_annotations (public read, teacher write)
CREATE POLICY "Anyone can view word annotations" ON public.word_annotations
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage word annotations" ON public.word_annotations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for exercises (students see their own, teachers see all)
CREATE POLICY "Students can view their own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all exercises" ON public.exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for exercise_attempts
CREATE POLICY "Students can view their own attempts" ON public.exercise_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exercises
      WHERE id = exercise_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Students can create their own attempts" ON public.exercise_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exercises
      WHERE id = exercise_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view all attempts" ON public.exercise_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- RLS Policies for student_progress
CREATE POLICY "Students can view their own progress" ON public.student_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" ON public.student_progress
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all progress" ON public.student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_sentences_chapter ON public.sentences(chapter_id);
CREATE INDEX IF NOT EXISTS idx_exercises_student ON public.exercises(student_id);
CREATE INDEX IF NOT EXISTS idx_exercises_status ON public.exercises(status);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_exercise ON public.exercise_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
