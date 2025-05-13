
import { User, Session } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export type ColorOption = 
  | "bg-blue-500" 
  | "bg-green-500" 
  | "bg-yellow-500" 
  | "bg-red-500" 
  | "bg-purple-500" 
  | "bg-indigo-500" 
  | "bg-pink-500" 
  | "bg-teal-500"
  | "bg-violet-500";

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  color: ColorOption;
  created_at?: string;
}

export const QUIZ_COLORS: ColorOption[] = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-indigo-500", 
  "bg-pink-500",
  "bg-teal-500",
  "bg-violet-500"
];

export interface Question {
  id: string;
  quiz_id: string;
  statement: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  created_at?: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}
