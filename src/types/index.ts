import { Session, User } from "@supabase/supabase-js";

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
  | "bg-rose-500"
  | "bg-gray-500";

export type VisibilityOption = "public" | "private";

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

export interface UserProfile {
  id: string;
  plan: 'gratuito' | 'pro';
  ai_questions_created?: number;
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
  updateUserProfile: () => Promise<void>;
  getAIUsageStats?: () => {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
  resetAIQuestionsCount?: () => Promise<void>;
}
