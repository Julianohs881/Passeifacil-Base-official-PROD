export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  color: string;
  created_at: string;
  visibility: VisibilityOption;
  faculty?: string;
  course_year?: string;
  course?: string;
  share_code: string | null;
}

export type VisibilityOption = "public" | "private";

export type ColorOption =
  | "bg-red-500"
  | "bg-orange-500"
  | "bg-amber-500"
  | "bg-yellow-500"
  | "bg-lime-500"
  | "bg-green-500"
  | "bg-emerald-500"
  | "bg-teal-500"
  | "bg-cyan-500"
  | "bg-sky-500"
  | "bg-blue-500"
  | "bg-indigo-500"
  | "bg-violet-500"
  | "bg-purple-500"
  | "bg-fuchsia-500"
  | "bg-pink-500"
  | "bg-rose-500";

// Define the array of available colors
export const QUIZ_COLORS: ColorOption[] = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500"
];

export type Question = {
  id: string;
  quiz_id: string;
  user_id?: string; // Adding this field to fix the QuestionCard error
  statement: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  created_at: string;
  share_code: string | null;
};

// Add Comment interface for CommentItem and CommentSection components
export interface Comment {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_answer?: number;
}

// Add QuizResult interface for QuestionNavigator component
export interface QuizResult {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

// Add QuestionStatus for use-quiz.tsx
export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect';

// Helper functions
export function isUserCreator(userId: string | undefined, resourceUserId: string | undefined): boolean {
  return !!userId && !!resourceUserId && userId === resourceUserId;
}

export function parseColorOption(color: string | undefined): ColorOption {
  if (!color || !QUIZ_COLORS.includes(color as ColorOption)) {
    return "bg-violet-500"; // Default color
  }
  return color as ColorOption;
}

import { User, Session } from "@supabase/supabase-js";

export type UserPlan = 'gratuito' | 'pro';

export interface UserProfile {
  id: string;
  plan: UserPlan;
  ai_questions_created: number;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
  isPro: () => boolean;
  hasReachedAILimit: () => boolean;
  updateAIQuestionsCreated: () => Promise<void>;
  updateUserProfile: () => Promise<void>; // Nova função adicionada
}
