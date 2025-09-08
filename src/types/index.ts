import { Session, User } from "@supabase/supabase-js";

export type ColorOption = "bg-gray-50";

export const QUIZ_COLORS: ColorOption[] = ["bg-gray-50"];

export type VisibilityOption = "public" | "private";
export type UserPlan = "gratuito" | "pro" | "assinante" | "cancelado" | "sem assinatura";
export type QuestionStatus = "unanswered" | "correct" | "incorrect";

export interface Quiz {
  id: string;
  created_at: string;
  title: string;
  color: ColorOption;
  visibility: VisibilityOption;
  user_id: string;
  faculty?: string;
  course_year?: string;
  course?: string;
  description?: string;
  share_code: string | null;
}

export interface Question {
  id: string;
  created_at: string;
  quiz_id: string;
  statement: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  user_id?: string;
  share_code: string | null;
}

export interface Comment {
  id: string;
  created_at: string;
  question_id: string;
  user_id: string;
  content: string;
  user_answer?: number;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  user_id: string;
  selected_option: number;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnswerStats {
  optionIndex: number;
  count: number;
  percentage: number;
  isCorrect: boolean;
}

export interface QuizResult {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  name?: string;
  avatar_url?: string;
  ai_questions_created?: number;
  created_at?: string;
  // Subscription related fields
  has_access?: boolean;
  manual_access?: boolean;
  stripe_customer_id?: string | null;
  subscription_id?: string | null;
  subscription_status?: string | null;
  subscription_end_date?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
  isPro: () => boolean;
  hasReachedAILimit: () => boolean;
  updateAIQuestionsCreated: () => Promise<void>;
  updateUserProfile: () => Promise<void>;
  updateProfile?: (data: { name?: string, avatarUrl?: string }) => Promise<boolean>;
  getAIUsageStats?: () => {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
  resetAIQuestionsCount?: () => Promise<void>;
}

// Helper function to parse a string to a valid ColorOption
export const parseColorOption = (color: string | undefined): ColorOption => {
  // Always return the default color
  return "bg-gray-50";
};
