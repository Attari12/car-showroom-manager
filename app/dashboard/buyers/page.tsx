"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Edit, Trash2, FileText, Eye, Download, RefreshCw } from "lucide-react"
import { getBuyers, createBuyer, getCars, type Buyer as SupaBuyer, getFileUrl } from "@/lib/supabase-client"
import { ErrorBoundary } from "@/components/error-boundary"
import { NetworkStatus } from "@/components/network-status"

interface Buyer extends SupaBuyer {
  totalPurchases: number
  totalSpent: number
}

interface BuyerDebt {
  id: string
  buyerId: string
  amount: number
  type: "owed_to_client" | "owed_by_client"
  description: string
  createdAt: string
  documents: string[]
  isSettled: boolean // Add this line
  settledDate?: string // Add this line
  settledAmount?: number // Add this line
}

interface CarPurchase {
  id: string
  buyerId: string
  carMake: string
  carModel: string
  carYear: number
  registrationNumber: string
  purchasePrice: number
  purchaseDate: string
}

export default function BuyersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [clientId, setClientId] = useState<string>("")

  // Authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const storedClientId = localStorage.getItem("clientId")

    if (userType !== "client" || !storedClientId) {
      window.location.href = "/"
      return
    }

    setClientId(storedClientId)
    loadBuyers(storedClientId)
  }, [])

  const [buyers, setBuyers] = useState<Buyer[]>([])

  const loadBuyers = async (clientId: string, retries = 3) => {
    try {
      setLoading(true)
      setError("")

      // Load buyers and cars in parallel with retry logic
      let buyersData, carsData;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          [buyersData, carsData] = await Promise.all([
            getBuyers(clientId),
            getCars(clientId)
          ]);
          break; // Success, exit retry loop
        } catch (fetchError: any) {
          if (attempt === retries) {
            throw fetchError; // Last attempt, re-throw error
          }
          console.warn(`Fetch attempt ${attempt} failed, retrying...`, fetchError.message);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      // Consolidate buyers by CNIC (to handle duplicates)
      const buyerMap = new Map<string, Buyer>()

      buyersData.forEach(buyer => {
        const existingBuyer = buyerMap.get(buyer.cnic)

        if (existingBuyer) {
          // If we already have a buyer with this CNIC, keep the most recent one
          // but preserve the original ID for database consistency
          if (new Date(buyer.created_at) > new Date(existingBuyer.created_at)) {
            buyerMap.set(buyer.cnic, {
              ...buyer,
              totalPurchases: 0,
              totalSpent: 0,
            })
          }
        } else {
          // First time seeing this CNIC
          buyerMap.set(buyer.cnic, {
            ...buyer,
            totalPurchases: 0,
            totalSpent: 0,
          })
        }
      })

      // Calculate purchase statistics for each consolidated buyer
      const transformedBuyers: Buyer[] = Array.from(buyerMap.values()).map(buyer => {
        // Find all buyers with the same CNIC to get all their purchases
        const allBuyersWithSameCnic = buyersData.filter(b => b.cnic === buyer.cnic)
        const allBuyerIds = allBuyersWithSameCnic.map(b => b.id)

        // Find cars purchased by any buyer with this CNIC
        const buyerCars = carsData.filter(car =>
          allBuyerIds.includes(car.buyer_id || '') && car.status === "sold"
        )

        // Calculate total purchases and total spent
        const totalPurchases = buyerCars.length
        const totalSpent = buyerCars.reduce((sum, car) => sum + car.asking_price, 0)

        return {
          ...buyer,
          totalPurchases,
          totalSpent,
        }
      })

      // Also update car purchases data for the purchases tab (consolidate by CNIC)
      const allCarPurchases: CarPurchase[] = carsData
        .filter(car => car.buyer_id && car.status === "sold")
        .map(car => {
          // Find the buyer info for this car
          const carBuyer = buyersData.find(b => b.id === car.buyer_id)
          if (!carBuyer) return null

          // Find the consolidated buyer with the same CNIC
          const consolidatedBuyer = transformedBuyers.find(b => b.cnic === carBuyer.cnic)

          return {
            id: car.id,
            buyerId: consolidatedBuyer?.id || car.buyer_id!,
            carMake: car.make,
            carModel: car.model,
            carYear: car.year,
            registrationNumber: car.registration_number,
            purchasePrice: car.asking_price, // This is the sold price
            purchaseDate: car.updated_at.split('T')[0], // Sale date
          }
        })
        .filter(purchase => purchase !== null) as CarPurchase[]

      setBuyers(transformedBuyers)
      setCarPurchases(allCarPurchases)
    } catch (error: any) {
      console.error("Error loading buyers:", error)
      // Provide more specific error messages
      if (error.message?.includes('Failed to fetch')) {
        setError('Network connection issue. Please check your internet connection and try again.')
      } else if (error.message?.includes('timeout')) {
        setError('Request timed out. Please try again.')
      } else {
        setError(`Failed to load buyers: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const [buyerDebts, setBuyerDebts] = useState<BuyerDebt[]>([])

  const [carPurchases, setCarPurchases] = useState<CarPurchase[]>([])

  const [newBuyer, setNewBuyer] = useState({
    name: "",
    cnic: "",
    contactNumber: "",
  })

  const [newDebt, setNewDebt] = useState({
    buyerId: "",
    amount: "",
    type: "owed_to_client" as "owed_to_client" | "owed_by_client",
    description: "",
  })

  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isEditBuyerOpen, setIsEditBuyerOpen] = useState(false)
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null)
  const [debtDocuments, setDebtDocuments] = useState<File[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [isSettleDebtOpen, setIsSettleDebtOpen] = useState(false)
  const [selectedDebtForSettlement, setSelectedDebtForSettlement] = useState<BuyerDebt | null>(null)
  const [settlementData, setSettlementData] = useState({
    settledAmount: "",
    settledDate: "",
    notes: "",
  })

  const handleSettleDebt = () => {
    if (selectedDebtForSettlement && settlementData.settledAmount && settlementData.settledDate) {
      const updatedDebts = buyerDebts.map((debt) =>
        debt.id === selectedDebtForSettlement.id
          ? {
              ...debt,
              isSettled: true,
              settledDate: settlementData.settledDate,
              settledAmount: Number.parseFloat(settlementData.settledAmount),
            }
          : debt,
      )
      setBuyerDebts(updatedDebts)
      setSettlementData({ settledAmount: "", settledDate: "", notes: "" })
      setSelectedDebtForSettlement(null)
      setIsSettleDebtOpen(false)
      alert("Debt marked as settled successfully!")
    }
  }

  const filteredBuyers = buyers.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.cnic.includes(searchTerm) ||
      buyer.contactNumber.includes(searchTerm),
  )

  const filteredCarPurchases = carPurchases.filter((purchase) => {
    const buyer = buyers.find((b) => b.id === purchase.buyerId)
    return (
      buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.carMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const filteredBuyerDebts = buyerDebts.filter((debt) => {
    const buyer = buyers.find((b) => b.id === debt.buyerId)
    return (
      buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleAddBuyer = async () => {
    if (newBuyer.name && newBuyer.cnic && newBuyer.contactNumber) {
      try {
        setError("")
        setSuccess("")

        const buyer = await createBuyer({
          client_id: clientId,
          name: newBuyer.name,
          cnic: newBuyer.cnic,
          phone: newBuyer.contactNumber,
          email: "", // Will be empty for now
          address: "", // Will be empty for now
        })

        setSuccess(`Buyer "${newBuyer.name}" added successfully!`)
        setNewBuyer({ name: "", cnic: "", contactNumber: "" })
        setIsAddBuyerOpen(false)
        await loadBuyers(clientId)
      } catch (error: any) {
        console.error("Error adding buyer:", error)
        setError(`Failed to add buyer: ${error.message}`)
      }
    }
  }

  const handleEditBuyer = () => {
    if (editingBuyer && newBuyer.name && newBuyer.cnic && newBuyer.contactNumber) {
      const updatedBuyers = buyers.map((buyer) =>
        buyer.id === editingBuyer.id
          ? { ...buyer, name: newBuyer.name, cnic: newBuyer.cnic, contactNumber: newBuyer.contactNumber }
          : buyer,
      )
      setBuyers(updatedBuyers)
      setNewBuyer({ name: "", cnic: "", contactNumber: "" })
      setEditingBuyer(null)
      setIsEditBuyerOpen(false)
    }
  }

  const handleAddDebt = () => {
    if (newDebt.buyerId && newDebt.amount && newDebt.description) {
      const debt: BuyerDebt = {
        id: Date.now().toString(),
        buyerId: newDebt.buyerId,
        amount: Number.parseFloat(newDebt.amount),
        type: newDebt.type,
        description: newDebt.description,
        createdAt: new Date().toISOString().split("T")[0],
        documents: debtDocuments.map((file) => file.name),
        isSettled: false,
      }
      setBuyerDebts([...buyerDebts, debt])
      setNewDebt({ buyerId: "", amount: "", type: "owed_to_client", description: "" })
      setDebtDocuments([])
      setIsAddDebtOpen(false)
    }
  }

  const handleDeleteBuyer = (id: string) => {
    setBuyers(buyers.filter((buyer) => buyer.id !== id))
    setBuyerDebts(buyerDebts.filter((debt) => debt.buyerId !== id))
    setCarPurchases(carPurchases.filter((purchase) => purchase.buyerId !== id))
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDebtDocuments([...debtDocuments, ...Array.from(e.target.files)])
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getBuyerDebts = (buyerId: string) => {
    return buyerDebts.filter((debt) => debt.buyerId === buyerId && !debt.isSettled)
  }

  const getBuyerPurchases = (buyerId: string) => {
    return carPurchases.filter((purchase) => purchase.buyerId === buyerId)
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      // Check if URL is valid
      if (!url || url === "/placeholder.svg") {
        alert("File not available for download.")
        return
      }

      // Try direct download first (works for most cases)
      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      } catch (fetchError) {
        console.warn("Fetch download failed, trying alternative method:", fetchError)

        // Fallback: Direct link download (works for public URLs)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log("Download initiated using fallback method")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Error downloading file. The file may not exist or is not accessible.")
    }
  }

  const viewFile = (url: string, filename?: string) => {
    try {
      // Check if URL is valid
      if (!url || url === "/placeholder.svg") {
        alert("File not available for viewing.")
        return
      }

      // Get file extension to determine how to handle the file
      const fileExtension = filename ? filename.split('.').pop()?.toLowerCase() : ''

      // Handle different file types
      if (fileExtension && ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
        // These files can be viewed directly in browser
        const newWindow = window.open(url, "_blank")
        if (!newWindow) {
          // Popup blocked, try alternative method
          const link = document.createElement("a")
          link.href = url
          link.target = "_blank"
          link.rel = "noopener noreferrer"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        // For other file types, offer to download instead
        if (confirm(`This file type (${fileExtension || 'unknown'}) cannot be previewed in browser. Would you like to download it instead?`)) {
          downloadFile(url, filename || 'document')
        }
      }
    } catch (error) {
      console.error("Error viewing file:", error)
      alert("Error opening file. The file may not exist or is not accessible.")
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Buyer Management</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Status */}
        <NetworkStatus />

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            {error.includes('Network') && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadBuyers(clientId)}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry Loading
                </Button>
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="buyers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="purchases">Car Purchases</TabsTrigger>
            <TabsTrigger value="debts">Debts & Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="buyers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Buyer Profiles</CardTitle>
                    <CardDescription>Manage customer information and purchase history</CardDescription>
                  </div>
                  <Dialog open={isAddBuyerOpen} onOpenChange={setIsAddBuyerOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Buyer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Buyer</DialogTitle>
                        <DialogDescription>Create a new buyer profile with contact information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buyer-name">Full Name</Label>
                          <Input
                            id="buyer-name"
                            value={newBuyer.name}
                            onChange={(e) => setNewBuyer({ ...newBuyer, name: e.target.value })}
                            placeholder="Enter buyer's full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buyer-cnic">CNIC</Label>
                          <Input
                            id="buyer-cnic"
                            value={newBuyer.cnic}
                            onChange={(e) => setNewBuyer({ ...newBuyer, cnic: e.target.value })}
                            placeholder="42101-1234567-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buyer-contact">Contact Number</Label>
                          <Input
                            id="buyer-contact"
                            value={newBuyer.contactNumber}
                            onChange={(e) => setNewBuyer({ ...newBuyer, contactNumber: e.target.value })}
                            placeholder="+92-300-1234567"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddBuyerOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddBuyer}>Add Buyer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Input
                  type="search"
                  placeholder="Search buyers by name, CNIC, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>CNIC</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Debts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuyers.map((buyer) => {
                      const buyerDebtsData = getBuyerDebts(buyer.id)
                      const totalOwed = buyerDebtsData
                        .filter((debt) => debt.type === "owed_to_client")
                        .reduce((sum, debt) => sum + debt.amount, 0)
                      const totalAdvance = buyerDebtsData
                        .filter((debt) => debt.type === "owed_by_client")
                        .reduce((sum, debt) => sum + debt.amount, 0)

                      return (
                        <TableRow key={buyer.id}>
                          <TableCell className="font-medium">{buyer.name}</TableCell>
                          <TableCell>{buyer.cnic}</TableCell>
                          <TableCell>{buyer.phone}</TableCell>
                          <TableCell>{buyer.totalPurchases}</TableCell>
                          <TableCell>{formatCurrency(buyer.totalSpent)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {totalOwed > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Owes: {formatCurrency(totalOwed)}
                                </Badge>
                              )}
                              {totalAdvance > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  Advance: {formatCurrency(totalAdvance)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => (window.location.href = `/dashboard/buyers/${buyer.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingBuyer(buyer)
                                  setNewBuyer({
                                    name: buyer.name,
                                    cnic: buyer.cnic,
                                    contactNumber: buyer.phone,
                                  })
                                  setIsEditBuyerOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBuyer(buyer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>Car Purchase History</CardTitle>
                <CardDescription>Track all car purchases by buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="search"
                  placeholder="Search purchases by buyer, car make, model, or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Purchase Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCarPurchases.map((purchase) => {
                      const buyer = buyers.find((b) => b.id === purchase.buyerId)
                      return (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">{buyer?.name || "Unknown"}</TableCell>
                          <TableCell>
                            {purchase.carMake} {purchase.carModel}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{purchase.registrationNumber}</Badge>
                          </TableCell>
                          <TableCell>{purchase.carYear}</TableCell>
                          <TableCell>{formatCurrency(purchase.purchasePrice)}</TableCell>
                          <TableCell>{purchase.purchaseDate}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Debts & Payments</CardTitle>
                    <CardDescription>Track outstanding payments and advances</CardDescription>
                  </div>
                  <Dialog open={isAddDebtOpen} onOpenChange={setIsAddDebtOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Debt Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Debt Record</DialogTitle>
                        <DialogDescription>Record a new debt or payment</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="debt-buyer">Select Buyer</Label>
                          <select
                            id="debt-buyer"
                            value={newDebt.buyerId}
                            onChange={(e) => setNewDebt({ ...newDebt, buyerId: e.target.value })}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a buyer</option>
                            {buyers.map((buyer) => (
                              <option key={buyer.id} value={buyer.id}>
                                {buyer.name} - {buyer.cnic}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debt-amount">Amount (PKR)</Label>
                          <Input
                            id="debt-amount"
                            type="number"
                            value={newDebt.amount}
                            onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                            placeholder="100000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debt-type">Debt Type</Label>
                          <select
                            id="debt-type"
                            value={newDebt.type}
                            onChange={(e) =>
                              setNewDebt({ ...newDebt, type: e.target.value as "owed_to_client" | "owed_by_client" })
                            }
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="owed_to_client">Buyer owes to me</option>
                            <option value="owed_by_client">I owe to buyer</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debt-description">Description</Label>
                          <Textarea
                            id="debt-description"
                            value={newDebt.description}
                            onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                            placeholder="Describe the payment or debt..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Proof Documents</Label>
                          <Input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentUpload} />
                          {debtDocuments.length > 0 && (
                            <div className="text-sm text-gray-600">{debtDocuments.length} document(s) selected</div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDebtOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddDebt}>Add Debt Record</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Input
                  type="search"
                  placeholder="Search debts by buyer or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Documents</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuyerDebts.map((debt) => {
                      const buyer = buyers.find((b) => b.id === debt.buyerId)
                      return (
                        <TableRow key={debt.id}>
                          <TableCell className="font-medium">{buyer?.name || "Unknown"}</TableCell>
                          <TableCell>{formatCurrency(debt.amount)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={debt.type === "owed_to_client" ? "destructive" : "secondary"}>
                                {debt.type === "owed_to_client" ? "Owes to me" : "I owe"}
                              </Badge>
                              {debt.isSettled && (
                                <Badge variant="outline" className="text-green-600">
                                  Settled
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{debt.description}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Created: {debt.createdAt}</div>
                              {debt.isSettled && debt.settledDate && (
                                <div className="text-green-600">Settled: {debt.settledDate}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {debt.documents.length > 0 ? (
                                <div className="flex gap-1">
                                  {debt.documents.map((docPath, index) => {
                                    const docUrl = getFileUrl("debt-documents", docPath)
                                    const docName = docPath.split("/").pop() || `Document ${index + 1}`
                                    return (
                                      <div key={index} className="flex gap-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => viewFile(docUrl, docName)}
                                          title="View File"
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => downloadFile(docUrl, docName)}
                                          title="Download File"
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    )
                                  })}
                                  {debt.documents.length > 1 && (
                                    <span className="text-sm text-gray-500 self-center ml-2">
                                      {debt.documents.length} files
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">No documents</span>
                              )}
                              {!debt.isSettled && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDebtForSettlement(debt)
                                    setSettlementData({
                                      settledAmount: debt.amount.toString(),
                                      settledDate: new Date().toISOString().split("T")[0],
                                      notes: "",
                                    })
                                    setIsSettleDebtOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Settle
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Buyer Dialog */}
      <Dialog open={isEditBuyerOpen} onOpenChange={setIsEditBuyerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Buyer</DialogTitle>
            <DialogDescription>Update buyer profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-buyer-name">Full Name</Label>
              <Input
                id="edit-buyer-name"
                value={newBuyer.name}
                onChange={(e) => setNewBuyer({ ...newBuyer, name: e.target.value })}
                placeholder="Enter buyer's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-buyer-cnic">CNIC</Label>
              <Input
                id="edit-buyer-cnic"
                value={newBuyer.cnic}
                onChange={(e) => setNewBuyer({ ...newBuyer, cnic: e.target.value })}
                placeholder="42101-1234567-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-buyer-contact">Contact Number</Label>
              <Input
                id="edit-buyer-contact"
                value={newBuyer.contactNumber}
                onChange={(e) => setNewBuyer({ ...newBuyer, contactNumber: e.target.value })}
                placeholder="+92-300-1234567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditBuyerOpen(false)
                setEditingBuyer(null)
                setNewBuyer({ name: "", cnic: "", contactNumber: "" })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditBuyer}>Update Buyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settle Debt Dialog */}
      <Dialog open={isSettleDebtOpen} onOpenChange={setIsSettleDebtOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Debt</DialogTitle>
            <DialogDescription>
              {selectedDebtForSettlement && (
                <>
                  Mark debt as settled for {buyers.find((b) => b.id === selectedDebtForSettlement.buyerId)?.name}
                  <br />
                  Original Amount: {formatCurrency(selectedDebtForSettlement.amount)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settled-amount">Settled Amount (PKR)</Label>
              <Input
                id="settled-amount"
                type="number"
                value={settlementData.settledAmount}
                onChange={(e) => setSettlementData({ ...settlementData, settledAmount: e.target.value })}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settled-date">Settlement Date</Label>
              <Input
                id="settled-date"
                type="date"
                value={settlementData.settledDate}
                onChange={(e) => setSettlementData({ ...settlementData, settledDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settlement-notes">Notes (Optional)</Label>
              <Input
                id="settlement-notes"
                value={settlementData.notes}
                onChange={(e) => setSettlementData({ ...settlementData, notes: e.target.value })}
                placeholder="Payment method, reference number, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSettleDebtOpen(false)
                setSelectedDebtForSettlement(null)
                setSettlementData({ settledAmount: "", settledDate: "", notes: "" })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSettleDebt} className="bg-green-600 hover:bg-green-700">
              Mark as Settled
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </ErrorBoundary>
  )
}
