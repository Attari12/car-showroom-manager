"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, DollarSign, TrendingUp, Search, Eye, AlertCircle, Calendar } from "lucide-react"
import { getCars, getCarInvestments, type Car as CarType } from "@/lib/supabase-client"
import { calculateProfitDistribution, calculateBaseProfit, type CarSaleData, type CarInvestment as CarInvestmentType } from "@/lib/profit-calculations"

export default function SoldCarsPage() {
  const [cars, setCars] = useState<CarType[]>([])
  const [carInvestments, setCarInvestments] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [clientId, setClientId] = useState<string>("")

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId")
    const userType = localStorage.getItem("userType")

    if (!storedClientId || userType !== "client") {
      window.location.href = "/"
      return
    }

    setClientId(storedClientId)
    loadSoldCars(storedClientId)
  }, [])

  const loadSoldCars = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")
      const carsData = await getCars(clientId)
      // Filter only sold cars
      const soldCars = carsData.filter((car) => car.status === "sold")
      setCars(soldCars)

      // Load investment data for each sold car
      const investmentData: Record<string, any[]> = {}
      for (const car of soldCars) {
        try {
          const investments = await getCarInvestments(car.id)
          investmentData[car.id] = investments
        } catch (error) {
          console.error(`Error loading investments for car ${car.id}:`, error)
          investmentData[car.id] = []
        }
      }
      setCarInvestments(investmentData)
    } catch (error: any) {
      console.error("Error loading sold cars:", error)
      setError(`Failed to load sold cars: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getMoneySpent = (car: CarType) => {
    if (car.description) {
      const moneySpentMatch = car.description.match(/Money spent on car: ₨([\d,]+)/i)
      if (moneySpentMatch) {
        return parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
      }
    }
    return 0
  }

  const calculateProfit = (car: CarType) => {
    // Simple profit calculation (keeping for backward compatibility)
    const moneySpent = getMoneySpent(car)
    return car.asking_price - car.purchase_price - (car.purchase_commission || 0) - (car.dealer_commission || 0) - (car.repair_costs || 0) - (car.additional_expenses || 0) - moneySpent
  }

  const calculateProfitMargin = (car: CarType) => {
    const profit = calculateProfit(car)
    return ((profit / car.asking_price) * 100).toFixed(1)
  }

  const calculateDetailedProfitDistribution = (car: CarType) => {
    const investments = carInvestments[car.id] || []
    const moneySpent = getMoneySpent(car)

    // Create CarSaleData for profit distribution calculation
    const saleData: CarSaleData = {
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
        ownership_type: car.ownership_type || 'partially_owned',
        commission_type: car.commission_type || 'flat',
        commission_amount: car.commission_amount || 0,
        commission_percentage: car.commission_percentage || 0
      }
    }

    try {
      return calculateProfitDistribution(saleData)
    } catch (error) {
      console.error(`Error calculating profit distribution for car ${car.id}:`, error)
      // Fallback to simple calculation
      const totalProfit = calculateProfit(car)
      return {
        total_profit: totalProfit,
        total_investment: car.purchase_price,
        showroom_share: {
          amount: totalProfit,
          percentage: 100,
          source: 'ownership' as const
        },
        investor_shares: []
      }
    }
  }

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.owner_name.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesMonth = true
    if (monthFilter !== "all") {
      const carMonth = new Date(car.updated_at).getMonth()
      const filterMonth = Number.parseInt(monthFilter)
      matchesMonth = carMonth === filterMonth
    }

    return matchesSearch && matchesMonth
  })

  const totalRevenue = filteredCars.reduce((sum, car) => sum + car.asking_price, 0)
  const totalProfit = filteredCars.reduce((sum, car) => sum + calculateProfit(car), 0)
  const totalExpenses = filteredCars.reduce((sum, car) => sum + (car.dealer_commission || 0) + (car.repair_costs || 0) + (car.additional_expenses || 0) + getMoneySpent(car), 0)
  const averageProfit = filteredCars.length > 0 ? totalProfit / filteredCars.length : 0

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3 lg:ml-0 ml-12">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sold Cars</h1>
                <p className="text-sm text-gray-600">Track your completed sales and profits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCars.length}</div>
              <p className="text-xs text-muted-foreground">Completed sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Gross sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">Net earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(averageProfit)}</div>
              <p className="text-xs text-muted-foreground">Per car</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">All costs</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sold cars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Months</option>
                  {months.map((month, index) => (
                    <option key={index} value={index.toString()}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sold Cars Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading sold cars...</span>
          </div>
        ) : filteredCars.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {cars.length === 0 ? "No cars sold yet" : "No cars match your search"}
              </h3>
              <p className="text-gray-600">
                {cars.length === 0
                  ? "Sold cars will appear here once you mark cars as sold."
                  : "Try adjusting your search terms or filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const profit = calculateProfit(car)
              const profitMargin = calculateProfitMargin(car)
              const distribution = calculateDetailedProfitDistribution(car)

              return (
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
                      <Badge variant="secondary">Sold</Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant={profit > 0 ? "default" : "destructive"}
                        className={profit > 0 ? "bg-green-600" : ""}
                      >
                        {profit > 0 ? "+" : ""}
                        {formatCurrency(profit)}
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
                        <span className="text-gray-600">Purchase:</span>
                        <span>{formatCurrency(car.purchase_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-medium">{formatCurrency(car.asking_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Profit:</span>
                        <span className={`font-medium ${distribution.total_profit > 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(distribution.total_profit)} ({profitMargin}%)
                        </span>
                      </div>

                      {/* Show profit distribution if there are investors */}
                      {distribution.investor_shares.length > 0 && (
                        <>
                          <div className="border-t pt-2 mt-2">
                            <div className="text-xs text-gray-500 mb-1">Profit Distribution:</div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Showroom ({distribution.showroom_share.percentage.toFixed(1)}%):</span>
                              <span className="text-blue-600">+{formatCurrency(distribution.showroom_share.amount)}</span>
                            </div>
                            {distribution.investor_shares.map((investor, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-600">{investor.investor_name} ({investor.ownership_percentage.toFixed(1)}%):</span>
                                <span className="text-green-600">+{formatCurrency(investor.profit_share)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {car.purchase_commission && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Purchase Commission:</span>
                          <span className="text-red-600">-{formatCurrency(car.purchase_commission)}</span>
                        </div>
                      )}
                      {car.dealer_commission && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sale Commission:</span>
                          <span className="text-red-600">-{formatCurrency(car.dealer_commission)}</span>
                        </div>
                      )}
                      {car.repair_costs && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Repairs:</span>
                          <span className="text-red-600">-{formatCurrency(car.repair_costs)}</span>
                        </div>
                      )}
                      {car.additional_expenses && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Other Expenses:</span>
                          <span className="text-red-600">-{formatCurrency(car.additional_expenses)}</span>
                        </div>
                      )}
                      {getMoneySpent(car) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Money Spent:</span>
                          <span className="text-red-600">-{formatCurrency(getMoneySpent(car))}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sold Date:</span>
                        <span>{new Date(car.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => (window.location.href = `/dashboard/cars/${car.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
