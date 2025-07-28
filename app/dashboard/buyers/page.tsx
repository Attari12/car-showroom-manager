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
import { ArrowLeft, Plus, Edit, Trash2, FileText, Eye } from "lucide-react"

interface Buyer {
  id: string
  name: string
  cnic: string
  contactNumber: string
  createdAt: string
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
  // Authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "client") {
      window.location.href = "/"
      return
    }
  }, [])

  const [buyers, setBuyers] = useState<Buyer[]>([
    {
      id: "1",
      name: "Ahmed Ali Khan",
      cnic: "42101-1234567-1",
      contactNumber: "+92-300-1234567",
      createdAt: "2024-01-15",
      totalPurchases: 2,
      totalSpent: 5150000,
    },
    {
      id: "2",
      name: "Sara Malik",
      cnic: "42101-9876543-2",
      contactNumber: "+92-321-9876543",
      createdAt: "2024-01-18",
      totalPurchases: 1,
      totalSpent: 2050000,
    },
  ])

  const [buyerDebts, setBuyerDebts] = useState<BuyerDebt[]>([
    {
      id: "1",
      buyerId: "1",
      amount: 100000,
      type: "owed_to_client",
      description: "Remaining payment for Toyota Corolla",
      createdAt: "2024-01-20",
      documents: [],
      isSettled: false,
    },
    {
      id: "2",
      buyerId: "2",
      amount: 50000,
      type: "owed_by_client",
      description: "Advance payment received",
      createdAt: "2024-01-22",
      documents: [],
      isSettled: true,
      settledDate: "2024-01-24",
      settledAmount: 50000,
    },
  ])

  const [carPurchases, setCarPurchases] = useState<CarPurchase[]>([
    {
      id: "1",
      buyerId: "1",
      carMake: "Toyota",
      carModel: "Corolla",
      carYear: 2020,
      registrationNumber: "LZH-238",
      purchasePrice: 2750000,
      purchaseDate: "2024-01-18",
    },
    {
      id: "2",
      buyerId: "1",
      carMake: "Honda",
      carModel: "City",
      carYear: 2019,
      registrationNumber: "KHI-789",
      purchasePrice: 2400000,
      purchaseDate: "2024-01-10",
    },
    {
      id: "3",
      buyerId: "2",
      carMake: "Suzuki",
      carModel: "Alto",
      carYear: 2021,
      registrationNumber: "ISB-789",
      purchasePrice: 2050000,
      purchaseDate: "2024-01-20",
    },
  ])

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

  const handleAddBuyer = () => {
    if (newBuyer.name && newBuyer.cnic && newBuyer.contactNumber) {
      const buyer: Buyer = {
        id: Date.now().toString(),
        name: newBuyer.name,
        cnic: newBuyer.cnic,
        contactNumber: newBuyer.contactNumber,
        createdAt: new Date().toISOString().split("T")[0],
        totalPurchases: 0,
        totalSpent: 0,
      }
      setBuyers([...buyers, buyer])
      setNewBuyer({ name: "", cnic: "", contactNumber: "" })
      setIsAddBuyerOpen(false)
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

  return (
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
                          <TableCell>{buyer.contactNumber}</TableCell>
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
                                    contactNumber: buyer.contactNumber,
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
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {debt.documents.length} files
                                </Button>
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
  )
}
