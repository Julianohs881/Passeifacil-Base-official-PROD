
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quizzes: {
        Row: {
          id: string
          user_id: string
          title: string
          color: string
          area_of_interest: string | null
          subarea_of_interest: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          color?: string
          area_of_interest?: string | null
          subarea_of_interest?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          color?: string
          area_of_interest?: string | null
          subarea_of_interest?: string | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          statement: string
          options: string[]
          correct_index: number
          explanation: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          statement: string
          options: string[]
          correct_index: number
          explanation: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          statement?: string
          options?: string[]
          correct_index?: number
          explanation?: string
          image_url?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          plan: string
          has_access: boolean
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_end_date: string | null
          interest_areas: string[]
          interest_subareas: string[]
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          plan?: string
          has_access?: boolean
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          interest_areas?: string[]
          interest_subareas?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          plan?: string
          has_access?: boolean
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          interest_areas?: string[]
          interest_subareas?: string[]
          created_at?: string
        }
      }
      interest_areas: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      interest_subareas: {
        Row: {
          id: string
          parent_area_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_area_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_area_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          question_id: string
          user_id: string
          selected_option: number
          is_correct: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          selected_option: number
          is_correct: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          selected_option?: number
          is_correct?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
