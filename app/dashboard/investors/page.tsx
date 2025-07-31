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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Car,
} from "lucide-react"
import { getInvestors, createInvestor, updateInvestor, deleteInvestor, type Investor } from "@/lib/supabase-client"



export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [clientId, setClientId] = useState<string>("")

  // Add/Edit investor state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    // Check authentication
    const storedClientId = localStorage.getItem("clientId")
    const userType = localStorage.getItem("userType")

    if (!storedClientId || userType !== "client") {
      router.push("/")
      return
    }

    setClientId(storedClientId)
    loadInvestors(storedClientId)
  }, [router])

  const loadInvestors = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")
      const investorsData = await getInvestors(clientId)
      setInvestors(investorsData)
    } catch (error: any) {
      console.error("Error loading investors:", error)
      setError(`Failed to load investors: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInvestor = () => {
    setEditingInvestor(null)
    setFormData({
      name: "",
      cnic: "",
      phone: "",
      email: "",
      address: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditInvestor = (investor: Investor) => {
    setEditingInvestor(investor)
    setFormData({
      name: investor.name,
      cnic: investor.cnic,
      phone: investor.phone,
      email: investor.email || "",
      address: investor.address || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      setSuccess("")

      // Validate required fields
      if (!formData.name || !formData.cnic || !formData.phone) {
        setError("Please fill in all required fields")
        return
      }

      if (editingInvestor) {
        // Update existing investor
        await updateInvestor(editingInvestor.id, {
          name: formData.name,
          cnic: formData.cnic,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        })
        setSuccess("Investor updated successfully!")
      } else {
        // Create new investor
        await createInvestor({
          client_id: clientId,
          name: formData.name,
          cnic: formData.cnic,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        })
        setSuccess("Investor added successfully!")
      }

      // Reload investors list
      await loadInvestors(clientId)

      setIsDialogOpen(false)
      setEditingInvestor(null)
      setFormData({
        name: "",
        cnic: "",
        phone: "",
        email: "",
        address: "",
      })
    } catch (error: any) {
      console.error("Error saving investor:", error)
      setError(`Failed to save investor: ${error.message}`)
    }
  }

  const handleDeleteInvestor = async (investorId: string, investorName: string) => {
    if (!confirm(`Are you sure you want to delete "${investorName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setError("")
      await deleteInvestor(investorId)
      setSuccess(`Investor "${investorName}" deleted successfully!`)
      await loadInvestors(clientId)
    } catch (error: any) {
      console.error("Error deleting investor:", error)
      setError(`Failed to delete investor: ${error.message}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.phone.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const totalInvestment = investors.reduce((sum, inv) => sum + inv.total_investment, 0)
  const totalProfit = investors.reduce((sum, inv) => sum + inv.total_profit, 0)
  const totalActiveInvestments = investors.reduce((sum, inv) => sum + inv.active_investments, 0)

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
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investors</h1>
                <p className="text-sm text-gray-600">Manage investor profiles and track investments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleAddInvestor}>
                <Plus className="w-4 h-4 mr-2" />
                Add Investor
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investors.length}</div>
              <p className="text-xs text-muted-foreground">Active investor profiles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvestment)}</div>
              <p className="text-xs text-muted-foreground">Combined investment amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground">Total profits generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Car className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalActiveInvestments}</div>
              <p className="text-xs text-muted-foreground">Current car investments</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search investors by name, CNIC, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading investors...</span>
          </div>
        ) : filteredInvestors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {investors.length === 0 ? "No investors found" : "No investors match your search"}
              </h3>
              <p className="text-gray-600 mb-4">
                {investors.length === 0
                  ? "Get started by adding your first investor profile."
                  : "Try adjusting your search terms."}
              </p>
              {investors.length === 0 && (
                <Button onClick={handleAddInvestor}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Investor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.map((investor) => (
              <Card key={investor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{investor.name}</h3>
                      <p className="text-sm text-gray-600">{investor.cnic}</p>
                      <p className="text-sm text-gray-600">{investor.phone}</p>
                    </div>
                    <Badge variant="secondary">{investor.active_investments} Active</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Investment:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(investor.total_investment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Profit:</span>
                      <span className="font-medium text-green-600">{formatCurrency(investor.total_profit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ROI:</span>
                      <span className="font-medium">
                        {investor.total_investment > 0
                          ? `${((investor.total_profit / investor.total_investment) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/investors/${investor.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditInvestor(investor)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInvestor(investor.id, investor.name)}
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

        {/* Add/Edit Investor Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingInvestor ? "Edit Investor" : "Add New Investor"}</DialogTitle>
              <DialogDescription>
                {editingInvestor
                  ? "Update the investor information"
                  : "Enter the details for the new investor"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC / National ID *</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  placeholder="42101-1234567-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+92-300-1234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="investor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingInvestor ? "Update" : "Add"} Investor</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
