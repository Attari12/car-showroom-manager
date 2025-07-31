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
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Car,
  Users,
  DollarSign,
} from "lucide-react"
import { getSellers, createSeller, updateSeller, deleteSeller, type Seller } from "@/lib/supabase-client"



export default function SellersPage() {
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [clientId, setClientId] = useState<string>("")

  // Add/Edit seller state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
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
    loadSellers(storedClientId)
  }, [router])

  const loadSellers = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")
      const sellersData = await getSellers(clientId)
      setSellers(sellersData)
    } catch (error: any) {
      console.error("Error loading sellers:", error)
      setError(`Failed to load sellers: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSeller = () => {
    setEditingSeller(null)
    setFormData({
      name: "",
      cnic: "",
      phone: "",
      email: "",
      address: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditSeller = (seller: Seller) => {
    setEditingSeller(seller)
    setFormData({
      name: seller.name,
      cnic: seller.cnic,
      phone: seller.phone,
      email: seller.email || "",
      address: seller.address || "",
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

      if (editingSeller) {
        // Update existing seller
        await updateSeller(editingSeller.id, {
          name: formData.name,
          cnic: formData.cnic,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        })
        setSuccess("Seller updated successfully!")
      } else {
        // Create new seller
        await createSeller({
          client_id: clientId,
          name: formData.name,
          cnic: formData.cnic,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        })
        setSuccess("Seller added successfully!")
      }

      // Reload sellers list
      await loadSellers(clientId)

      setIsDialogOpen(false)
      setEditingSeller(null)
      setFormData({
        name: "",
        cnic: "",
        phone: "",
        email: "",
        address: "",
      })
    } catch (error: any) {
      console.error("Error saving seller:", error)
      setError(`Failed to save seller: ${error.message}`)
    }
  }

  const handleDeleteSeller = async (sellerId: string, sellerName: string) => {
    if (!confirm(`Are you sure you want to delete "${sellerName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setError("")
      await deleteSeller(sellerId)
      setSuccess(`Seller "${sellerName}" deleted successfully!`)
      await loadSellers(clientId)
    } catch (error: any) {
      console.error("Error deleting seller:", error)
      setError(`Failed to delete seller: ${error.message}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-PK")
  }

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const totalCarsSold = sellers.reduce((sum, seller) => sum + seller.total_cars_sold, 0)
  const totalAmountPaid = sellers.reduce((sum, seller) => sum + seller.total_amount_paid, 0)
  const averagePerSeller = sellers.length > 0 ? totalAmountPaid / sellers.length : 0

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
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
                <p className="text-sm text-gray-600">Manage seller profiles and track car purchases</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleAddSeller}>
                <Plus className="w-4 h-4 mr-2" />
                Add Seller
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
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellers.length}</div>
              <p className="text-xs text-muted-foreground">Registered seller profiles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars Purchased</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalCarsSold}</div>
              <p className="text-xs text-muted-foreground">Total cars bought from sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmountPaid)}</div>
              <p className="text-xs text-muted-foreground">Amount paid to sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Seller</CardTitle>
              <Building2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(averagePerSeller)}</div>
              <p className="text-xs text-muted-foreground">Average amount per seller</p>
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
                    placeholder="Search sellers by name, CNIC, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sellers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading sellers...</span>
          </div>
        ) : filteredSellers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sellers.length === 0 ? "No sellers found" : "No sellers match your search"}
              </h3>
              <p className="text-gray-600 mb-4">
                {sellers.length === 0
                  ? "Get started by adding your first seller profile."
                  : "Try adjusting your search terms."}
              </p>
              {sellers.length === 0 && (
                <Button onClick={handleAddSeller}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Seller
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <Card key={seller.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{seller.name}</h3>
                      <p className="text-sm text-gray-600">{seller.cnic}</p>
                      <p className="text-sm text-gray-600">{seller.phone}</p>
                      {seller.address && <p className="text-sm text-gray-600">{seller.address}</p>}
                    </div>
                    <Badge variant="secondary">{seller.total_cars_sold} Cars</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cars Sold:</span>
                      <span className="font-medium">{seller.total_cars_sold}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-medium text-green-600">{formatCurrency(seller.total_amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sale:</span>
                      <span className="font-medium">{formatDate(seller.last_sale_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg per Car:</span>
                      <span className="font-medium">
                        {seller.total_cars_sold > 0
                          ? formatCurrency(seller.total_amount_paid / seller.total_cars_sold)
                          : formatCurrency(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/sellers/${seller.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditSeller(seller)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSeller(seller.id, seller.name)}
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

        {/* Add/Edit Seller Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSeller ? "Edit Seller" : "Add New Seller"}</DialogTitle>
              <DialogDescription>
                {editingSeller ? "Update the seller information" : "Enter the details for the new seller"}
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
                  placeholder="seller@example.com"
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
                <Button type="submit">{editingSeller ? "Update" : "Add"} Seller</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
