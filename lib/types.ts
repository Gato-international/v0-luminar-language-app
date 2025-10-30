export type UserRole = "student" | "teacher"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
}

export interface GrammaticalCase {
  id: string
  name: string
  abbreviation: string
  color: string
  description: string | null
  created_at: string
}

export interface Sentence {
  id: string
  chapter_id: string
  text: string
  difficulty: "easy" | "medium" | "hard"
  created_at: string
}

export interface WordAnnotation {
  id: string
  sentence_id: string
  word_index: number
  word_text: string
  grammatical_case_id: string
  explanation: string | null
  created_at: string
}

export interface Exercise {
  id: string
  student_id: string
  chapter_id: string
  exercise_type: "practice" | "test" | "challenge"
  difficulty: "easy" | "medium" | "hard"
  total_questions: number
  status: "in_progress" | "completed"
  created_at: string
  completed_at: string | null
}

export interface ExerciseAttempt {
  id: string
  exercise_id: string
  sentence_id: string
  word_index: number
  selected_case_id: string | null
  correct_case_id: string
  is_correct: boolean
  time_spent_seconds: number | null
  created_at: string
}

export interface StudentProgress {
  id: string
  student_id: string
  chapter_id: string
  total_exercises: number
  completed_exercises: number
  total_correct: number
  total_attempts: number
  accuracy_percentage: number
  last_practiced_at: string | null
  created_at: string
  updated_at: string
}
