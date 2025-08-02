"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Car, DollarSign, Calendar, FileText, Eye } from "lucide-react"
import { getBuyers, getCars, getCarInvestments, type Buyer as SupaBuyer, type Car as CarType } from "@/lib/supabase-client"
import { calculateProfitDistribution } from "@/lib/profit-calculations"

interface Buyer extends SupaBuyer {
  // Additional computed fields
}

interface CarPurchase {
  id: string
  buyerId: string
  carId: string
  carMake: string
  carModel: string
  carYear: number
  purchasePrice: number
  soldPrice: number
  purchaseDate: string
  profit: number
}

interface Debt {
  id: string
  buyerId: string
  amount: number
  type: "owed_to_client" | "owed_by_client"
  description: string
  createdAt: string
  documents: string[]
}

export default function BuyerDetailPage({ params }: { params: { id: string } }) {
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [purchasedCars, setPurchasedCars] = useState<CarType[]>([])
  const [carProfitDistributions, setCarProfitDistributions] = useState<Map<string, any>>(new Map())
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
    loadBuyerData(storedClientId)
  }, [])

  const loadBuyerData = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")

      // Load buyers and find the specific buyer
      const buyers = await getBuyers(clientId)
      const foundBuyer = buyers.find(b => b.id === params.id)

      if (!foundBuyer) {
        setError("Buyer not found")
        return
      }

      setBuyer(foundBuyer)

      // Load cars and find ALL cars purchased by buyers with the same CNIC
      const cars = await getCars(clientId)

      // Find all buyers with the same CNIC as the selected buyer
      const buyersWithSameCnic = buyers.filter(b => b.cnic === foundBuyer.cnic)
      const allBuyerIds = buyersWithSameCnic.map(b => b.id)

      // Get all cars purchased by any buyer with this CNIC
      const buyerCars = cars.filter(car =>
        allBuyerIds.includes(car.buyer_id || '') && car.status === "sold"
      )

      setPurchasedCars(buyerCars)

      // Calculate profit distributions for each car
      const distributionsMap = new Map()

      for (const car of buyerCars) {
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
          distributionsMap.set(car.id, distribution)

        } catch (error) {
          console.error(`Error calculating profit for car ${car.id}:`, error)
          // Set a fallback distribution
          distributionsMap.set(car.id, {
            showroom_share: {
              amount: car.asking_price - car.purchase_price - (car.dealer_commission || 0),
              percentage: 100,
              source: 'ownership'
            }
          })
        }
      }

      setCarProfitDistributions(distributionsMap)

    } catch (error: any) {
      console.error("Error loading buyer data:", error)
      setError(`Failed to load buyer data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const [carPurchases] = useState<CarPurchase[]>([])

  const [debts] = useState<Debt[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalPurchaseValue = purchasedCars.reduce((sum, car) => sum + car.asking_price, 0)
  const totalProfit = purchasedCars.reduce((sum, car) => {
    const distribution = carProfitDistributions.get(car.id)
    if (distribution && distribution.showroom_share) {
      return sum + distribution.showroom_share.amount
    }
    // Fallback to simple calculation if no distribution data
    const profit = car.asking_price - car.purchase_price - (car.dealer_commission || 0)
    return sum + profit
  }, 0)
  const totalOwed = debts.filter((debt) => debt.type === "owed_to_client").reduce((sum, debt) => sum + debt.amount, 0)
  const totalAdvance = debts
    .filter((debt) => debt.type === "owed_by_client")
    .reduce((sum, debt) => sum + debt.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading buyer details...</span>
      </div>
    )
  }

  if (error || !buyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Buyer</h2>
          <p className="text-gray-600 mb-4">{error || "Buyer not found"}</p>
          <Button onClick={() => window.location.href = "/dashboard/buyers"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Buyers
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
            <Button variant="ghost" onClick={() => (window.location.href = "/dashboard/buyers")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Buyers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{buyer.name}</h1>
              <p className="text-sm text-gray-600">Buyer Profile & Purchase History</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Buyer Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buyer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-lg font-semibold">{buyer.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">CNIC</Label>
                <p className="text-lg font-semibold">{buyer.cnic}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Contact</Label>
                <p className="text-lg font-semibold">{buyer.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Customer Since</Label>
                <p className="text-lg font-semibold">{buyer.created_at.split('T')[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars Bought</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchasedCars.length}</div>
              <p className="text-xs text-muted-foreground">Cars purchased</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchase Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPurchaseValue)}</div>
              <p className="text-xs text-muted-foreground">Total amount spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profit</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">Profit from this buyer</p>
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
                {totalOwed > 0 ? "Amount owed" : totalAdvance > 0 ? "Advance given" : "No outstanding balance"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Car Purchase History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Car Purchase History</CardTitle>
            <CardDescription>Detailed list of all cars purchased by this buyer</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Details</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Sold Price</TableHead>
                  <TableHead>My Profit</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchasedCars.map((car) => {
                  const distribution = carProfitDistributions.get(car.id)
                  const showroomProfit = distribution?.showroom_share?.amount || 0
                  const showroomPercentage = distribution?.showroom_share?.percentage || 0
                  const profitSource = distribution?.showroom_share?.source || 'ownership'

                  return (
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
                        <div>
                          <div className="font-medium text-green-600">{formatCurrency(showroomProfit)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Profit Distribution:
                          </div>
                          <div className="text-xs text-blue-600">
                            Showroom ({showroomPercentage.toFixed(1)}%): {formatCurrency(showroomProfit)}
                          </div>
                          {profitSource === 'commission' && (
                            <div className="text-xs text-orange-500 mt-1">
                              Commission-based
                            </div>
                          )}
                        </div>
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
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Debt History */}
        {debts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History & Outstanding Debts</CardTitle>
              <CardDescription>Track payments and outstanding amounts</CardDescription>
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
                          {debt.type === "owed_to_client" ? "Owes to me" : "I owe"}
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
