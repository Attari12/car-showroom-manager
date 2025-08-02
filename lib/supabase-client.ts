import { createClient } from "@supabase/supabase-js"
import { calculateProfitDistribution } from "./profit-calculations"

// Environment variables - replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://saicjjshmgwsitmwvomj.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaWNqanNobWd3c2l0bXd2b21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzM4OTQsImV4cCI6MjA2OTMwOTg5NH0.DjDOkzdTmRPM7aC-E8xvYT61jPzk2eSmSedzy1qr-4c"

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration')
}

// Create Supabase client with enhanced options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable session persistence to avoid client-side issues
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

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
  color: string
  condition: string
  mileage: number
  purchase_price: number
  asking_price: number
  purchase_date: string
  owner_name: string
  purchase_commission?: number
  dealer_commission?: number
  repair_costs?: number
  additional_expenses?: number
  status: "available" | "sold" | "reserved" | "pending"
  description?: string
  images?: string[]
  documents?: string[]
  dealer_id?: string
  buyer_id?: string
  seller_id?: string
  // Investment tracking fields
  showroom_investment: number
  ownership_type: "partially_owned" | "fully_investor_owned"
  commission_type: "flat" | "percentage"
  commission_amount: number
  commission_percentage: number
  investors?: Array<{
    id?: string
    name: string
    cnic: string
    investment_amount: number
  }>
  auction_sheet?: {
    trunk: boolean
    pillars: boolean
    hood: boolean
    roof: boolean
    frontLeftDoor: boolean
    frontRightDoor: boolean
    backLeftDoor: boolean
    backRightDoor: boolean
    frontRightFender: boolean
    frontLeftFender: boolean
    backRightFender: boolean
    backLeftFender: boolean
  } | null
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

export interface Investor {
  id: string
  client_id: string
  name: string
  email?: string
  phone: string
  address?: string
  cnic: string
  total_investment: number
  total_profit: number
  active_investments: number
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  client_id: string
  name: string
  email?: string
  phone: string
  address?: string
  cnic: string
  total_cars_sold: number
  total_amount_paid: number
  last_sale_date?: string
  created_at: string
  updated_at: string
}

export interface CarInvestment {
  id: string
  car_id: string
  investor_id: string
  investment_amount: number
  ownership_percentage: number
  profit_earned: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SellerDebt {
  id: string
  client_id: string
  seller_id: string
  amount: number
  type: "owed_to_client" | "owed_by_client"
  description: string
  documents?: string[]
  is_settled: boolean
  settled_date?: string
  settled_amount?: number
  created_at: string
  updated_at: string
}

export interface InvestorDebt {
  id: string
  client_id: string
  investor_id: string
  amount: number
  type: "owed_to_client" | "owed_by_client"
  description: string
  documents?: string[]
  is_settled: boolean
  settled_date?: string
  settled_amount?: number
  created_at: string
  updated_at: string
}

// Enhanced connection test with retries
export async function testConnection(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Testing database connection (attempt ${attempt}/${retries})...`)

      // Create a promise that will timeout after 10 seconds (increased)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      })

      // Test the connection by trying to select from clients table
      const connectionPromise = supabase.from("clients").select("id").limit(1)

      const { data, error } = await Promise.race([connectionPromise, timeoutPromise])

      if (error) {
        console.error(`Connection test failed (attempt ${attempt}):`, error)
        if (attempt === retries) {
          return { success: false, error: error.message }
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }

      console.log("Database connection successful")
      return { success: true, data }
    } catch (error: any) {
      console.error(`Connection test error (attempt ${attempt}):`, error)
      if (attempt === retries) {
        return { success: false, error: error.message || "Connection failed" }
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  return { success: false, error: "Connection failed after retries" }
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
    if (!clientId) {
      throw new Error('Client ID is required')
    }

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to get cars: ${error.message || error.details || 'Database connection error'}`)
    }

    // Extract auction_sheet data from description field
    const carsWithParsedAuctionSheet = (data || []).map(car => {
      let auctionSheet = null
      let cleanDescription = car.description || ""

      // Extract auction sheet data from description
      const auctionMatch = cleanDescription.match(/\[AUCTION_SHEET\](.*?)\[\/AUCTION_SHEET\]/s)
      if (auctionMatch) {
        try {
          auctionSheet = JSON.parse(auctionMatch[1])
          // Remove auction sheet data from description
          cleanDescription = cleanDescription.replace(/\[AUCTION_SHEET\].*?\[\/AUCTION_SHEET\]/s, "").trim()
        } catch (e) {
          console.warn("Failed to parse auction sheet data:", e)
        }
      }

      return {
        ...car,
        description: cleanDescription,
        auction_sheet: auctionSheet
      }
    })

    return carsWithParsedAuctionSheet
  } catch (error: any) {
    console.error("Error in getCars:", error)
    throw new Error(`Failed to load cars: ${error.message || 'Database connection error'}`)
  }
}

