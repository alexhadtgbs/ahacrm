export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Case {
  id: number;
  created_at: string;
  assigned_to?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  home_phone?: string;
  cell_phone?: string;
  email?: string;
  channel: 'WEB' | 'FACEBOOK' | 'INFLUENCER';
  origin: string;
  status: 'IN_CORSO' | 'CHIUSO' | 'APPUNTAMENTO';
  disposition?: string;
  outcome?: string;
  clinic: string;
  treatment?: string;
  promotion?: string;
  follow_up_date?: string;
  dialer_campaign_tag?: string;
}

export interface Note {
  id: number;
  created_at: string;
  case_id: number;
  user_id: string;
  content: string;
  profiles?: Profile;
}

export interface CaseWithNotes extends Case {
  notes: Note[];
  assigned_user?: Profile;
}

export interface CaseFormData {
  first_name: string;
  last_name: string;
  phone?: string;
  home_phone?: string;
  cell_phone?: string;
  email?: string;
  channel: 'WEB' | 'FACEBOOK' | 'INFLUENCER';
  origin: string;
  status: 'IN_CORSO' | 'CHIUSO' | 'APPUNTAMENTO';
  disposition?: string;
  outcome?: string;
  clinic: string;
  treatment?: string;
  promotion?: string;
  follow_up_date?: string;
  dialer_campaign_tag?: string;
  assigned_to?: string;
}

export interface CaseFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
  channel?: string;
  assigned_to?: string;
  search?: string;
}

export interface DialerLead {
  record_id: number;
  phone_e164: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export type Locale = 'it' | 'es';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
} 