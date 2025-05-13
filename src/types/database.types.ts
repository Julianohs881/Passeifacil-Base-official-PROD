
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
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          color?: string
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
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          statement: string
          options: string[]
          correct_index: number
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          statement?: string
          options?: string[]
          correct_index?: number
          explanation?: string
          created_at?: string
        }
      }
    }
  }
}
