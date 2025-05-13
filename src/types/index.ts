
import { User } from "@supabase/supabase-js";

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  color: string;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  statement: string;
  options: string[];
  correct_index: number;
  explanation: string;
  created_at: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export type ColorOption = 
  | "violet-500" 
  | "teal-500" 
  | "orange-500" 
  | "sky-500" 
  | "lime-500" 
  | "pink-500";

export const QUIZ_COLORS: ColorOption[] = [
  "violet-500",
  "teal-500",
  "orange-500",
  "sky-500",
  "lime-500",
  "pink-500"
];

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
