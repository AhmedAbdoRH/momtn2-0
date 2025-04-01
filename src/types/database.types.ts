
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
      photos: {
        Row: {
          id: string
          image_url: string
          caption: string | null
          hashtags: string[] | null
          user_id: string
          space_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          caption?: string | null
          hashtags?: string[] | null
          user_id: string
          space_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          caption?: string | null
          hashtags?: string[] | null
          user_id?: string
          space_id?: string | null
          created_at?: string
        }
      }
      spaces: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
        }
      }
      space_members: {
        Row: {
          space_id: string
          user_id: string
          role: string
          joined_at: string
          invited_by: string | null
        }
        Insert: {
          space_id: string
          user_id: string
          role: string
          joined_at?: string
          invited_by?: string | null
        }
        Update: {
          space_id?: string
          user_id?: string
          role?: string
          joined_at?: string
          invited_by?: string | null
        }
      }
      space_invitations: {
        Row: {
          id: string
          space_id: string
          email: string
          token: string
          invited_by: string
          status: 'pending' | 'accepted' | 'rejected' | 'active'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          space_id: string
          email: string
          token: string
          invited_by: string
          status?: 'pending' | 'accepted' | 'rejected' | 'active'
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          space_id?: string
          email?: string
          token?: string
          invited_by?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'active'
          created_at?: string
          expires_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
