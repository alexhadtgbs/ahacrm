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
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      cases: {
        Row: {
          id: number
          created_at: string
          assigned_to: string | null
          first_name: string
          last_name: string
          phone: string
          email: string | null
          channel: 'WEB' | 'FACEBOOK' | 'INFLUENCER'
          origin: string
          status: 'IN_CORSO' | 'CHIUSO' | 'APPUNTAMENTO'
          outcome: string | null
          clinic: string
          treatment: string | null
          promotion: string | null
          follow_up_date: string | null
          dialer_campaign_tag: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          assigned_to?: string | null
          first_name: string
          last_name: string
          phone: string
          email?: string | null
          channel: 'WEB' | 'FACEBOOK' | 'INFLUENCER'
          origin: string
          status?: 'IN_CORSO' | 'CHIUSO' | 'APPUNTAMENTO'
          outcome?: string | null
          clinic: string
          treatment?: string | null
          promotion?: string | null
          follow_up_date?: string | null
          dialer_campaign_tag?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          assigned_to?: string | null
          first_name?: string
          last_name?: string
          phone?: string
          email?: string | null
          channel?: 'WEB' | 'FACEBOOK' | 'INFLUENCER'
          origin?: string
          status?: 'IN_CORSO' | 'CHIUSO' | 'APPUNTAMENTO'
          outcome?: string | null
          clinic?: string
          treatment?: string | null
          promotion?: string | null
          follow_up_date?: string | null
          dialer_campaign_tag?: string | null
        }
      }
      notes: {
        Row: {
          id: number
          created_at: string
          case_id: number
          user_id: string
          content: string
        }
        Insert: {
          id?: number
          created_at?: string
          case_id: number
          user_id: string
          content: string
        }
        Update: {
          id?: number
          created_at?: string
          case_id?: number
          user_id?: string
          content?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leads_for_dialer: {
        Args: {
          campaign_tag_filter: string
        }
        Returns: {
          record_id: number
          phone_e164: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 