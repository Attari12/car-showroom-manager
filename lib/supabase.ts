import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Client {
  id: string
  username: string
  password: string
  created_at: string
  last_login?: string
  password_changed: boolean
  password_change_date?: string
}

export interface Car {
  id: string
  client_id: string
  make: string
  model: string
  year: number
  purchase_price: number
  asking_price: number
  purchase_date: string
  owner_name: string
  description?: string
  status: "available" | "sold"
  sold_price?: number
  sold_date?: string
  profit?: number
  created_at: string
  updated_at: string
}

export interface Dealer {
  id: string
  client_id: string
  name: string
  cnic: string
  contact_number: string
  created_at: string
}

export interface Buyer {
  id: string
  client_id: string
  name: string
  cnic: string
  contact_number: string
  created_at: string
}

export interface Debt {
  id: string
  client_id: string
  debtor_type: "dealer" | "buyer"
  debtor_id: string
  amount: number
  debt_type: "owed_to_client" | "owed_by_client"
  description?: string
  created_at: string
  settled_at?: string
  is_settled: boolean
  settled_amount?: number
  settlement_notes?: string
}
