"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, DollarSign, TrendingUp, Calendar, AlertCircle, BarChart3 } from "lucide-react"
import { getCars, getBuyers, getDealers, type Car as CarType } from "@/lib/supabase-client"

export default function ReportsPage() {
  const [cars, setCars] = useState<CarType[]>([])
  const [buyers, setBuyers] = useState<any[]>([])
  const [dealers, setDealers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [clientId, setClientId] = useState<string>("")

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId")
    const userType = localStorage.getItem("userType")

    if (!storedClientId || userType !== "client") {
      window.location.href = "/"
      return
    }

    setClientId(storedClientId)
    loadReportsData(storedClientId)
  }, [])

  const loadReportsData = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")

      const [carsData, buyersData, dealersData] = await Promise.all([
        getCars(clientId),
        getBuyers(clientId),
        getDealers(clientId),
      ])

      setCars(carsData)
      setBuyers(buyersData)
      setDealers(dealersData)
    } catch (error: any) {
      console.error("Error loading reports data:", error)
      setError(`Failed to load reports data: ${error.message}`)
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

  const calculateProfit = (car: CarType) => {
    return car.asking_price - car.purchase_price - (car.dealer_commission || 0)
  }

  // Calculate metrics
  const soldCars = cars.filter((car) => car.status === "sold")
  const availableCars = cars.filter((car) => car.status === "available")

  const totalRevenue = soldCars.reduce((sum, car) => sum + car.asking_price, 0)
  const totalProfit = soldCars.reduce((sum, car) => sum + calculateProfit(car), 0)
  const totalInvestment = cars.reduce((sum, car) => sum + car.purchase_price, 0)
  const availableInventoryValue = availableCars.reduce((sum, car) => sum + car.asking_price, 0)

  const averageProfit = soldCars.length > 0 ? totalProfit / soldCars.length : 0
  const averageProfitMargin = soldCars.length > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // Monthly data for current year
  const currentYear = new Date().getFullYear()
  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const monthCars = soldCars.filter((car) => {
      const carDate = new Date(car.updated_at)
      return carDate.getMonth() === month && carDate.getFullYear() === currentYear
    })

    const monthRevenue = monthCars.reduce((sum, car) => sum + car.asking_price, 0)
    const monthProfit = monthCars.reduce((sum, car) => sum + calculateProfit(car), 0)

    return {
      month: new Date(currentYear, month).toLocaleString("default", { month: "short" }),
      cars: monthCars.length,
      revenue: monthRevenue,
      profit: monthProfit,
    }
  })

  // Car make distribution
  const makeDistribution = cars.reduce(
    (acc, car) => {
      acc[car.make] = (acc[car.make] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topMakes = Object.entries(makeDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Status distribution
  const statusDistribution = cars.reduce(
    (acc, car) => {
      acc[car.status] = (acc[car.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const conversionRate = cars.length > 0 ? (soldCars.length / cars.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading reports...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3 lg:ml-0 ml-12">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Reports</h1>
                <p className="text-sm text-gray-600">Analytics and insights for your car business</p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">From {soldCars.length} sold cars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">{averageProfitMargin.toFixed(1)}% profit margin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(availableInventoryValue)}</div>
              <p className="text-xs text-muted-foreground">{availableCars.length} available cars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Cars sold vs total</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Performance ({currentYear})</CardTitle>
            <CardDescription>Sales and profit trends throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-600">{month.cars} cars sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(month.revenue)}</p>
                    <p className="text-sm text-green-600">+{formatCurrency(month.profit)} profit</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Car Makes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Car Makes</CardTitle>
              <CardDescription>Most popular brands in your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMakes.map(([make, count], index) => (
                  <div key={make} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <span className="font-medium">{make}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(count / cars.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Car Status Distribution</CardTitle>
              <CardDescription>Current status of all cars in inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status === "available"
                            ? "bg-green-500"
                            : status === "sold"
                              ? "bg-blue-500"
                              : status === "reserved"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                        }`}
                      />
                      <span className="font-medium capitalize">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            status === "available"
                              ? "bg-green-500"
                              : status === "sold"
                                ? "bg-blue-500"
                                : status === "reserved"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                          }`}
                          style={{ width: `${(count / cars.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cars:</span>
                  <span className="font-medium">{cars.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">{availableCars.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sold:</span>
                  <span className="font-medium text-blue-600">{soldCars.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Investment:</span>
                  <span className="font-medium">{formatCurrency(totalInvestment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Buyers:</span>
                  <span className="font-medium">{buyers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Dealers:</span>
                  <span className="font-medium">{dealers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Sale Value:</span>
                  <span className="font-medium">
                    {soldCars.length > 0 ? formatCurrency(totalRevenue / soldCars.length) : formatCurrency(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Profit per Car:</span>
                  <span className="font-medium text-green-600">
                    {soldCars.length > 0 ? formatCurrency(totalProfit / soldCars.length) : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="font-medium">{averageProfitMargin.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion Rate:</span>
                  <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
