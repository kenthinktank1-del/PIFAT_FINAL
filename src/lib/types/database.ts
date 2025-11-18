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
      users: {
        Row: {
          user_id: string
          name: string
          email: string
          role: 'admin' | 'analyst' | 'field_officer' | 'reviewer'
          password_hash: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          name: string
          email: string
          role: 'admin' | 'analyst' | 'field_officer' | 'reviewer'
          password_hash: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          email?: string
          role?: 'admin' | 'analyst' | 'field_officer' | 'reviewer'
          password_hash?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          case_id: string
          title: string
          description: string | null
          created_by: string | null
          assigned_to: string | null
          status: 'open' | 'in_progress' | 'closed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          case_id?: string
          title: string
          description?: string | null
          created_by?: string | null
          assigned_to?: string | null
          status?: 'open' | 'in_progress' | 'closed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          title?: string
          description?: string | null
          created_by?: string | null
          assigned_to?: string | null
          status?: 'open' | 'in_progress' | 'closed' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      devices: {
        Row: {
          device_id: string
          case_id: string | null
          device_category: string
          device_type: string | null
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          ai_fingerprint_result: Json | null
          metadata_json: Json
          created_at: string
        }
        Insert: {
          device_id?: string
          case_id?: string | null
          device_category: string
          device_type?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          ai_fingerprint_result?: Json | null
          metadata_json?: Json
          created_at?: string
        }
        Update: {
          device_id?: string
          case_id?: string | null
          device_category?: string
          device_type?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          ai_fingerprint_result?: Json | null
          metadata_json?: Json
          created_at?: string
        }
      }
      evidence: {
        Row: {
          evidence_id: string
          case_id: string | null
          device_id: string | null
          file_path: string
          encryption_key_ref: string | null
          size: number | null
          sha256_hash: string
          md5_hash: string | null
          uploaded_by: string | null
          ai_status: 'pending' | 'analyzing' | 'complete' | 'failed'
          uploaded_at: string
        }
        Insert: {
          evidence_id?: string
          case_id?: string | null
          device_id?: string | null
          file_path: string
          encryption_key_ref?: string | null
          size?: number | null
          sha256_hash: string
          md5_hash?: string | null
          uploaded_by?: string | null
          ai_status?: 'pending' | 'analyzing' | 'complete' | 'failed'
          uploaded_at?: string
        }
        Update: {
          evidence_id?: string
          case_id?: string | null
          device_id?: string | null
          file_path?: string
          encryption_key_ref?: string | null
          size?: number | null
          sha256_hash?: string
          md5_hash?: string | null
          uploaded_by?: string | null
          ai_status?: 'pending' | 'analyzing' | 'complete' | 'failed'
          uploaded_at?: string
        }
      }
      ai_results: {
        Row: {
          ai_id: string
          evidence_id: string | null
          classifier_output: Json | null
          anomaly_output: Json | null
          fingerprint_output: Json | null
          summary_report: string | null
          risk_score: number | null
          created_at: string
        }
        Insert: {
          ai_id?: string
          evidence_id?: string | null
          classifier_output?: Json | null
          anomaly_output?: Json | null
          fingerprint_output?: Json | null
          summary_report?: string | null
          risk_score?: number | null
          created_at?: string
        }
        Update: {
          ai_id?: string
          evidence_id?: string | null
          classifier_output?: Json | null
          anomaly_output?: Json | null
          fingerprint_output?: Json | null
          summary_report?: string | null
          risk_score?: number | null
          created_at?: string
        }
      }
      chain_of_custody: {
        Row: {
          coc_id: string
          evidence_id: string | null
          action: string
          performed_by: string | null
          timestamp: string
          hash_prev: string | null
          hash_current: string
          details: Json
        }
        Insert: {
          coc_id?: string
          evidence_id?: string | null
          action: string
          performed_by?: string | null
          timestamp?: string
          hash_prev?: string | null
          hash_current: string
          details?: Json
        }
        Update: {
          coc_id?: string
          evidence_id?: string | null
          action?: string
          performed_by?: string | null
          timestamp?: string
          hash_prev?: string | null
          hash_current?: string
          details?: Json
        }
      }
      logs: {
        Row: {
          log_id: string
          case_id: string | null
          user_id: string | null
          action: string
          details: Json
          timestamp: string
          ip_address: string | null
          hash_prev: string | null
          hash_current: string
        }
        Insert: {
          log_id?: string
          case_id?: string | null
          user_id?: string | null
          action: string
          details?: Json
          timestamp?: string
          ip_address?: string | null
          hash_prev?: string | null
          hash_current: string
        }
        Update: {
          log_id?: string
          case_id?: string | null
          user_id?: string | null
          action?: string
          details?: Json
          timestamp?: string
          ip_address?: string | null
          hash_prev?: string | null
          hash_current?: string
        }
      }
      tasks: {
        Row: {
          task_id: string
          case_id: string | null
          assigned_to: string | null
          description: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          task_id?: string
          case_id?: string | null
          assigned_to?: string | null
          description: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          task_id?: string
          case_id?: string | null
          assigned_to?: string | null
          description?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
