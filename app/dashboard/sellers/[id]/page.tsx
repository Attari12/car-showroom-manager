"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Car,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  Plus,
  CheckCircle,
  FileText,
  Download,
  Trash2,
} from "lucide-react"
import { getSellerDebts, createSellerDebt, settleSellerDebt, deleteSellerDebt, type SellerDebt } from "@/lib/supabase-client"

interface SellerDetail {
  id: string
  name: string
  cnic: string
  phone: string
  email?: string
  address?: string
  total_cars_sold: number
  total_amount_paid: number
  average_car_price: number
  first_sale_date: string
  last_sale_date?: string
  created_at: string
}

interface SaleTransaction {
  id: string
  car_make: string
  car_model: string
  car_year: number
  registration_number: string
  purchase_price: number
  asking_price: number
  status: 'available' | 'sold' | 'reserved'
  sold_price?: number
  sale_date: string
  created_at: string
}

export default function SellerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sellerId = params.id as string

  const [seller, setSeller] = useState<SellerDetail | null>(null)
  const [transactions, setTransactions] = useState<SaleTransaction[]>([])
  const [debts, setDebts] = useState<SellerDebt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Debt modal states
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false)
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)
  const [settlingDebt, setSettlingDebt] = useState<SellerDebt | null>(null)
  const [debtForm, setDebtForm] = useState({
    amount: "",
    type: "owed_to_client" as "owed_to_client" | "owed_by_client",
    description: "",
  })

  useEffect(() => {
    loadSellerDetails()
    loadDebts()
  }, [sellerId])

  const loadDebts = async () => {
    try {
      const clientId = localStorage.getItem("clientId")
      if (!clientId) return

      const debtsData = await getSellerDebts(clientId)
      // Filter debts for this specific seller
      const sellerDebts = debtsData.filter(debt => debt.seller_id === sellerId)
      setDebts(sellerDebts)
    } catch (error: any) {
      console.error("Error loading debts:", error)
      // Check if it's a table missing error
      if (error.message?.includes('does not exist') || error.message?.includes('contact administrator')) {
        console.warn("Debt tables not set up yet, showing empty debt list")
        setDebts([])
        // Don't show error to user for missing tables
      } else {
        setError(`Failed to load debts: ${error.message}`)
      }
    }
  }

  const loadSellerDetails = async () => {
    try {
      setLoading(true)
      setError("")

      // Mock data - replace with actual API calls
      const mockSeller: SellerDetail = {
        id: sellerId,
        name: "Muhammad Hassan",
        cnic: "42301-5678901-3",
        phone: "+92-302-5678901",
        email: "hassan@example.com",
        address: "Islamabad, Pakistan",
        total_cars_sold: 8,
        total_amount_paid: 2400000,
        average_car_price: 300000,
        first_sale_date: "2023-06-15",
        last_sale_date: "2024-01-15",
        created_at: "2023-06-01",
      }

      const mockTransactions: SaleTransaction[] = [
        {
          id: "sale-1",
          car_make: "Toyota",
          car_model: "Corolla",
          car_year: 2018,
          registration_number: "ABC-123",
          purchase_price: 250000,
          asking_price: 280000,
          status: "sold",
          sold_price: 275000,
          sale_date: "2024-01-15",
          created_at: "2023-12-20",
        },
        {
          id: "sale-2",
          car_make: "Honda",
          car_model: "Civic",
          car_year: 2019,
          registration_number: "XYZ-456",
          purchase_price: 350000,
          asking_price: 380000,
          status: "available",
          sale_date: "2024-01-10",
          created_at: "2024-01-10",
        },
        {
          id: "sale-3",
          car_make: "Suzuki",
          car_model: "Cultus",
          car_year: 2017,
          registration_number: "DEF-789",
          purchase_price: 180000,
          asking_price: 200000,
          status: "sold",
          sold_price: 195000,
          sale_date: "2023-12-28",
          created_at: "2023-12-10",
        },
      ]

      setSeller(mockSeller)
      setTransactions(mockTransactions)
    } catch (error: any) {
      console.error("Error loading seller details:", error)
      setError(`Failed to load seller details: ${error.message}`)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sold":
        return "bg-green-100 text-green-800"
      case "available":
        return "bg-blue-100 text-blue-800"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const clientId = localStorage.getItem("clientId")
      if (!clientId) {
        setError("Client ID not found")
        return
      }

      setError("")
      setSuccess("")

      if (!debtForm.amount || !debtForm.description) {
        setError("Please fill in all required fields")
        return
      }

      await createSellerDebt({
        client_id: clientId,
        seller_id: sellerId,
        amount: parseFloat(debtForm.amount),
        type: debtForm.type,
        description: debtForm.description,
      })

      setSuccess("Debt record created successfully!")
      setIsDebtModalOpen(false)
      setDebtForm({ amount: "", type: "owed_to_client", description: "" })
      await loadDebts()
    } catch (error: any) {
      setError(`Failed to create debt: ${error.message}`)
    }
  }

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settlingDebt) return

    try {
      setError("")
      setSuccess("")

      await settleSellerDebt(settlingDebt.id, {
        is_settled: true,
        settled_date: new Date().toISOString().split('T')[0],
        settled_amount: settlingDebt.amount,
      })

      setSuccess("Debt settled successfully!")
      setIsSettleModalOpen(false)
      setSettlingDebt(null)
      await loadDebts()
    } catch (error: any) {
      setError(`Failed to settle debt: ${error.message}`)
    }
  }

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm("Are you sure you want to delete this debt record?")) return

    try {
      setError("")
      await deleteSellerDebt(debtId)
      setSuccess("Debt record deleted successfully!")
      await loadDebts()
    } catch (error: any) {
      setError(`Failed to delete debt: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Seller not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const soldTransactions = transactions.filter(t => t.status === "sold")
  const totalProfit = soldTransactions.reduce((sum, t) => sum + ((t.sold_price || t.asking_price) - t.purchase_price), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3 lg:ml-0 ml-12">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/sellers")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sellers
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                <p className="text-sm text-gray-600">Seller Profile & Transaction History</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seller Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">CNIC:</span> {seller.cnic}</p>
                  <p><span className="text-gray-600">Phone:</span> {seller.phone}</p>
                  {seller.email && <p><span className="text-gray-600">Email:</span> {seller.email}</p>}
                  {seller.address && <p><span className="text-gray-600">Address:</span> {seller.address}</p>}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sales Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Cars Sold:</span> <span className="font-medium">{seller.total_cars_sold}</span></p>
                  <p><span className="text-gray-600">Total Paid:</span> <span className="font-medium">{formatCurrency(seller.total_amount_paid)}</span></p>
                  <p><span className="text-gray-600">Avg per Car:</span> <span className="font-medium">{formatCurrency(seller.average_car_price)}</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">First Sale:</span> <span className="font-medium">{formatDate(seller.first_sale_date)}</span></p>
                  <p><span className="text-gray-600">Last Sale:</span> <span className="font-medium">{seller.last_sale_date ? formatDate(seller.last_sale_date) : "N/A"}</span></p>
                  <p><span className="text-gray-600">Member Since:</span> <span className="font-medium">{formatDate(seller.created_at)}</span></p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Total Profit:</span> <span className="font-medium text-green-600">{formatCurrency(totalProfit)}</span></p>
                  <p><span className="text-gray-600">Avg Margin:</span> <span className="font-medium">{soldTransactions.length > 0 ? ((totalProfit / seller.total_amount_paid) * 100).toFixed(1) : 0}%</span></p>
                  <p><span className="text-gray-600">Reliability:</span> <span className="font-medium text-green-600">High</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{seller.total_cars_sold}</div>
              <p className="text-xs text-muted-foreground">Total transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(seller.total_amount_paid)}</div>
              <p className="text-xs text-muted-foreground">Amount paid to seller</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Showroom Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">From seller's cars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <Building2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(seller.average_car_price)}</div>
              <p className="text-xs text-muted-foreground">Per car purchased</p>
            </CardContent>
          </Card>
        </div>

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

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Car History</TabsTrigger>
            <TabsTrigger value="debts">Debts & Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Car Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {transaction.car_make} {transaction.car_model} {transaction.car_year}
                              </h4>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                              <span className="text-sm text-gray-600">{transaction.registration_number}</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Purchase Price:</span>
                                <div className="font-medium">{formatCurrency(transaction.purchase_price)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Asking Price:</span>
                                <div className="font-medium">{formatCurrency(transaction.asking_price)}</div>
                              </div>
                              {transaction.status === "sold" && transaction.sold_price && (
                                <div>
                                  <span className="text-gray-600">Sold Price:</span>
                                  <div className="font-medium text-green-600">{formatCurrency(transaction.sold_price)}</div>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">Purchase Date:</span>
                                <div className="font-medium">{formatDate(transaction.sale_date)}</div>
                              </div>
                              {transaction.status === "sold" && transaction.sold_price && (
                                <div>
                                  <span className="text-gray-600">Profit:</span>
                                  <div className="font-medium text-green-600">
                                    {formatCurrency(transaction.sold_price - transaction.purchase_price)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {transaction.status === "sold" && transaction.sold_price && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Profit margin:</span>
                                  <span className="font-medium text-green-600">
                                    {(((transaction.sold_price - transaction.purchase_price) / transaction.purchase_price) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Debts & Payments</CardTitle>
                <Button onClick={() => setIsDebtModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Debt Record
                </Button>
              </CardHeader>
              <CardContent>
                {debts.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No debt records found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {debts.map((debt) => (
                      <div key={debt.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={debt.type === "owed_to_client" ? "destructive" : "secondary"}>
                                {debt.type === "owed_to_client" ? "Owes to me" : "I owe"}
                              </Badge>
                              <span className="font-medium">{formatCurrency(debt.amount)}</span>
                              {debt.is_settled && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Settled
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{debt.description}</p>

                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Created: {formatDate(debt.created_at)}</span>
                              {debt.settled_date && (
                                <span>Settled: {formatDate(debt.settled_date)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {!debt.is_settled && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSettlingDebt(debt)
                                  setIsSettleModalOpen(true)
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Settle
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDebt(debt.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Debt Modal */}
        <Dialog open={isDebtModalOpen} onOpenChange={setIsDebtModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Debt Record</DialogTitle>
              <DialogDescription>
                Record a debt transaction with {seller.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="debt-amount">Amount *</Label>
                <Input
                  id="debt-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={debtForm.amount}
                  onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-type">Debt Type *</Label>
                <select
                  id="debt-type"
                  value={debtForm.type}
                  onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value as "owed_to_client" | "owed_by_client" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="owed_to_client">{seller.name} owes to me</option>
                  <option value="owed_by_client">I owe to {seller.name}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt-description">Description *</Label>
                <Textarea
                  id="debt-description"
                  value={debtForm.description}
                  onChange={(e) => setDebtForm({ ...debtForm, description: e.target.value })}
                  placeholder="Describe the debt transaction..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDebtModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Debt Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Settle Debt Modal */}
        <Dialog open={isSettleModalOpen} onOpenChange={setIsSettleModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Settle Debt</DialogTitle>
              <DialogDescription>
                Mark this debt as settled
              </DialogDescription>
            </DialogHeader>
            {settlingDebt && (
              <form onSubmit={handleSettleDebt} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Original Amount:</span>
                    <span className="font-medium">{formatCurrency(settlingDebt.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge variant={settlingDebt.type === "owed_to_client" ? "destructive" : "secondary"}>
                      {settlingDebt.type === "owed_to_client" ? "Owes to me" : "I owe"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{settlingDebt.description}</p>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsSettleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Mark as Settled</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
