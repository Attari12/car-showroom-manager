"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, DollarSign, TrendingUp, Calendar, Users, UserCheck, LogOut, Plus, Eye, MessageCircle } from "lucide-react"
import { WhatsAppShare } from "@/components/whatsapp-share"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CarData {
  id: string
  make: string
  model: string
  year: number
  registrationNumber: string
  mileage: number
  purchasePrice: number
  askingPrice: number
  purchaseDate: string
  status: "available" | "sold"
  soldPrice?: number
  soldDate?: string
  profit?: number
  dealerCommission?: number
  repairCosts?: number // Add this line
  buyerName?: string
  buyerCnic?: string
  buyerContact?: string
}

export default function ClientDashboard() {
  const [currentUser, setCurrentUser] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMarkSoldOpen, setIsMarkSoldOpen] = useState(false)
  const [selectedCarForSale, setSelectedCarForSale] = useState<CarData | null>(null)
  const [saleData, setSaleData] = useState({
    soldPrice: "",
    soldDate: "",
    buyerName: "",
    buyerCnic: "",
    buyerContact: "",
    repairCosts: "", // Add this line
  })

  // Add authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const username = localStorage.getItem("username")

    if (userType !== "client" || !username) {
      window.location.href = "/"
      return
    }

    setCurrentUser(username)
  }, [])

  // Update the profit calculation formula
  const calculateProfit = (soldPrice: number, purchasePrice: number, dealerCommission = 0, repairCosts = 0) => {
    return soldPrice - purchasePrice - dealerCommission - repairCosts
  }

  // Update the cars data with proper dealer commission
  const [cars] = useState<CarData[]>([
    {
      id: "car-1",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      registrationNumber: "LZH-238",
      mileage: 45000,
      purchasePrice: 2500000,
      askingPrice: 2800000,
      purchaseDate: "2024-01-10",
      status: "sold",
      soldPrice: 2750000,
      soldDate: "2024-01-18",
      dealerCommission: 50000,
      repairCosts: 25000,
      profit: calculateProfit(2750000, 2500000, 50000, 25000),
      buyerName: "Ahmed Ali Khan",
      buyerCnic: "42101-1234567-1",
      buyerContact: "+92-300-1234567",
    },
    {
      id: "car-2",
      make: "Honda",
      model: "Civic",
      year: 2019,
      registrationNumber: "KHI-456",
      mileage: 62000,
      purchasePrice: 3000000,
      askingPrice: 3400000,
      purchaseDate: "2024-01-12",
      status: "available",
    },
    {
      id: "car-3",
      make: "Suzuki",
      model: "Alto",
      year: 2021,
      registrationNumber: "ISB-789",
      mileage: 28000,
      purchasePrice: 1800000,
      askingPrice: 2100000,
      purchaseDate: "2024-01-15",
      status: "sold",
      soldPrice: 2050000,
      soldDate: "2024-01-20",
      dealerCommission: 30000,
      repairCosts: 15000,
      profit: calculateProfit(2050000, 1800000, 30000, 15000),
      buyerName: "Sara Malik",
      buyerCnic: "42101-9876543-2",
      buyerContact: "+92-321-9876543",
    },
    {
      id: "car-4",
      make: "Toyota",
      model: "Camry",
      year: 2021,
      registrationNumber: "LHR-321",
      mileage: 35000,
      purchasePrice: 4500000,
      askingPrice: 4900000,
      purchaseDate: "2024-01-20",
      status: "available",
    },
  ])

  // Calculate profits
  const soldCars = cars.filter((car) => car.status === "sold")
  const totalProfit = soldCars.reduce((sum, car) => sum + (car.profit || 0), 0)

  // Last 7 days profit
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentSoldCars = soldCars.filter((car) => car.soldDate && new Date(car.soldDate) >= sevenDaysAgo)
  const weeklyProfit = recentSoldCars.reduce((sum, car) => sum + (car.profit || 0), 0)

  // Monthly profit (current month)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlySoldCars = soldCars.filter((car) => {
    if (!car.soldDate) return false
    const soldDate = new Date(car.soldDate)
    return soldDate.getMonth() === currentMonth && soldDate.getFullYear() === currentYear
  })
  const monthlyProfit = monthlySoldCars.reduce((sum, car) => sum + (car.profit || 0), 0)

  // Filter cars based on search term
  const filteredAvailableCars = cars
    .filter((car) => car.status === "available")
    .filter(
      (car) =>
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year.toString().includes(searchTerm),
    )

  const filteredSoldCars = soldCars.filter(
    (car) =>
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.year.toString().includes(searchTerm) ||
      (car.buyerName && car.buyerName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  const createCarShareMessage = (car: any) => {
    return (
      `🚗 *${car.make} ${car.model} ${car.year}*\n\n` +
      `💰 *Price:* ${new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(car.askingPrice)}\n` +
      `📅 *Year:* ${car.year}\n` +
      `🛣️ *Mileage:* ${car.mileage.toLocaleString()} km\n` + // Add this line
      `👤 *Owner:* ${car.ownerName}\n` +
      `📋 *Status:* ${car.status === "available" ? "Available" : "Sold"}\n\n` +
      `📝 *Description:* ${car.description || "Excellent condition vehicle"}\n\n` +
      `Contact us for more details and to schedule a viewing!`
    )
  }

  const handleMarkAsSold = () => {
    if (selectedCarForSale && saleData.soldPrice && saleData.soldDate && saleData.buyerName) {
      const updatedCars = cars.map((car) => {
        if (car.id === selectedCarForSale.id) {
          return {
            ...car,
            status: "sold" as const,
            soldPrice: Number.parseFloat(saleData.soldPrice),
            soldDate: saleData.soldDate,
            buyerName: saleData.buyerName,
            buyerCnic: saleData.buyerCnic,
            buyerContact: saleData.buyerContact,
            repairCosts: saleData.repairCosts ? Number.parseFloat(saleData.repairCosts) : 0,
            profit: calculateProfit(
              Number.parseFloat(saleData.soldPrice),
              car.purchasePrice,
              car.dealerCommission || 0,
              saleData.repairCosts ? Number.parseFloat(saleData.repairCosts) : 0,
            ),
          }
        }
        return car
      })
      // In real app, update the cars state
      alert("Car marked as sold successfully!")
      setIsMarkSoldOpen(false)
      setSaleData({ soldPrice: "", soldDate: "", buyerName: "", buyerCnic: "", buyerContact: "", repairCosts: "" })
      setSelectedCarForSale(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Car Showroom Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {currentUser}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cars.length}</div>
              <p className="text-xs text-muted-foreground">
                {cars.filter((car) => car.status === "available").length} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyProfit)}</div>
              <p className="text-xs text-muted-foreground">{monthlySoldCars.length} cars sold this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(weeklyProfit)}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cars">Car Inventory</TabsTrigger>
            <TabsTrigger value="sold">Sold Cars</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Car Inventory</CardTitle>
                    <CardDescription>Manage your car listings and profiles</CardDescription>
                  </div>
                  <Button onClick={() => (window.location.href = "/dashboard/add-car")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Car
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-6">
                  <Input
                    placeholder="Search cars by make, model, registration number, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAvailableCars.map((car) => (
                    <Card key={car.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {car.make} {car.model}
                          </h3>
                          <Badge variant="outline">{car.year}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registration:</span>
                            <span className="font-medium">{car.registrationNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mileage:</span>
                            <span>{car.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Purchase:</span>
                            <span>{formatCurrency(car.purchasePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Asking:</span>
                            <span className="font-medium">{formatCurrency(car.askingPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{car.purchaseDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => (window.location.href = `/dashboard/cars/${car.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <WhatsAppShare message={createCarShareMessage(car)} size="sm" className="flex-1">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Share
                          </WhatsAppShare>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCarForSale(car)
                              setIsMarkSoldOpen(true)
                            }}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Sell
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sold">
            <Card>
              <CardHeader>
                <CardTitle>Sold Cars</CardTitle>
                <CardDescription>Track your sold vehicles and profits</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-6">
                  <Input
                    placeholder="Search sold cars by make, model, registration, buyer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-4">
                  {filteredSoldCars.map((car) => (
                    <Card key={car.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {car.make} {car.model} ({car.year}) - {car.registrationNumber}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Purchase:</span>
                                <div className="font-medium">{formatCurrency(car.purchasePrice)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sold:</span>
                                <div className="font-medium">{formatCurrency(car.soldPrice || 0)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Commission:</span>
                                <div className="font-medium text-orange-600">
                                  {formatCurrency(car.dealerCommission || 0)}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Repairs:</span>
                                <div className="font-medium text-red-600">{formatCurrency(car.repairCosts || 0)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Net Profit:</span>
                                <div className="font-medium text-green-600">{formatCurrency(car.profit || 0)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sold Date:</span>
                                <div className="font-medium">{car.soldDate}</div>
                              </div>
                            </div>
                            {car.buyerName && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-sm mb-2">Buyer Details:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <div className="font-medium">{car.buyerName}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">CNIC:</span>
                                    <div className="font-medium">{car.buyerCnic || "N/A"}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Contact:</span>
                                    <div className="font-medium">{car.buyerContact || "N/A"}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant="secondary">Sold</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (window.location.href = `/dashboard/cars/${car.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <WhatsAppShare
                            message={`🎉 *SOLD* - ${car.make} ${car.model} ${car.year} (${car.registrationNumber})\n\n💰 Sold for: ${formatCurrency(car.soldPrice || 0)}\n📅 Sold on: ${car.soldDate}\n💵 Profit: ${formatCurrency(car.profit || 0)}\n👤 Buyer: ${car.buyerName}\n\nAnother successful sale! Contact us for similar vehicles.`}
                            variant="outline"
                            size="sm"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Share Sale
                          </WhatsAppShare>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Buyer Profiles</CardTitle>
                    <CardDescription>Manage customer information and transaction history</CardDescription>
                  </div>
                  <Button onClick={() => (window.location.href = "/dashboard/buyers")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Buyers
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Manage Buyers" to add and manage buyer profiles.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dealers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Dealer Profiles</CardTitle>
                    <CardDescription>Manage dealer relationships and commissions</CardDescription>
                  </div>
                  <Button onClick={() => (window.location.href = "/dashboard/dealers")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Dealers
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Manage Dealers" to add and manage dealer profiles.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Business Reports</CardTitle>
                <CardDescription>Generate and view detailed business analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profit Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>This Week:</span>
                          <span className="font-medium">{formatCurrency(weeklyProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Month:</span>
                          <span className="font-medium">{formatCurrency(monthlyProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">{formatCurrency(totalProfit)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Available Cars:</span>
                          <span className="font-medium">{cars.filter((car) => car.status === "available").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sold Cars:</span>
                          <span className="font-medium">{soldCars.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Investment:</span>
                          <span className="font-medium">
                            {formatCurrency(cars.reduce((sum, car) => sum + car.purchasePrice, 0))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Mark as Sold Dialog */}
      <Dialog open={isMarkSoldOpen} onOpenChange={setIsMarkSoldOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mark Car as Sold</DialogTitle>
            <DialogDescription>
              {selectedCarForSale &&
                `${selectedCarForSale.make} ${selectedCarForSale.model} ${selectedCarForSale.year} (${selectedCarForSale.registrationNumber})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sold-price">Sold Price (PKR)</Label>
                <Input
                  id="sold-price"
                  type="number"
                  value={saleData.soldPrice}
                  onChange={(e) => setSaleData({ ...saleData, soldPrice: e.target.value })}
                  placeholder="2750000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sold-date">Sold Date</Label>
                <Input
                  id="sold-date"
                  type="date"
                  value={saleData.soldDate}
                  onChange={(e) => setSaleData({ ...saleData, soldDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-name">Buyer Name</Label>
              <Input
                id="buyer-name"
                value={saleData.buyerName}
                onChange={(e) => setSaleData({ ...saleData, buyerName: e.target.value })}
                placeholder="Ahmed Ali Khan"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyer-cnic">Buyer CNIC</Label>
                <Input
                  id="buyer-cnic"
                  value={saleData.buyerCnic}
                  onChange={(e) => setSaleData({ ...saleData, buyerCnic: e.target.value })}
                  placeholder="42101-1234567-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer-contact">Buyer Contact</Label>
                <Input
                  id="buyer-contact"
                  value={saleData.buyerContact}
                  onChange={(e) => setSaleData({ ...saleData, buyerContact: e.target.value })}
                  placeholder="+92-300-1234567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repair-costs">Repair Costs (PKR) - Optional</Label>
              <Input
                id="repair-costs"
                type="number"
                value={saleData.repairCosts}
                onChange={(e) => setSaleData({ ...saleData, repairCosts: e.target.value })}
                placeholder="25000"
              />
              <p className="text-xs text-gray-500">Any money spent on repairs, maintenance, or improvements</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkSoldOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsSold}>Mark as Sold</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
