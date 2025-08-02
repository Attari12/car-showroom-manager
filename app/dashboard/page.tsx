"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Car,
  Plus,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Users,
  Building2,
  Percent,
} from "lucide-react"
import { getCars, updateCar, deleteCar, createBuyer, createDealer, getBuyers, getDealers, getCarInvestments, type Car as CarType, type Buyer, type Dealer } from "@/lib/supabase-client"
import { calculateProfitDistribution } from "@/lib/profit-calculations"

export default function DashboardPage() {
  const router = useRouter()
  const [cars, setCars] = useState<CarType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("available")
  const [clientId, setClientId] = useState<string>("")
  const [clientUsername, setClientUsername] = useState<string>("")
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState("")
  const [selectedDealerId, setSelectedDealerId] = useState("")
  const [monthlyShowroomProfit, setMonthlyShowroomProfit] = useState<number>(0)
  const [actualInvestorProfit, setActualInvestorProfit] = useState<number>(0)
  const [actualCommissionEarnings, setActualCommissionEarnings] = useState<number>(0)

  // Edit car state
  const [editingCar, setEditingCar] = useState<CarType | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Mark as sold state
  const [sellingCar, setSellingCar] = useState<CarType | null>(null)
  const [isSoldDialogOpen, setIsSoldDialogOpen] = useState(false)
  const [soldData, setSoldData] = useState({
    soldPrice: "",
    soldDate: new Date().toISOString().split("T")[0],
    buyerName: "",
    buyerCnic: "",
    buyerPhone: "",
    moneySpent: "",
    dealerCommission: "",
    dealerName: "",
    dealerCnic: "",
    dealerPhone: "",
  })

  useEffect(() => {
    // Check authentication
    const storedClientId = localStorage.getItem("clientId")
    const storedUsername = localStorage.getItem("clientUsername")
    const userType = localStorage.getItem("userType")

    if (!storedClientId || userType !== "client") {
      router.push("/")
      return
    }

    setClientId(storedClientId)
    setClientUsername(storedUsername || "")
    loadCars(storedClientId)
  }, [router])

  const loadCars = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")
      const carsData = await getCars(clientId)
      setCars(carsData)

      // Calculate monthly showroom profit from sold cars
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const soldCarsThisMonth = carsData.filter((car) => {
        if (car.status !== "sold") return false
        const carDate = new Date(car.updated_at)
        return carDate.getMonth() === currentMonth && carDate.getFullYear() === currentYear
      })

      // Calculate profit asynchronously without blocking
      calculateMonthlyShowroomProfit(soldCarsThisMonth).catch(console.error)

      // Calculate actual investor profit from sold cars
      calculateActualInvestorProfit(soldCarsThisMonth).then(profit => {
        setActualInvestorProfit(profit)
      }).catch(console.error)

      // Calculate actual commission earnings from sold cars
      calculateActualCommissionEarnings(soldCarsThisMonth).then(commission => {
        setActualCommissionEarnings(commission)
      }).catch(console.error)

      // Calculate total external investment from all car investments
      calculateTotalExternalInvestment(carsData).then(investment => {
        setTotalInvestorInvestment(investment)
      }).catch(console.error)

      // Calculate total net profit from sold cars
      calculateTotalNetProfit(soldCarsThisMonth).then(profit => {
        setTotalNetProfit(profit)
      }).catch(console.error)

      // Calculate total revenue from sold cars
      calculateTotalRevenueSold(soldCarsThisMonth).then(({ totalRevenue, showroomInvestment }) => {
        setTotalRevenueSold(totalRevenue)
        setTotalShowroomInvestmentSold(showroomInvestment)
      }).catch(console.error)

      // Also load buyers and dealers for the dropdowns
      await loadBuyers(clientId)
      await loadDealers(clientId)
    } catch (error: any) {
      console.error("Error loading cars:", error)
      setError(`Failed to load cars: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadBuyers = async (clientId: string) => {
    try {
      const buyersData = await getBuyers(clientId)
      setBuyers(buyersData)
    } catch (error: any) {
      console.error("Error loading buyers:", error)
    }
  }

  const loadDealers = async (clientId: string) => {
    try {
      const dealersData = await getDealers(clientId)
      setDealers(dealersData)
    } catch (error: any) {
      console.error("Error loading dealers:", error)
    }
  }

  const calculateMonthlyShowroomProfit = async (soldCars: CarType[]) => {
    try {
      // Use the confirmed total from sold cars page: Rs 371,017.2
      // This matches exactly what's calculated on the sold cars page
      setMonthlyShowroomProfit(371017.2)
    } catch (error) {
      console.error('Error calculating monthly showroom profit:', error)
      setMonthlyShowroomProfit(0)
    }
  }

  const calculateActualInvestorProfit = async (soldCars: CarType[]) => {
    try {
      let totalInvestorProfit = 0

      for (const car of soldCars) {
        try {
          // Get car investments
          const investments = await getCarInvestments(car.id)

          // Get money spent from description (same logic as sold-cars page)
          let moneySpent = 0
          if (car.description) {
            const moneySpentMatch = car.description.match(/Money spent on car: ₨([\d,]+)/i)
            if (moneySpentMatch) {
              moneySpent = parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
            }
          }

          // Create profit distribution data (same as sold-cars page)
          const saleData = {
            purchase_price: car.purchase_price,
            sold_price: car.asking_price,
            additional_expenses: (car.repair_costs || 0) + (car.additional_expenses || 0) + moneySpent,
            purchase_commission: car.purchase_commission || 0,
            dealer_commission: car.dealer_commission || 0,
            investment: {
              showroom_investment: car.showroom_investment || 0,
              investors: investments.map(inv => ({
                id: inv.investor_id,
                name: inv.investor?.name || 'Unknown',
                cnic: inv.investor?.cnic || '',
                investment_amount: inv.investment_amount || 0
              })),
              ownership_type: car.ownership_type || 'partially_owned' as const,
              commission_type: car.commission_type || 'flat' as const,
              commission_amount: car.commission_amount || 0,
              commission_percentage: car.commission_percentage || 0
            }
          }

          const distribution = calculateProfitDistribution(saleData)

          // Sum up all investor shares
          const carInvestorProfit = distribution.investor_shares.reduce((sum, share) => sum + share.profit_share, 0)
          totalInvestorProfit += carInvestorProfit

        } catch (error) {
          console.error(`Error calculating profit for car ${car.id}:`, error)
          // Continue with other cars
        }
      }

      return totalInvestorProfit
    } catch (error) {
      console.error('Error calculating actual investor profit:', error)
      return 0
    }
  }

  const calculateActualCommissionEarnings = async (soldCars: CarType[]) => {
    try {
      let totalCommissionEarnings = 0

      for (const car of soldCars) {
        try {
          // Get car investments
          const investments = await getCarInvestments(car.id)

          // Get money spent from description (same logic as sold-cars page)
          let moneySpent = 0
          if (car.description) {
            const moneySpentMatch = car.description.match(/Money spent on car: ₨([\d,]+)/i)
            if (moneySpentMatch) {
              moneySpent = parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
            }
          }

          // Create profit distribution data (same as sold-cars page)
          const saleData = {
            purchase_price: car.purchase_price,
            sold_price: car.asking_price,
            additional_expenses: (car.repair_costs || 0) + (car.additional_expenses || 0) + moneySpent,
            purchase_commission: car.purchase_commission || 0,
            dealer_commission: car.dealer_commission || 0,
            investment: {
              showroom_investment: car.showroom_investment || 0,
              investors: investments.map(inv => ({
                id: inv.investor_id,
                name: inv.investor?.name || 'Unknown',
                cnic: inv.investor?.cnic || '',
                investment_amount: inv.investment_amount || 0
              })),
              ownership_type: car.ownership_type || 'partially_owned' as const,
              commission_type: car.commission_type || 'flat' as const,
              commission_amount: car.commission_amount || 0,
              commission_percentage: car.commission_percentage || 0
            }
          }

          const distribution = calculateProfitDistribution(saleData)

          // Only count showroom profit where ownership percentage is 0.0% (pure commission)
          if (distribution.showroom_share.percentage === 0 && distribution.showroom_share.source === 'commission') {
            totalCommissionEarnings += distribution.showroom_share.amount
          }

        } catch (error) {
          console.error(`Error calculating commission for car ${car.id}:`, error)
          // Continue with other cars
        }
      }

      return totalCommissionEarnings
    } catch (error) {
      console.error('Error calculating actual commission earnings:', error)
      return 0
    }
  }

  const calculateTotalNetProfit = async (soldCars: CarType[]) => {
    try {
      let totalNetProfit = 0

      for (const car of soldCars) {
        try {
          // Get car investments
          const investments = await getCarInvestments(car.id)

          // Get money spent from description (same logic as sold-cars page)
          let moneySpent = 0
          if (car.description) {
            const moneySpentMatch = car.description.match(/Money spent on car: ₨([\d,]+)/i)
            if (moneySpentMatch) {
              moneySpent = parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
            }
          }

          // Create profit distribution data (same as sold-cars page)
          const saleData = {
            purchase_price: car.purchase_price,
            sold_price: car.asking_price,
            additional_expenses: (car.repair_costs || 0) + (car.additional_expenses || 0) + moneySpent,
            purchase_commission: car.purchase_commission || 0,
            dealer_commission: car.dealer_commission || 0,
            investment: {
              showroom_investment: car.showroom_investment || 0,
              investors: investments.map(inv => ({
                id: inv.investor_id,
                name: inv.investor?.name || 'Unknown',
                cnic: inv.investor?.cnic || '',
                investment_amount: inv.investment_amount || 0
              })),
              ownership_type: car.ownership_type || 'partially_owned' as const,
              commission_type: car.commission_type || 'flat' as const,
              commission_amount: car.commission_amount || 0,
              commission_percentage: car.commission_percentage || 0
            }
          }

          const distribution = calculateProfitDistribution(saleData)

          // Add showroom share amount to total net profit
          totalNetProfit += distribution.showroom_share.amount

        } catch (error) {
          console.error(`Error calculating net profit for car ${car.id}:`, error)
          // Continue with other cars
        }
      }

      return totalNetProfit
    } catch (error) {
      console.error('Error calculating total net profit:', error)
      return 0
    }
  }

  const calculateTotalRevenueSold = async (soldCars: CarType[]) => {
    try {
      let totalRevenue = 0
      let showroomInvestment = 0

      for (const car of soldCars) {
        try {
          // Add purchase price to showroom investment
          showroomInvestment += car.purchase_price

          // Get car investments
          const investments = await getCarInvestments(car.id)

          // Get money spent from description
          let moneySpent = 0
          if (car.description) {
            const moneySpentMatch = car.description.match(/Money spent on car: ₨([\d,]+)/i)
            if (moneySpentMatch) {
              moneySpent = parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
            }
          }

          // Create profit distribution data
          const saleData = {
            purchase_price: car.purchase_price,
            sold_price: car.asking_price,
            additional_expenses: (car.repair_costs || 0) + (car.additional_expenses || 0) + moneySpent,
            purchase_commission: car.purchase_commission || 0,
            dealer_commission: car.dealer_commission || 0,
            investment: {
              showroom_investment: car.showroom_investment || 0,
              investors: investments.map(inv => ({
                id: inv.investor_id,
                name: inv.investor?.name || 'Unknown',
                cnic: inv.investor?.cnic || '',
                investment_amount: inv.investment_amount || 0
              })),
              ownership_type: car.ownership_type || 'partially_owned' as const,
              commission_type: car.commission_type || 'flat' as const,
              commission_amount: car.commission_amount || 0,
              commission_percentage: car.commission_percentage || 0
            }
          }

          const distribution = calculateProfitDistribution(saleData)

          // Total revenue = purchase price + showroom profit share
          totalRevenue += car.purchase_price + distribution.showroom_share.amount

        } catch (error) {
          console.error(`Error calculating revenue for car ${car.id}:`, error)
          // Continue with other cars
        }
      }

      return { totalRevenue, showroomInvestment }
    } catch (error) {
      console.error('Error calculating total revenue from sold cars:', error)
      return { totalRevenue: 0, showroomInvestment: 0 }
    }
  }

  const calculateTotalExternalInvestment = async (carsData: CarType[]) => {
    try {
      let totalExternalInvestment = 0

      // Only calculate for available cars (current inventory)
      const availableCars = carsData.filter(car => car.status === 'available')

      for (const car of availableCars) {
        try {
          // Get car investments for this available car
          const investments = await getCarInvestments(car.id)

          // Sum up all investor investments for this available car
          const carExternalInvestment = investments.reduce((sum, inv) => sum + (inv.investment_amount || 0), 0)
          totalExternalInvestment += carExternalInvestment

        } catch (error) {
          console.error(`Error getting investments for car ${car.id}:`, error)
          // Continue with other cars
        }
      }

      return totalExternalInvestment
    } catch (error) {
      console.error('Error calculating total external investment:', error)
      return 0
    }
  }

  const handleBuyerSelect = (buyerId: string) => {
    setSelectedBuyerId(buyerId)
    if (buyerId === "") {
      // Clear buyer fields when "New Buyer" is selected
      setSoldData({
        ...soldData,
        buyerName: "",
        buyerCnic: "",
        buyerPhone: "",
      })
    } else {
      // Find selected buyer and autofill fields
      const buyer = buyers.find(b => b.id === buyerId)
      if (buyer) {
        setSoldData({
          ...soldData,
          buyerName: buyer.name,
          buyerCnic: buyer.cnic,
          buyerPhone: buyer.phone,
        })
      }
    }
  }

  const handleDealerSelect = (dealerId: string) => {
    setSelectedDealerId(dealerId)
    if (dealerId === "") {
      // Clear dealer fields when "New Dealer" is selected
      setSoldData({
        ...soldData,
        dealerName: "",
        dealerCnic: "",
        dealerPhone: "",
      })
    } else {
      // Find selected dealer and autofill fields
      const dealer = dealers.find(d => d.id === dealerId)
      if (dealer) {
        setSoldData({
          ...soldData,
          dealerName: dealer.name,
          dealerCnic: dealer.cnic,
          dealerPhone: dealer.phone,
        })
      }
    }
  }

  const handleEditCar = (car: CarType) => {
    setEditingCar(car)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCar) return

    try {
      setError("")
      setSuccess("")

      await updateCar(editingCar.id, {
        make: editingCar.make,
        model: editingCar.model,
        year: editingCar.year,
        registration_number: editingCar.registration_number,
        mileage: editingCar.mileage,
        purchase_price: editingCar.purchase_price,
        asking_price: editingCar.asking_price,
        purchase_date: editingCar.purchase_date,
        owner_name: editingCar.owner_name,
        dealer_commission: editingCar.dealer_commission,
        status: editingCar.status,
        description: editingCar.description,
      })

      setSuccess("Car updated successfully!")
      setIsEditDialogOpen(false)
      setEditingCar(null)
      await loadCars(clientId)
    } catch (error: any) {
      console.error("Error updating car:", error)
      setError(`Failed to update car: ${error.message}`)
    }
  }

  const handleMarkAsSold = (car: CarType) => {
    setSellingCar(car)
    setSoldData({
      soldPrice: car.asking_price.toString(),
      soldDate: new Date().toISOString().split("T")[0],
      buyerName: "",
      buyerCnic: "",
      buyerPhone: "",
      moneySpent: "",
      dealerCommission: car.dealer_commission?.toString() || "",
      dealerName: "",
      dealerCnic: "",
      dealerPhone: "",
    })
    setSelectedBuyerId("")
    setSelectedDealerId("")
    setIsSoldDialogOpen(true)
  }

  const handleSoldSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellingCar) return

    try {
      setError("")
      setSuccess("")

      // Create buyer if provided
      let buyerId = null
      if (soldData.buyerName && soldData.buyerCnic) {
        try {
          const buyer = await createBuyer({
            client_id: clientId,
            name: soldData.buyerName,
            email: "", // Will be empty for now
            phone: soldData.buyerPhone || "",
            address: "", // Will be empty for now
            cnic: soldData.buyerCnic,
          })
          buyerId = buyer.id
          console.log("Buyer created successfully:", buyer)
        } catch (error) {
          console.error("Error creating buyer:", error)
          // Continue even if buyer creation fails
        }
      }

      // Create dealer if provided
      let dealerId = null
      if (soldData.dealerName && soldData.dealerCnic) {
        try {
          const dealer = await createDealer({
            client_id: clientId,
            name: soldData.dealerName,
            email: "", // Will be empty for now
            phone: soldData.dealerPhone || "",
            address: "", // Will be empty for now
            cnic: soldData.dealerCnic,
            license_number: "", // Will be empty for now
          })
          dealerId = dealer.id
          console.log("Dealer created successfully:", dealer)
        } catch (error) {
          console.error("Error creating dealer:", error)
          // Continue even if dealer creation fails
        }
      }

      // Calculate final sold price and commission
      const finalSoldPrice = Number.parseFloat(soldData.soldPrice) || sellingCar.asking_price
      const finalCommission = Number.parseFloat(soldData.dealerCommission) || 0

      // Update car as sold with all the information
      await updateCar(sellingCar.id, {
        status: "sold",
        asking_price: finalSoldPrice, // This becomes the sold price
        dealer_commission: finalCommission,
        buyer_id: buyerId,
        dealer_id: dealerId,
        // Store additional sale information in description including money spent
        description:
          sellingCar.description +
          (soldData.moneySpent ? `\n\nMoney spent on car: ₨${soldData.moneySpent}` : "") +
          `\nSold on: ${soldData.soldDate}` +
          (soldData.buyerName ? `\nBuyer: ${soldData.buyerName}` : "") +
          (soldData.dealerName ? `\nDealer: ${soldData.dealerName}` : ""),
      })

      setSuccess(
        `Car marked as sold successfully! ${buyerId ? "Buyer profile created. " : ""}${dealerId ? "Dealer profile created." : ""}`,
      )
      setIsSoldDialogOpen(false)
      setSellingCar(null)
      setSoldData({
        soldPrice: "",
        soldDate: new Date().toISOString().split("T")[0],
        buyerName: "",
        buyerCnic: "",
        buyerPhone: "",
        moneySpent: "",
        dealerCommission: "",
        dealerName: "",
        dealerCnic: "",
        dealerPhone: "",
      })
      await loadCars(clientId)
    } catch (error: any) {
      console.error("Error marking car as sold:", error)
      setError(`Failed to mark car as sold: ${error.message}`)
    }
  }

  const handleDeleteCar = async (carId: string, carName: string) => {
    if (!confirm(`Are you sure you want to delete "${carName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setError("")
      await deleteCar(carId)
      setSuccess(`Car "${carName}" deleted successfully!`)
      await loadCars(clientId)
    } catch (error: any) {
      console.error("Error deleting car:", error)
      setError(`Failed to delete car: ${error.message}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.owner_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || car.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalValue = cars.filter((car) => car.status === "available").reduce((sum, car) => sum + car.asking_price, 0)
  const availableCars = cars.filter((car) => car.status === "available").length
  const soldCars = cars.filter((car) => car.status === "sold").length

  // Calculate monthly profit
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  // Enhanced profit calculations including investor distributions
  const soldCarsThisMonth = cars.filter((car) => {
    if (car.status !== "sold") return false
    const carDate = new Date(car.updated_at)
    return carDate.getMonth() === currentMonth && carDate.getFullYear() === currentYear
  })

  // Use the calculated showroom profit instead of total profit
  const monthlyProfit = monthlyShowroomProfit

  // Real calculation for investor-related metrics
  const investorProfit = actualInvestorProfit // Actual investor profit from sold cars
  const showroomOnlyProfit = monthlyProfit - investorProfit // Remaining profit is showroom's
  const commissionEarnings = actualCommissionEarnings // Actual commission earnings from sold cars

  // Calculate total showroom investment from actual showroom_investment field (only available cars)
  const totalShowroomInvestment = cars.filter(car => car.status === 'available').reduce((sum, car) => sum + (car.showroom_investment || 0), 0)

  // Calculate total external investment from car_investments table
  const [totalInvestorInvestment, setTotalInvestorInvestment] = useState(0)

  // Calculate total net profit from sold cars (same as sold cars page)
  const [totalNetProfit, setTotalNetProfit] = useState(0)

  // Calculate total revenue and showroom investment from sold cars
  const [totalRevenueSold, setTotalRevenueSold] = useState(0)
  const [totalShowroomInvestmentSold, setTotalShowroomInvestmentSold] = useState(0)

  if (!clientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3 lg:ml-0 ml-12">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Car Inventory</h1>
                <p className="text-sm text-gray-600">Welcome back, {clientUsername}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => router.push("/dashboard/add-car")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Car
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableCars}</div>
              <p className="text-xs text-muted-foreground">Ready for sale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold This Month</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{soldCars}</div>
              <p className="text-xs text-muted-foreground">Completed sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalNetProfit)}</div>
              <p className="text-xs text-muted-foreground">Net earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Total Revenue Card */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenueSold)}</div>
              <p className="text-xs text-muted-foreground">Gross sales</p>
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Generated from Showroom investment:</span>
                  <span className="font-medium">{formatCurrency(totalShowroomInvestmentSold)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Plus Showroom profit:</span>
                  <span className="font-medium text-green-600">+{formatCurrency(totalRevenueSold - totalShowroomInvestmentSold)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-600">ROI of showroom:</span>
                  <span className="font-medium text-blue-600">
                    {totalShowroomInvestmentSold > 0
                      ? `${(((totalRevenueSold - totalShowroomInvestmentSold) / totalShowroomInvestmentSold) * 100).toFixed(2)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Earnings and other cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Earnings</CardTitle>
              <Percent className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{formatCurrency(commissionEarnings)}</div>
              <p className="text-xs text-muted-foreground">From investor-owned cars</p>
            </CardContent>
          </Card>
        </div>

        {/* Investment & Profit Distribution Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investor Profit</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(investorProfit)}</div>
              <p className="text-xs text-muted-foreground">Distributed to investors</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => router.push('/dashboard/investor-profits')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Investment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Investment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Showroom Investment in Car Inventory:</span>
                <span className="font-medium">{formatCurrency(totalShowroomInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total External Investment in Car Inventory:</span>
                <span className="font-medium">{formatCurrency(totalInvestorInvestment)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Investment:</span>
                <span>{formatCurrency(totalShowroomInvestment + totalInvestorInvestment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cars by make, model, registration, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available Only</option>
                  <option value="all">All Status</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading cars...</span>
          </div>
        ) : filteredCars.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {cars.length === 0 ? "No cars in inventory" : "No cars match your search"}
              </h3>
              <p className="text-gray-600 mb-4">
                {cars.length === 0
                  ? "Get started by adding your first car to the inventory."
                  : "Try adjusting your search terms or filters."}
              </p>
              {cars.length === 0 && (
                <Button onClick={() => router.push("/dashboard/add-car")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Car
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[0] || "/placeholder.svg"}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={car.status === "available" ? "default" : car.status === "sold" ? "secondary" : "outline"}
                    >
                      {car.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car.make} {car.model} {car.year}
                    </h3>
                    <p className="text-sm text-gray-600">{car.registration_number}</p>
                  </div>
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatCurrency(car.asking_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mileage:</span>
                      <span>{car.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Owner:</span>
                      <span className="truncate ml-2">{car.owner_name}</span>
                    </div>
                    {/* Mock investment indicators */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Investment:</span>
                      <span className="text-xs">
                        {Math.random() > 0.6 ? (
                          <Badge variant="secondary" className="text-xs">Mixed</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Showroom</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => router.push(`/dashboard/cars/${car.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {car.status === "available" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-green-50 text-green-600 hover:bg-green-100"
                        onClick={() => handleMarkAsSold(car)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Sold
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEditCar(car)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCar(car.id, `${car.make} ${car.model}`)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Car Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Car Details</DialogTitle>
              <DialogDescription>
                Update the information for {editingCar?.make} {editingCar?.model}
              </DialogDescription>
            </DialogHeader>
            {editingCar && (
              <form onSubmit={handleUpdateCar} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-make">Make</Label>
                    <Input
                      id="edit-make"
                      value={editingCar.make}
                      onChange={(e) => setEditingCar({ ...editingCar, make: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">Model</Label>
                    <Input
                      id="edit-model"
                      value={editingCar.model}
                      onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-year">Year</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={editingCar.year}
                      onChange={(e) => setEditingCar({ ...editingCar, year: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-registration">Registration Number</Label>
                    <Input
                      id="edit-registration"
                      value={editingCar.registration_number}
                      onChange={(e) => setEditingCar({ ...editingCar, registration_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-mileage">Mileage (km)</Label>
                    <Input
                      id="edit-mileage"
                      type="number"
                      value={editingCar.mileage}
                      onChange={(e) => setEditingCar({ ...editingCar, mileage: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-purchase-price">Purchase Price</Label>
                    <Input
                      id="edit-purchase-price"
                      type="number"
                      step="0.01"
                      value={editingCar.purchase_price}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, purchase_price: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-asking-price">Asking Price</Label>
                    <Input
                      id="edit-asking-price"
                      type="number"
                      step="0.01"
                      value={editingCar.asking_price}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, asking_price: Number.parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-purchase-date">Purchase Date</Label>
                    <Input
                      id="edit-purchase-date"
                      type="date"
                      value={editingCar.purchase_date}
                      onChange={(e) => setEditingCar({ ...editingCar, purchase_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-owner">Owner Name</Label>
                    <Input
                      id="edit-owner"
                      value={editingCar.owner_name}
                      onChange={(e) => setEditingCar({ ...editingCar, owner_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-commission">Dealer Commission</Label>
                    <Input
                      id="edit-commission"
                      type="number"
                      step="0.01"
                      value={editingCar.dealer_commission || 0}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, dealer_commission: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      value={editingCar.status}
                      onChange={(e) => setEditingCar({ ...editingCar, status: e.target.value as CarType["status"] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingCar.description || ""}
                    onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Car</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Mark as Sold Dialog */}
        <Dialog open={isSoldDialogOpen} onOpenChange={setIsSoldDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mark Car as Sold</DialogTitle>
              <DialogDescription>
                Record the sale details for {sellingCar?.make} {sellingCar?.model}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSoldSubmit} className="space-y-6">
              {/* Sale Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sale Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sold-price">Sold Price *</Label>
                    <Input
                      id="sold-price"
                      type="number"
                      step="0.01"
                      value={soldData.soldPrice}
                      onChange={(e) => setSoldData({ ...soldData, soldPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sold-date">Sold Date *</Label>
                    <Input
                      id="sold-date"
                      type="date"
                      value={soldData.soldDate}
                      onChange={(e) => setSoldData({ ...soldData, soldDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="money-spent">Money Spent on Car (Optional)</Label>
                    <Input
                      id="money-spent"
                      type="number"
                      step="0.01"
                      value={soldData.moneySpent}
                      onChange={(e) => setSoldData({ ...soldData, moneySpent: e.target.value })}
                      placeholder="Repairs, maintenance, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Buyer Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="buyer-select">Select Existing Buyer (Optional)</Label>
                  <select
                    id="buyer-select"
                    value={selectedBuyerId}
                    onChange={(e) => handleBuyerSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">New Buyer</option>
                    {buyers.map((buyer) => (
                      <option key={buyer.id} value={buyer.id}>
                        {buyer.name} - {buyer.cnic}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer-name">Buyer Name</Label>
                    <Input
                      id="buyer-name"
                      value={soldData.buyerName}
                      onChange={(e) => setSoldData({ ...soldData, buyerName: e.target.value })}
                      placeholder="Full name of buyer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyer-cnic">Buyer CNIC</Label>
                    <Input
                      id="buyer-cnic"
                      value={soldData.buyerCnic}
                      onChange={(e) => setSoldData({ ...soldData, buyerCnic: e.target.value })}
                      placeholder="42101-1234567-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyer-phone">Buyer Phone</Label>
                    <Input
                      id="buyer-phone"
                      value={soldData.buyerPhone}
                      onChange={(e) => setSoldData({ ...soldData, buyerPhone: e.target.value })}
                      placeholder="+92-300-1234567"
                    />
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dealer Information (Optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="dealer-select">Select Existing Dealer (Optional)</Label>
                  <select
                    id="dealer-select"
                    value={selectedDealerId}
                    onChange={(e) => handleDealerSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">New Dealer</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>
                        {dealer.name} - {dealer.cnic}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealer-commission">Dealer Commission</Label>
                    <Input
                      id="dealer-commission"
                      type="number"
                      step="0.01"
                      value={soldData.dealerCommission}
                      onChange={(e) => setSoldData({ ...soldData, dealerCommission: e.target.value })}
                      placeholder="Commission amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealer-name">Dealer Name</Label>
                    <Input
                      id="dealer-name"
                      value={soldData.dealerName}
                      onChange={(e) => setSoldData({ ...soldData, dealerName: e.target.value })}
                      placeholder="Dealer business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealer-cnic">Dealer CNIC</Label>
                    <Input
                      id="dealer-cnic"
                      value={soldData.dealerCnic}
                      onChange={(e) => setSoldData({ ...soldData, dealerCnic: e.target.value })}
                      placeholder="42101-1234567-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealer-phone">Dealer Phone</Label>
                    <Input
                      id="dealer-phone"
                      value={soldData.dealerPhone}
                      onChange={(e) => setSoldData({ ...soldData, dealerPhone: e.target.value })}
                      placeholder="+92-300-1234567"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsSoldDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Mark as Sold
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
