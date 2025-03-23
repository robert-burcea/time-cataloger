
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
      categories: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          category_id: string
          completed: boolean
          created_at: string
          updated_at: string
          deadline: string | null
          scheduled_date: string | null
          scheduled_start_time: string | null
          scheduled_end_time: string | null
          user_id: string
          is_recurring: boolean
          recurrence_pattern: string | null
          recurrence_end_date: string | null
          recurrence_frequency: number | null
          recurrence_interval: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category_id: string
          completed?: boolean
          created_at?: string
          updated_at?: string
          deadline?: string | null
          scheduled_date?: string | null
          scheduled_start_time?: string | null
          scheduled_end_time?: string | null
          user_id: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: number | null
          recurrence_interval?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
          deadline?: string | null
          scheduled_date?: string | null
          scheduled_start_time?: string | null
          scheduled_end_time?: string | null
          user_id?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: number | null
          recurrence_interval?: string | null
        }
      }
      task_tags: {
        Row: {
          id: string
          task_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          task_id: string
          tag_id: string
        }
        Update: {
          id?: string
          task_id?: string
          tag_id?: string
        }
      }
      time_logs: {
        Row: {
          id: string
          task_id: string
          start_time: string
          end_time: string | null
          duration: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          start_time: string
          end_time?: string | null
          duration?: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
