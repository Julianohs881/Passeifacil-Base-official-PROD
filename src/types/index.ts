
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

export type VisibilityOption = "public" | "private";

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  color: ColorOption;
  created_at?: string;
  visibility: VisibilityOption;
  faculty?: string;
  course_year?: string;
  course?: string;
  share_code?: string | null;
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

// Helper function to safely convert string to ColorOption
export const parseColorOption = (color: string | null | undefined): ColorOption => {
  if (!color) return "bg-violet-500";
  return QUIZ_COLORS.includes(color as ColorOption) 
    ? (color as ColorOption) 
    : "bg-violet-500";
};

export interface Question {
  id: string;
  quiz_id: string;
  user_id?: string; // Adicionamos o user_id para poder verificar se o usuário é o criador
  statement: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  created_at?: string;
  share_code?: string | null;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export interface Comment {
  id: string;
  user_id: string;
  question_id: string;
  content: string;
  user_answer?: number;
  created_at: string;
  user_email?: string; // Adicionamos o e-mail do usuário como opcional
}

// Nova interface para verificar se o usuário é o criador de um item
export interface UserIsCreatorProps {
  userId: string;
  creatorId: string;
}

// Função auxiliar para verificar se o usuário é o criador
export const isUserCreator = ({ userId, creatorId }: UserIsCreatorProps): boolean => {
  return userId === creatorId;
};

export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect';

