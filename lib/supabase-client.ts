import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage helper functions
export const storageOperations = {
  // Upload car image
  async uploadCarImage(file: File, carId: string): Promise<{ data: any; error: any }> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${carId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage.from("car-showroom-files").upload(`car-images/${fileName}`, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) return { data: null, error }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("car-showroom-files").getPublicUrl(`car-images/${fileName}`)

    return { data: { ...data, publicUrl }, error: null }
  },

  // Upload car document
  async uploadCarDocument(file: File, carId: string): Promise<{ data: any; error: any }> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${carId}/${Date.now()}_${file.name}`

    const { data, error } = await supabase.storage
      .from("car-showroom-files")
      .upload(`car-documents/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) return { data: null, error }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("car-showroom-files").getPublicUrl(`car-documents/${fileName}`)

    return { data: { ...data, publicUrl }, error: null }
  },

  // Upload debt document
  async uploadDebtDocument(file: File, debtId: string): Promise<{ data: any; error: any }> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${debtId}/${Date.now()}_${file.name}`

    const { data, error } = await supabase.storage
      .from("car-showroom-files")
      .upload(`debt-documents/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) return { data: null, error }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("car-showroom-files").getPublicUrl(`debt-documents/${fileName}`)

    return { data: { ...data, publicUrl }, error: null }
  },

  // Delete file
  async deleteFile(filePath: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage.from("car-showroom-files").remove([filePath])

    return { data, error }
  },

  // List files in a folder
  async listFiles(folder: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage.from("car-showroom-files").list(folder, {
      limit: 100,
      offset: 0,
    })

    return { data, error }
  },
}

// Helper functions for database operations
export const dbOperations = {
  // Client operations
  async getClients() {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
    return { data, error }
  },

  async createClient(clientData: any) {
    const { data, error } = await supabase.from("clients").insert([clientData]).select()
    return { data, error }
  },

  // Car operations
  async getCars(clientId: string) {
    const { data, error } = await supabase
      .from("cars")
      .select(`
        *,
        car_images(*),
        car_documents(*),
        car_conditions(*)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async createCar(carData: any) {
    const { data, error } = await supabase.from("cars").insert([carData]).select()
    return { data, error }
  },

  async updateCar(carId: string, updates: any) {
    const { data, error } = await supabase.from("cars").update(updates).eq("id", carId).select()
    return { data, error }
  },

  // Car image operations
  async addCarImage(imageData: any) {
    const { data, error } = await supabase.from("car_images").insert([imageData]).select()
    return { data, error }
  },

  async addCarDocument(documentData: any) {
    const { data, error } = await supabase.from("car_documents").insert([documentData]).select()
    return { data, error }
  },

  // Dealer operations
  async getDealers(clientId: string) {
    const { data, error } = await supabase
      .from("dealers")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async createDealer(dealerData: any) {
    const { data, error } = await supabase.from("dealers").insert([dealerData]).select()
    return { data, error }
  },

  // Buyer operations
  async getBuyers(clientId: string) {
    const { data, error } = await supabase
      .from("buyers")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async createBuyer(buyerData: any) {
    const { data, error } = await supabase.from("buyers").insert([buyerData]).select()
    return { data, error }
  },

  // Debt operations
  async getDebts(clientId: string) {
    const { data, error } = await supabase
      .from("debts")
      .select(`
        *,
        dealers(name, cnic),
        buyers(name, cnic)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
    return { data, error }
  },

  async createDebt(debtData: any) {
    const { data, error } = await supabase.from("debts").insert([debtData]).select()
    return { data, error }
  },

  async settleDebt(debtId: string, settlementData: any) {
    const { data, error } = await supabase
      .from("debts")
      .update({
        is_settled: true,
        settled_at: new Date().toISOString(),
        ...settlementData,
      })
      .eq("id", debtId)
      .select()
    return { data, error }
  },
}
