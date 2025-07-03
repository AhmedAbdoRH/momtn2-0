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
      comments: {
        Row: {
          id: string
          photo_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          photo_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          photo_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          image_url: string
          caption: string | null
          user_id: string
          group_id: string | null
          likes: number
          hashtags: string[] | null
          order: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          image_url: string
          caption?: string | null
          user_id: string
          group_id?: string | null
          likes?: number
          hashtags?: string[] | null
          order?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          caption?: string | null
          user_id?: string
          group_id?: string | null
          likes?: number
          hashtags?: string[] | null
          order?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
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
