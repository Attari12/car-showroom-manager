import { createClient } from "@supabase/supabase-js"

// Environment variables - replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://saicjjshmgwsitmwvomj.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaWNqanNobWd3c2l0bXd2b21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzM4OTQsImV4cCI6MjA2OTMwOTg5NH0.DjDOkzdTmRPM7aC-E8xvYT61jPzk2eSmSedzy1qr-4c"

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Client {
  id: string
  username: string
  password: string
  created_at: string
  last_login?: string
  password_changed: boolean
}

export interface Car {
  id: string
  client_id: string
  make: string
  model: string
  year: number
  registration_number: string
  mileage: number
  purchase_price: number
  asking_price: number
  purchase_date: string
  owner_name: string
  dealer_commission?: number
  status: "available" | "sold" | "reserved" | "pending"
  description?: string
  images?: string[]
  documents?: string[]
  dealer_id?: string
  buyer_id?: string
  created_at: string
  updated_at: string
}

export interface Dealer {
  id: string
  client_id: string
  name: string
  email: string
  phone: string
  address: string
  cnic: string
  license_number?: string
  created_at: string
  updated_at: string
}

export interface Buyer {
  id: string
  client_id: string
  name: string
  email: string
  phone: string
  address: string
  cnic: string
  created_at: string
  updated_at: string
}

// Test database connection with timeout
export async function testConnection() {
  try {
    console.log("Testing database connection...")

    // Create a promise that will timeout after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout")), 5000)
    })

    // Test the connection by trying to select from clients table
    const connectionPromise = supabase.from("clients").select("id").limit(1)

    const { data, error } = (await Promise.race([connectionPromise, timeoutPromise])) as any

    if (error) {
      console.error("Connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("Database connection successful")
    return { success: true, data }
  } catch (error: any) {
    console.error("Connection test error:", error)
    return { success: false, error: error.message || "Connection failed" }
  }
}

// Client operations
export async function getClients() {
  try {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error in getClients:", error)
    throw error
  }
}

export async function getClientByUsername(username: string) {
  try {
    const { data, error } = await supabase.from("clients").select("*").eq("username", username).maybeSingle()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getClientByUsername:", error)
    throw error
  }
}

// Renamed to avoid conflict with Supabase's createClient
export async function insertClient(client: Omit<Client, "id" | "created_at">) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .insert([
        {
          ...client,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in insertClient:", error)
    throw error
  }
}

export async function updateClient(id: string, updates: Partial<Client>) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .update({
        ...updates,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in updateClient:", error)
    throw error
  }
}

export async function deleteClient(id: string) {
  try {
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteClient:", error)
    throw error
  }
}

// Authentication helper
export async function authenticateClient(username: string, password: string) {
  try {
    console.log("Attempting to authenticate:", username)

    const client = await getClientByUsername(username)
    console.log("Client found:", client)

    if (client && client.password === password) {
      // Update last login
      await updateClient(client.id, {
        last_login: new Date().toISOString(),
      })

      return { success: true, client }
    }

    return { success: false, error: "Invalid username or password" }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Car operations
export async function getCars(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error in getCars:", error)
    throw error
  }
}

export async function getCarById(id: string) {
  try {
    const { data, error } = await supabase.from("cars").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getCarById:", error)
    throw error
  }
}

export async function createCar(car: Omit<Car, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("cars")
      .insert([
        {
          ...car,
          images: car.images || [],
          documents: car.documents || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return { data, error: null }
  } catch (error) {
    console.error("Error in createCar:", error)
    return { data: null, error }
  }
}

export async function updateCar(id: string, updates: Partial<Car>) {
  try {
    const { data, error } = await supabase
      .from("cars")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in updateCar:", error)
    throw error
  }
}

export async function deleteCar(id: string) {
  try {
    const { error } = await supabase.from("cars").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteCar:", error)
    throw error
  }
}

// Dealer operations
export async function getDealers(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("dealers")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error in getDealers:", error)
    throw error
  }
}

export async function createDealer(dealer: Omit<Dealer, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("dealers")
      .insert([
        {
          ...dealer,
          email: dealer.email || "",
          phone: dealer.phone || "",
          address: dealer.address || "",
          license_number: dealer.license_number || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createDealer:", error)
    throw error
  }
}

// Buyer operations
export async function getBuyers(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("buyers")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error in getBuyers:", error)
    throw error
  }
}

export async function createBuyer(buyer: Omit<Buyer, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("buyers")
      .insert([
        {
          ...buyer,
          email: buyer.email || "",
          phone: buyer.phone || "",
          address: buyer.address || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createBuyer:", error)
    throw error
  }
}

// File upload operations
export async function uploadFile(file: File, bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in uploadFile:", error)
    throw error
  }
}

export async function deleteFile(bucket: string, path: string) {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteFile:", error)
    throw error
  }
}

// Update the getFileUrl function to handle different bucket types
export function getFileUrl(bucket: string, path: string) {
  if (!path) return "/placeholder.svg"

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Database operations object for backwards compatibility
export const dbOperations = {
  testConnection,
  getClients,
  getClientByUsername,
  insertClient,
  updateClient,
  deleteClient,
  authenticateClient,
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getDealers,
  createDealer,
  getBuyers,
  createBuyer,
  uploadFile,
  deleteFile,
  getFileUrl,
}
