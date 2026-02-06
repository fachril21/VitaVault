// Database types for Supabase
// Auto-generated types would normally come from: npx supabase gen types typescript

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
      medical_records: {
        Row: {
          id: string
          user_id: string
          ipfs_cid: string
          original_filename: string | null
          file_type: 'lab_report' | 'prescription' | 'diagnosis' | 'imaging' | 'other' | null
          encrypted_symmetric_key: string
          access_conditions: Json
          extracted_data: Json | null
          document_date: string | null
          created_at: string
          updated_at: string
          tags: string[]
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          ipfs_cid: string
          original_filename?: string | null
          file_type?: 'lab_report' | 'prescription' | 'diagnosis' | 'imaging' | 'other' | null
          encrypted_symmetric_key: string
          access_conditions: Json
          extracted_data?: Json | null
          document_date?: string | null
          created_at?: string
          updated_at?: string
          tags?: string[]
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          ipfs_cid?: string
          original_filename?: string | null
          file_type?: 'lab_report' | 'prescription' | 'diagnosis' | 'imaging' | 'other' | null
          encrypted_symmetric_key?: string
          access_conditions?: Json
          extracted_data?: Json | null
          document_date?: string | null
          created_at?: string
          updated_at?: string
          tags?: string[]
          deleted_at?: string | null
        }
      }
      shared_access: {
        Row: {
          id: string
          record_id: string
          owner_id: string
          share_token: string
          recipient_email: string | null
          can_view: boolean
          can_download: boolean
          expires_at: string | null
          max_views: number | null
          view_count: number
          created_at: string
          last_accessed_at: string | null
          revoked_at: string | null
          access_reason: string | null
        }
        Insert: {
          id?: string
          record_id: string
          owner_id: string
          share_token: string
          recipient_email?: string | null
          can_view?: boolean
          can_download?: boolean
          expires_at?: string | null
          max_views?: number | null
          view_count?: number
          created_at?: string
          last_accessed_at?: string | null
          revoked_at?: string | null
          access_reason?: string | null
        }
        Update: {
          id?: string
          record_id?: string
          owner_id?: string
          share_token?: string
          recipient_email?: string | null
          can_view?: boolean
          can_download?: boolean
          expires_at?: string | null
          max_views?: number | null
          view_count?: number
          created_at?: string
          last_accessed_at?: string | null
          revoked_at?: string | null
          access_reason?: string | null
        }
      }
      access_logs: {
        Row: {
          id: string
          record_id: string
          user_id: string | null
          shared_access_id: string | null
          action: 'view' | 'download' | 'share' | 'revoke' | 'delete'
          ip_address: string | null
          user_agent: string | null
          occurred_at: string
        }
        Insert: {
          id?: string
          record_id: string
          user_id?: string | null
          shared_access_id?: string | null
          action: 'view' | 'download' | 'share' | 'revoke' | 'delete'
          ip_address?: string | null
          user_agent?: string | null
          occurred_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          user_id?: string | null
          shared_access_id?: string | null
          action?: 'view' | 'download' | 'share' | 'revoke' | 'delete'
          ip_address?: string | null
          user_agent?: string | null
          occurred_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_share_view_count: {
        Args: { token: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type MedicalRecord = Database['public']['Tables']['medical_records']['Row']
export type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert']
export type SharedAccess = Database['public']['Tables']['shared_access']['Row']
export type AccessLog = Database['public']['Tables']['access_logs']['Row']

// Extracted data structure from Gemini
export interface ExtractedMedicalData {
  document_type: 'lab_report' | 'prescription' | 'diagnosis' | 'imaging' | 'other'
  patient_name: string | null
  date: string | null
  provider: {
    name: string | null
    facility: string | null
  } | null
  diagnosis: string[] | null
  medications: {
    name: string
    dosage: string | null
    frequency: string | null
    duration: string | null
  }[] | null
  tests: {
    name: string
    result: string | null
    unit: string | null
    reference_range: string | null
  }[] | null
  vital_signs: {
    blood_pressure: string | null
    heart_rate: string | null
    temperature: string | null
    weight: string | null
  } | null
  notes: string | null
  follow_up: string | null
}
