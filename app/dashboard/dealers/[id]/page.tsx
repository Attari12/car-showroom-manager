"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Car, DollarSign, Calendar, FileText, Eye } from "lucide-react"
import { getDealers, getCars, type Dealer as SupaDealer, type Car as CarType } from "@/lib/supabase-client"

interface Dealer extends SupaDealer {
  // Additional computed fields
}

interface DealerDebt {
  id: string
  dealerId: string
  amount: number
  type: "owed_to_client" | "owed_by_client"
  description: string
  createdAt: string
  documents: string[]
}

export default function DealerDetailPage({ params }: { params: { id: string } }) {
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [dealtCars, setDealtCars] = useState<CarType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [clientId, setClientId] = useState<string>("")

  // Authentication check and data loading
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const storedClientId = localStorage.getItem("clientId")
    
    if (userType !== "client" || !storedClientId) {
      window.location.href = "/"
      return
    }
    
    setClientId(storedClientId)
    loadDealerData(storedClientId)
  }, [])

  const loadDealerData = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")
      
      // Load dealers and find the specific dealer
      const dealers = await getDealers(clientId)
      const foundDealer = dealers.find(d => d.id === params.id)
      
      if (!foundDealer) {
        setError("Dealer not found")
        return
      }
      
      setDealer(foundDealer)
      
      // Load cars and find cars dealt by this dealer
      const cars = await getCars(clientId)
      const dealerCars = cars.filter(car => car.dealer_id === params.id)
      setDealtCars(dealerCars)
      
    } catch (error: any) {
      console.error("Error loading dealer data:", error)
      setError(`Failed to load dealer data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Debt data - would be loaded from database in real app when debt management is implemented
  const [debts] = useState<DealerDebt[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalCommission = dealtCars.reduce((sum, car) => sum + (car.dealer_commission || 0), 0)
  const totalDealsValue = dealtCars.reduce((sum, car) => sum + car.asking_price, 0)
  const totalOwed = debts.filter((debt) => debt.type === "owed_to_client").reduce((sum, debt) => sum + debt.amount, 0)
  const totalAdvance = debts
    .filter((debt) => debt.type === "owed_by_client")
    .reduce((sum, debt) => sum + debt.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dealer details...</span>
      </div>
    )
  }

  if (error || !dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Dealer</h2>
          <p className="text-gray-600 mb-4">{error || "Dealer not found"}</p>
          <Button onClick={() => window.location.href = "/dashboard/dealers"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dealers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => (window.location.href = "/dashboard/dealers")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dealers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dealer.name}</h1>
              <p className="text-sm text-gray-600">Dealer Profile & Deal History</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dealer Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dealer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Business Name</Label>
                <p className="text-lg font-semibold">{dealer.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">CNIC</Label>
                <p className="text-lg font-semibold">{dealer.cnic}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Contact</Label>
                <p className="text-lg font-semibold">{dealer.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Partner Since</Label>
                <p className="text-lg font-semibold">{dealer.created_at.split('T')[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealtCars.length}</div>
              <p className="text-xs text-muted-foreground">Cars dealt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deal Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDealsValue)}</div>
              <p className="text-xs text-muted-foreground">Total deals value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCommission)}</div>
              <p className="text-xs text-muted-foreground">Commission earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalOwed > 0 ? (
                  <span className="text-red-600">{formatCurrency(totalOwed)}</span>
                ) : totalAdvance > 0 ? (
                  <span className="text-blue-600">-{formatCurrency(totalAdvance)}</span>
                ) : (
                  <span className="text-green-600">₨0</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalOwed > 0 ? "Commission owed" : totalAdvance > 0 ? "Advance given" : "No outstanding balance"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Car Deal History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Car Deal History</CardTitle>
            <CardDescription>Detailed list of all cars dealt by this dealer</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Details</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Sold Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deal Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealtCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {car.make} {car.model}
                          </p>
                          <p className="text-sm text-gray-500">Reg: {car.registration_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{car.year}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(car.purchase_price)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(car.asking_price)}</TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">{formatCurrency(car.dealer_commission || 0)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={car.status === "sold" ? "secondary" : "default"}>
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{car.updated_at.split('T')[0]}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/cars/${car.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Commission History */}
        {debts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Commission History & Outstanding Payments</CardTitle>
              <CardDescription>Track commission payments and outstanding amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{formatCurrency(debt.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={debt.type === "owed_to_client" ? "destructive" : "secondary"}>
                          {debt.type === "owed_to_client" ? "I owe dealer" : "Dealer owes me"}
                        </Badge>
                      </TableCell>
                      <TableCell>{debt.description}</TableCell>
                      <TableCell>{debt.createdAt}</TableCell>
                      <TableCell>
                        {debt.documents.length > 0 ? (
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            {debt.documents.length} files
                          </Button>
                        ) : (
                          <span className="text-gray-400">No documents</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