export async function getCarById(id: string) {
  try {
    const { data, error } = await supabase.from("cars").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    // Extract auction_sheet data from description field
    let auctionSheet = null
    let cleanDescription = data.description || ""

    // Extract auction sheet data from description
    const auctionMatch = cleanDescription.match(/\[AUCTION_SHEET\](.*?)\[\/AUCTION_SHEET\]/s)
    if (auctionMatch) {
      try {
        auctionSheet = JSON.parse(auctionMatch[1])
        // Remove auction sheet data from description
        cleanDescription = cleanDescription.replace(/\[AUCTION_SHEET\].*?\[\/AUCTION_SHEET\]/s, "").trim()
      } catch (e) {
        console.warn("Failed to parse auction sheet data:", e)
      }
    }

    const carWithParsedAuctionSheet = {
      ...data,
      description: cleanDescription,
      auction_sheet: auctionSheet
    }

    return carWithParsedAuctionSheet
  } catch (error) {
    console.error("Error in getCarById:", error)
    throw error
  }
}

export async function createCar(car: Omit<Car, "id" | "created_at" | "updated_at">) {
  try {
    // Prepare the car data for database insertion
    // Store auction_sheet data in the description field as structured data
    let enhancedDescription = car.description || ""

    if (car.auction_sheet) {
      const auctionData = `[AUCTION_SHEET]${JSON.stringify(car.auction_sheet)}[/AUCTION_SHEET]`
      enhancedDescription = enhancedDescription ? `${enhancedDescription}\n\n${auctionData}` : auctionData
    }

    const carData = {
      ...car,
      images: car.images || [],
      documents: car.documents || [],
      description: enhancedDescription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Remove auction_sheet from the data being sent to database
    delete carData.auction_sheet

    console.log("Attempting to create car with data:", carData)

    const { data, error } = await supabase
      .from("cars")
      .insert([carData])
      .select()

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Car created successfully:", data)

    // Update seller statistics if seller_id is provided
    const createdCar = Array.isArray(data) ? data[0] : data
    if (createdCar && car.seller_id && car.purchase_price) {
      try {
        // Get current seller data
        const seller = await getSellerById(car.seller_id)

        // Calculate new statistics
        const newTotalCarsSold = seller.total_cars_sold + 1
        const newTotalAmountPaid = seller.total_amount_paid + car.purchase_price
        const currentDate = new Date().toISOString().split('T')[0]

        // Update seller statistics
        await updateSeller(car.seller_id, {
          total_cars_sold: newTotalCarsSold,
          total_amount_paid: newTotalAmountPaid,
          last_sale_date: currentDate
        })

        console.log(`Updated seller statistics for seller ${car.seller_id}: ${newTotalCarsSold} cars, ₨${newTotalAmountPaid} total`)
      } catch (sellerError) {
        console.error("Error updating seller statistics:", sellerError)
        // Don't throw error - car creation was successful, seller stats update failed
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in createCar:", error)
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

export async function updateCar(id: string, updates: Partial<Car>) {
  try {
    // Get current car data before updating
    const currentCar = await getCarById(id)

    // Handle auction_sheet updates by embedding in description
    let finalUpdates = { ...updates }

    if (updates.auction_sheet !== undefined) {
      let enhancedDescription = updates.description !== undefined ? updates.description : (currentCar.description || "")

      // Remove any existing auction sheet data
      enhancedDescription = enhancedDescription.replace(/\[AUCTION_SHEET\].*?\[\/AUCTION_SHEET\]/s, "").trim()

      // Add new auction sheet data if provided
      if (updates.auction_sheet) {
        const auctionData = `[AUCTION_SHEET]${JSON.stringify(updates.auction_sheet)}[/AUCTION_SHEET]`
        enhancedDescription = enhancedDescription ? `${enhancedDescription}\n\n${auctionData}` : auctionData
      }

      finalUpdates = {
        ...updates,
        description: enhancedDescription,
        updated_at: new Date().toISOString(),
      }

      // Remove auction_sheet from database updates
      delete finalUpdates.auction_sheet
    } else {
      finalUpdates.updated_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("cars")
      .update(finalUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        finalUpdates
      })
      throw new Error(`Database error: ${error.message}`)
    }



    // Extract auction_sheet data from description field before returning
    let auctionSheet = null
    let cleanDescription = data.description || ""

    const auctionMatch = cleanDescription.match(/\[AUCTION_SHEET\](.*?)\[\/AUCTION_SHEET\]/s)
    if (auctionMatch) {
      try {
        auctionSheet = JSON.parse(auctionMatch[1])
        cleanDescription = cleanDescription.replace(/\[AUCTION_SHEET\].*?\[\/AUCTION_SHEET\]/s, "").trim()
      } catch (e) {
        console.warn("Failed to parse auction sheet data:", e)
      }
    }

    return {
      ...data,
      description: cleanDescription,
      auction_sheet: auctionSheet
    }
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

// Investor operations
export async function getInvestors(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error in getInvestors:", error)
    throw error
  }
}

export async function getInvestorById(id: string) {
  try {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getInvestorById:", error)
    throw error
  }
}

export async function createInvestor(investor: Omit<Investor, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("investors")
      .insert([
        {
          ...investor,
          email: investor.email || "",
          address: investor.address || "",
          total_investment: 0,
          total_profit: 0,
          active_investments: 0,
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
    console.error("Error in createInvestor:", error)
    throw error
  }
}

export async function updateInvestor(id: string, updates: Partial<Investor>) {
  try {
    const { data, error } = await supabase
      .from("investors")
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
    console.error("Error in updateInvestor:", error)
    throw error
  }
}

export async function deleteInvestor(id: string) {
  try {
    const { error } = await supabase.from("investors").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteInvestor:", error)
    throw error
  }
}

export async function recalculateInvestorProfits(clientId: string) {
  try {
    // Get all investors for this client
    const investors = await getInvestors(clientId)

    // Get all sold cars with their profit distributions (same as sold cars page)
    const allCars = await getCars(clientId)
    const soldCars = allCars.filter(car => car.status === 'sold')

    console.log(`\n=== FETCHING PROFIT DATA FROM SOLD CARS ===`)
    console.log(`Found ${soldCars.length} sold cars to process`)

    // For each investor, fetch their profit data directly from sold cars
    for (const investor of investors) {
      let totalInvestment = 0
      let totalProfit = 0
      let activeInvestments = 0

      console.log(`\n=== PROCESSING INVESTOR: ${investor.name} ===`)

      // Get all investments for this investor
      const investments = await getInvestmentsByInvestorId(investor.id)
      console.log(`Found ${investments.length} investments for ${investor.name}`)

      for (const investment of investments) {
        if (!investment.car) continue

        console.log(`\nProcessing car: ${investment.car.make} ${investment.car.model} ${investment.car.year}`)
        console.log(`  Status: ${investment.car.status}`)
        console.log(`  Investment: Rs ${investment.investment_amount}`)

        // Add to total investment
        totalInvestment += investment.investment_amount

        // Check if car is active
        if (investment.car.status !== 'sold') {
          activeInvestments++
          console.log(`  -> Active car, no profit calculated`)
        } else {
          // Car is sold - get profit data from sold cars calculation (same as sold cars page)
          const soldCar = soldCars.find(car => car.id === investment.car.id)
          if (soldCar) {
            try {
              // Get car investments for profit distribution calculation
              const carInvestments = await getCarInvestments(soldCar.id)

              // Get money spent from description (same as sold cars page)
              let moneySpent = 0
              if (soldCar.description) {
                const moneySpentMatch = soldCar.description.match(/Money spent on car: ₨([\d,]+)/i)
                if (moneySpentMatch) {
                  moneySpent = parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
                }
              }

              // Use the same profit distribution logic as sold cars page

              const saleData = {
                purchase_price: soldCar.purchase_price,
                sold_price: soldCar.asking_price,
                additional_expenses: (soldCar.repair_costs || 0) + (soldCar.additional_expenses || 0) + moneySpent,
                purchase_commission: soldCar.purchase_commission || 0,
                dealer_commission: soldCar.dealer_commission || 0,
                investment: {
                  showroom_investment: soldCar.showroom_investment || 0,
                  investors: carInvestments.map(inv => ({
                    id: inv.investor_id,
                    name: inv.investor?.name || 'Unknown',
                    cnic: inv.investor?.cnic || '',
                    investment_amount: inv.investment_amount || 0
                  })),
                  ownership_type: soldCar.ownership_type || 'partially_owned' as const,
                  commission_type: soldCar.commission_type || 'flat' as const,
                  commission_amount: soldCar.commission_amount || 0,
                  commission_percentage: soldCar.commission_percentage || 0
                }
              }

              const distribution = calculateProfitDistribution(saleData)

              // Find this investor's share in the distribution
              const investorShare = distribution.investor_shares.find(
                share => share.investor_id === investor.id || share.investor_name === investor.name
              )

              if (investorShare) {
                totalProfit += investorShare.profit_share
                console.log(`  -> Found profit share: Rs ${investorShare.profit_share} (${investorShare.ownership_percentage.toFixed(1)}%)`)
              } else {
                console.log(`  -> No profit share found for ${investor.name}`)
              }
            } catch (error) {
              console.warn(`Could not get profit for car ${soldCar.id}:`, error)
            }
          }
        }
      }

      console.log(`\n=== FINAL TOTALS FOR ${investor.name} ===`)
      console.log(`Total Investment: Rs ${totalInvestment}`)
      console.log(`Total Profit: Rs ${totalProfit}`)
      console.log(`Active Investments: ${activeInvestments}`)

      // Update investor with calculated values
      await updateInvestor(investor.id, {
        total_investment: totalInvestment,
        total_profit: totalProfit,
        active_investments: activeInvestments,
      })

      console.log(`✓ Updated investor ${investor.name} in database`)
    }

    return { success: true, message: "Investor profits updated from sold cars data" }
  } catch (error: any) {
    console.error("Error recalculating investor profits:", error)
    throw error
  }
}

// Seller operations
export async function getSellers(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error in getSellers:", error)
    throw error
  }
}

export async function getSellerById(id: string) {
  try {
    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in getSellerById:", error)
    throw error
  }
}

export async function createSeller(seller: Omit<Seller, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("sellers")
      .insert([
        {
          ...seller,
          email: seller.email || "",
          address: seller.address || "",
          total_cars_sold: 0,
          total_amount_paid: 0,
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
    console.error("Error in createSeller:", error)
    throw error
  }
}

export async function updateSeller(id: string, updates: Partial<Seller>) {
  try {
    const { data, error } = await supabase
      .from("sellers")
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
    console.error("Error in updateSeller:", error)
    throw error
  }
}

export async function deleteSeller(id: string) {
  try {
    const { error } = await supabase.from("sellers").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteSeller:", error)
    throw error
  }
}

export async function getCarsBySellerId(sellerId: string) {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error in getCarsBySellerId:", JSON.stringify(error, null, 2))
      throw new Error(`Failed to get cars by seller: ${error.message || JSON.stringify(error)}`)
    }
    return data || []
  } catch (error: any) {
    console.error("Error in getCarsBySellerId:", error?.message || error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to get cars by seller: ${error}`)
  }
}

export async function getSoldCarsByCarIds(carIds: string[]) {
  try {
    if (carIds.length === 0) return []

    const { data, error } = await supabase
      .from("sold_cars")
      .select("*")
      .in("car_id", carIds)

    if (error) {
      // If table doesn't exist, just warn and return empty array (this is expected)
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.info("sold_cars table not set up yet - continuing without sold car data")
        return []
      }

      // For other errors, log as error and throw
      console.error("Supabase error in getSoldCarsByCarIds:", JSON.stringify(error, null, 2))
      throw new Error(`Failed to get sold cars: ${error.message || JSON.stringify(error)}`)
    }
    return data || []
  } catch (error: any) {
    // If it's a "table doesn't exist" error, just return empty array quietly
    if (error?.message?.includes('does not exist') || error?.code === '42P01') {
      console.info("sold_cars table not set up yet - continuing without sold car data")
      return []
    }

    // For other errors, log and throw
    console.error("Error in getSoldCarsByCarIds:", error?.message || error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to get sold cars: ${error}`)
  }
}

// Car Investment operations with enhanced error handling
export async function getCarInvestments(carId: string, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from("car_investments")
        .select(`
          *,
          investor:investors(*)
        `)
        .eq("car_id", carId)

      if (error) {
        console.warn(`Supabase error in getCarInvestments (attempt ${attempt}):`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          carId
        })

        // If table doesn't exist, return empty array immediately
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          console.info('car_investments table does not exist yet - returning empty investments')
          return []
        }

        // For network/connection errors, retry
        if (attempt < retries && (error.message?.includes('Failed to fetch') || error.message?.includes('network') || error.code === 'ECONNRESET')) {
          console.warn(`Network error on attempt ${attempt}, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }

        throw new Error(`Failed to get car investments: ${error.message || 'Unknown error'}`)
      }
      return data || []
    } catch (error: any) {
      console.warn(`Error in getCarInvestments (attempt ${attempt}):`, {
        message: error?.message || String(error),
        stack: error?.stack,
        carId
      })

      // If it's a "table doesn't exist" error, return empty array immediately
      if (error?.message?.includes('does not exist') || error?.code === '42P01' || error?.code === 'PGRST116') {
        console.info('car_investments table does not exist yet - returning empty investments')
        return []
      }

      // For network errors, retry
      if (attempt < retries && (error?.message?.includes('Failed to fetch') || error?.message?.includes('TypeError: Failed to fetch') || error?.name === 'TypeError')) {
        console.warn(`Network error on attempt ${attempt}, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }

      // Last attempt or non-retryable error
      if (attempt === retries) {
        console.error(`Failed to get car investments after ${retries} attempts, returning empty array`)
        return [] // Return empty array instead of throwing to prevent cascade failures
      }
    }
  }

  // Fallback return
  return []
}

export async function getInvestmentsByInvestorId(investorId: string) {
  try {
    const { data, error } = await supabase
      .from("car_investments")
      .select(`
        *,
        car:cars(
          id,
          make,
          model,
          year,
          registration_number,
          purchase_price,
          asking_price,
          status,
          purchase_date,
          created_at
        )
      `)
      .eq("investor_id", investorId)
      .order("created_at", { ascending: false })

    if (error) {
      // If car_investments table doesn't exist, return empty array
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.info("car_investments table not set up yet - returning empty investments")
        return []
      }

      console.error("Supabase error in getInvestmentsByInvestorId:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to get investments by investor: ${error.message || 'Unknown error'}`)
    }
    return data || []
  } catch (error: any) {
    // If it's a "table doesn't exist" error, return empty array
    if (error?.message?.includes('does not exist') || error?.code === '42P01') {
      console.info("car_investments table not set up yet - returning empty investments")
      return []
    }

    console.error("Error in getInvestmentsByInvestorId:", {
      message: error?.message || error,
      stack: error?.stack
    })
    throw new Error(`Failed to get investments by investor: ${error?.message || error}`)
  }
}

export async function createCarInvestment(investment: Omit<CarInvestment, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("car_investments")
      .insert([
        {
          ...investment,
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

    // Update investor statistics
    if (data && investment.investor_id && investment.investment_amount > 0) {
      try {
        // Get current investor data
        const investor = await getInvestorById(investment.investor_id)

        // Calculate new statistics
        const newTotalInvestment = investor.total_investment + investment.investment_amount
        const newActiveInvestments = investor.active_investments + 1

        // Update investor statistics
        await updateInvestor(investment.investor_id, {
          total_investment: newTotalInvestment,
          active_investments: newActiveInvestments
        })

        console.log(`Updated investor statistics for investor ${investment.investor_id}: ₨${newTotalInvestment} total, ${newActiveInvestments} active`)
      } catch (investorError) {
        console.error("Error updating investor statistics:", investorError)
        // Don't throw error - investment creation was successful, stats update failed
      }
    }

    return data
  } catch (error) {
    console.error("Error in createCarInvestment:", error)
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

// Dealer Debt operations
export async function getDealerDebts(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("dealer_debts")
      .select(`
        *,
        dealer:dealers(name, cnic, phone)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error.message || error)
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('dealer_debts table does not exist yet. Returning empty array.')
        return []
      }
      throw new Error(`Failed to get dealer debts: ${error.message || 'Unknown error'}`)
    }
    return data || []
  } catch (error) {
    console.error("Error in getDealerDebts:", error)
    if (error instanceof Error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('dealer_debts table does not exist yet. Returning empty array.')
        return []
      }
      throw error
    }
    throw new Error(`Failed to get dealer debts: ${error}`)
  }
}

// Seller Debt operations
export async function getSellerDebts(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("seller_debts")
      .select(`
        *,
        seller:sellers(name, cnic, phone)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error.message || error)
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('seller_debts table does not exist yet. Returning empty array.')
        return []
      }
      throw new Error(`Failed to get seller debts: ${error.message || 'Unknown error'}`)
    }
    return data || []
  } catch (error) {
    console.error("Error in getSellerDebts:", error)
    if (error instanceof Error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('seller_debts table does not exist yet. Returning empty array.')
        return []
      }
      throw error
    }
    throw new Error(`Failed to get seller debts: ${error}`)
  }
}

export async function createSellerDebt(debt: Omit<SellerDebt, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("seller_debts")
      .insert([
        {
          ...debt,
          documents: debt.documents || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error.message || error)
      // If table doesn't exist, provide helpful error
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        throw new Error('Seller debts table does not exist. Please contact administrator to set up debt management tables.')
      }
      throw new Error(`Failed to create seller debt: ${error.message || 'Unknown error'}`)
    }
    return data
  } catch (error) {
    console.error("Error in createSellerDebt:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to create seller debt: ${error}`)
  }
}

export async function settleSellerDebt(id: string, updates: Partial<SellerDebt>) {
  try {
    const { data, error } = await supabase
      .from("seller_debts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error.message || error)
      throw new Error(`Failed to settle seller debt: ${error.message || 'Unknown error'}`)
    }
    return data
  } catch (error) {
    console.error("Error in settleSellerDebt:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to settle seller debt: ${error}`)
  }
}

export async function deleteSellerDebt(id: string) {
  try {
    const { error } = await supabase.from("seller_debts").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error.message || error)
      throw new Error(`Failed to delete seller debt: ${error.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error("Error in deleteSellerDebt:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to delete seller debt: ${error}`)
  }
}

// Investor Debt operations
export async function getInvestorDebts(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("investor_debts")
      .select(`
        *,
        investor:investors(name, cnic, phone)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error.message || error)
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('investor_debts table does not exist yet. Returning empty array.')
        return []
      }
      throw new Error(`Failed to get investor debts: ${error.message || 'Unknown error'}`)
    }
    return data || []
  } catch (error) {
    console.error("Error in getInvestorDebts:", error)
    if (error instanceof Error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn('investor_debts table does not exist yet. Returning empty array.')
        return []
      }
      throw error
    }
    throw new Error(`Failed to get investor debts: ${error}`)
  }
}

export async function createInvestorDebt(debt: Omit<InvestorDebt, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("investor_debts")
      .insert([
        {
          ...debt,
          documents: debt.documents || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error.message || error)
      // If table doesn't exist, provide helpful error
      if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        throw new Error('Investor debts table does not exist. Please contact administrator to set up debt management tables.')
      }
      throw new Error(`Failed to create investor debt: ${error.message || 'Unknown error'}`)
    }
    return data
  } catch (error) {
    console.error("Error in createInvestorDebt:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to create investor debt: ${error}`)
  }
}

export async function settleInvestorDebt(id: string, updates: Partial<InvestorDebt>) {
  try {
    const { data, error } = await supabase
      .from("investor_debts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error.message || error)
      throw new Error(`Failed to settle investor debt: ${error.message || 'Unknown error'}`)
    }
    return data
  } catch (error) {
    console.error("Error in settleInvestorDebt:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to settle investor debt: ${error}`)
  }
}

export async function deleteInvestorDebt(id: string) {
  try {
    const { error } = await supabase.from("investor_debts").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error.message || error)
      throw new Error(`Failed to delete investor debt: ${error.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error("Error in deleteInvestorDebt:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to delete investor debt: ${error}`)
  }
}

// Update the getFileUrl function to handle different bucket types
export function getFileUrl(bucket: string, path: string) {
  if (!path) return "/placeholder.svg"

  // If the path is already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Check if debt tables exist
export async function checkDebtTablesExist() {
  const results = {
    seller_debts: false,
    investor_debts: false,
    buyer_debts: false,
    dealer_debts: false,
  }

  try {
    // Test seller_debts
    const { error: sellerError } = await supabase.from('seller_debts').select('id').limit(1)
    results.seller_debts = !sellerError

    // Test investor_debts
    const { error: investorError } = await supabase.from('investor_debts').select('id').limit(1)
    results.investor_debts = !investorError

    // Test buyer_debts
    const { error: buyerError } = await supabase.from('buyer_debts').select('id').limit(1)
    results.buyer_debts = !buyerError

    // Test dealer_debts
    const { error: dealerError } = await supabase.from('dealer_debts').select('id').limit(1)
    results.dealer_debts = !dealerError

  } catch (error) {
    console.error('Error checking debt table existence:', error)
  }

  return results
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
  getInvestors,
  getInvestorById,
  createInvestor,
  updateInvestor,
  deleteInvestor,
  getSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller,
  getCarInvestments,
  getInvestmentsByInvestorId,
  createCarInvestment,
  uploadFile,
  deleteFile,
  getFileUrl,
}
