"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, DollarSign, TrendingUp, Search, Eye, AlertCircle, Calendar } from "lucide-react"
import { getCars, type Car as CarType } from "@/lib/supabase-client"

export default function SoldCarsPage() {
  const [cars, setCars] = useState<CarType[]>([])
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

  const calculateProfit = (car: CarType) => {
    return car.asking_price - car.purchase_price - (car.dealer_commission || 0)
  }

  const calculateProfitMargin = (car: CarType) => {
    const profit = calculateProfit(car)
    return ((profit / car.asking_price) * 100).toFixed(1)
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
  const totalCommission = filteredCars.reduce((sum, car) => sum + (car.dealer_commission || 0), 0)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                        <span className={`font-medium ${profit > 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(profit)} ({profitMargin}%)
                        </span>
                      </div>
                      {car.dealer_commission && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Commission:</span>
                          <span className="text-red-600">-{formatCurrency(car.dealer_commission)}</span>
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
