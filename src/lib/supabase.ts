import { createClient } from '@supabase/supabase-js';

// Access variables safely
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Robust configuration detection
export const isSupabaseConfigured = Boolean(
  rawUrl.length > 10 && 
  rawKey.length > 50 && 
  rawUrl.includes('.supabase.co') &&
  rawKey.includes('.')
);

// We export a fixed instance for backward compatibility with existing components,
// but we ensure it uses the best available values.
export const supabase = createClient(
  isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? rawKey : 'placeholder-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured
    },
    global: {
      headers: isSupabaseConfigured ? {} : { 'X-Configuration-Status': 'MISSING' }
    }
  }
);

if (!isSupabaseConfigured) {
  console.warn('⚡ [SUPABASE] CONFIGURATION MISSING. PLEASE SET VITE_SUPABASE_URL AND VITE_SUPABASE_ANON_KEY BY CLICKING ON SETTINGS.');
}

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
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          sizes: string[]
          condition: string | null
          images: string[]
          stock: number
          tags: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          sizes: string[]
          condition?: string | null
          images: string[]
          stock: number
          tags?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          sizes?: string[]
          condition?: string | null
          images?: string[]
          stock?: number
          tags?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          customer_email: string | null
          items: Json
          total_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_email?: string | null
          items: Json
          total_amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_email?: string | null
          items?: Json
          total_amount?: number
          status?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
        }
      }
    }
  }
}
