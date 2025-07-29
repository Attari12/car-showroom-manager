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
import { ArrowLeft, Plus, Edit, Trash2, FileText } from "lucide-react"

interface Dealer {
  id: string
  name: string
  cnic: string
  contactNumber: string
  createdAt: string
  totalDeals: number
  totalCommission: number
}

interface DealerDebt {
  id: string
  dealerId: string
  amount: number
  type: "owed_to_client" | "owed_by_client"
  description: string
  createdAt: string
  documents: string[]
  isSettled: boolean
  settledDate?: string
  settledAmount?: number
}

interface CarDeal {
  id: string
  dealerId: string
  carMake: string
  carModel: string
  dealType: "purchase" | "sale"
  commission: number
  date: string
}

export default function DealersPage() {
  // Authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "client") {
      window.location.href = "/"
      return
    }
  }, [])

  const [dealers, setDealers] = useState<Dealer[]>([
    {
      id: "1",
      name: "Kareem Motors",
      cnic: "42101-1234567-1",
      contactNumber: "+92-300-1234567",
      createdAt: "2024-01-15",
      totalDeals: 3,
      totalCommission: 150000,
    },
    {
      id: "2",
      name: "City Auto Dealers",
      cnic: "42101-9876543-2",
      contactNumber: "+92-321-9876543",
      createdAt: "2024-01-18",
      totalDeals: 2,
      totalCommission: 80000,
    },
  ])

  const [dealerDebts, setDealerDebts] = useState<DealerDebt[]>([
    {
      id: "1",
      dealerId: "1",
      amount: 25000,
      type: "owed_to_client",
      description: "Pending commission payment for Toyota Corolla sale",
      createdAt: "2024-01-20",
      documents: [],
      isSettled: false,
    },
    {
      id: "2",
      dealerId: "2",
      amount: 15000,
      type: "owed_by_client",
      description: "Advance commission for upcoming deal",
      createdAt: "2024-01-22",
      documents: [],
      isSettled: true,
      settledDate: "2024-01-25",
      settledAmount: 15000,
    },
  ])

  const [carDeals, setCarDeals] = useState<CarDeal[]>([
    {
      id: "1",
      dealerId: "1",
      carMake: "Toyota",
      carModel: "Corolla",
      dealType: "sale",
      commission: 50000,
      date: "2024-01-18",
    },
    {
      id: "2",
      dealerId: "1",
      carMake: "Honda",
      carModel: "Civic",
      dealType: "purchase",
      commission: 30000,
      date: "2024-01-12",
    },
    {
      id: "3",
      dealerId: "2",
      carMake: "Suzuki",
      carModel: "Alto",
      dealType: "sale",
      commission: 30000,
      date: "2024-01-20",
    },
  ])

  const [newDealer, setNewDealer] = useState({
    name: "",
    cnic: "",
    contactNumber: "",
  })

  const [newDebt, setNewDebt] = useState({
    dealerId: "",
    amount: "",
    type: "owed_to_client" as "owed_to_client" | "owed_by_client",
    description: "",
  })

  const [isAddDealerOpen, setIsAddDealerOpen] = useState(false)
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [debtDocuments, setDebtDocuments] = useState<File[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null)
  const [isEditDealerOpen, setIsEditDealerOpen] = useState(false)

  const [isSettleDebtOpen, setIsSettleDebtOpen] = useState(false)
  const [selectedDebtForSettlement, setSelectedDebtForSettlement] = useState<DealerDebt | null>(null)
  const [settlementData, setSettlementData] = useState({
    settledAmount: "",
    settledDate: "",
    notes: "",
  })

  const handleSettleDebt = () => {
    if (selectedDebtForSettlement && settlementData.settledAmount && settlementData.settledDate) {
      const updatedDebts = dealerDebts.map((debt) =>
        debt.id === selectedDebtForSettlement.id
          ? {
              ...debt,
              isSettled: true,
              settledDate: settlementData.settledDate,
              settledAmount: Number.parseFloat(settlementData.settledAmount),
            }
          : debt,
      )
      setDealerDebts(updatedDebts)
      setSettlementData({ settledAmount: "", settledDate: "", notes: "" })
      setSelectedDebtForSettlement(null)
      setIsSettleDebtOpen(false)
      alert("Debt marked as settled successfully!")
    }
  }

  const filteredDealers = dealers.filter(
    (dealer) =>
      dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.cnic.includes(searchTerm) ||
      dealer.contactNumber.includes(searchTerm),
  )

  const filteredCarDeals = carDeals.filter((deal) => {
    const dealer = dealers.find((d) => d.id === deal.dealerId)
    return (
      dealer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.carMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.carModel.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const filteredDealerDebts = dealerDebts.filter((debt) => {
    const dealer = dealers.find((d) => d.id === debt.dealerId)
    return (
      dealer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleAddDealer = () => {
    if (newDealer.name && newDealer.cnic && newDealer.contactNumber) {
      const dealer: Dealer = {
        id: Date.now().toString(),
        name: newDealer.name,
        cnic: newDealer.cnic,
        contactNumber: newDealer.contactNumber,
        createdAt: new Date().toISOString().split("T")[0],
        totalDeals: 0,
        totalCommission: 0,
      }
      setDealers([...dealers, dealer])
      setNewDealer({ name: "", cnic: "", contactNumber: "" })
      setIsAddDealerOpen(false)
    }
  }

  const handleEditDealer = () => {
    if (editingDealer && newDealer.name && newDealer.cnic && newDealer.contactNumber) {
      const updatedDealers = dealers.map((dealer) =>
        dealer.id === editingDealer.id
          ? { ...dealer, name: newDealer.name, cnic: newDealer.cnic, contactNumber: newDealer.contactNumber }
          : dealer,
      )
      setDealers(updatedDealers)
      setNewDealer({ name: "", cnic: "", contactNumber: "" })
      setEditingDealer(null)
      setIsEditDealerOpen(false)
    }
  }

  const handleAddDebt = () => {
    if (newDebt.dealerId && newDebt.amount && newDebt.description) {
      const debt: DealerDebt = {
        id: Date.now().toString(),
        dealerId: newDebt.dealerId,
        amount: Number.parseFloat(newDebt.amount),
        type: newDebt.type,
        description: newDebt.description,
        createdAt: new Date().toISOString().split("T")[0],
        documents: debtDocuments.map((file) => file.name),
        isSettled: false,
      }
      setDealerDebts([...dealerDebts, debt])
      setNewDebt({ dealerId: "", amount: "", type: "owed_to_client", description: "" })
      setDebtDocuments([])
      setIsAddDebtOpen(false)
    }
  }

  const handleDeleteDealer = (id: string) => {
    setDealers(dealers.filter((dealer) => dealer.id !== id))
    setDealerDebts(dealerDebts.filter((debt) => debt.dealerId !== id))
    setCarDeals(carDeals.filter((deal) => deal.dealerId !== id))
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

  const getDealerDebts = (dealerId: string) => {
    return dealerDebts.filter((debt) => debt.dealerId === dealerId && !debt.isSettled)
  }

  const getDealerDeals = (dealerId: string) => {
    return carDeals.filter((deal) => deal.dealerId === dealerId)
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
            <h1 className="text-2xl font-bold text-gray-900">Dealer Management</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dealers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="deals">Car Deals</TabsTrigger>
            <TabsTrigger value="debts">Debts & Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="dealers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Dealer Profiles</CardTitle>
                    <CardDescription>Manage dealer relationships and commission tracking</CardDescription>
                  </div>
                  <Dialog open={isAddDealerOpen} onOpenChange={setIsAddDealerOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Dealer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Dealer</DialogTitle>
                        <DialogDescription>Create a new dealer profile with contact information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dealer-name">Business Name</Label>
                          <Input
                            id="dealer-name"
                            value={newDealer.name}
                            onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                            placeholder="Enter dealer's business name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dealer-cnic">CNIC</Label>
                          <Input
                            id="dealer-cnic"
                            value={newDealer.cnic}
                            onChange={(e) => setNewDealer({ ...newDealer, cnic: e.target.value })}
                            placeholder="42101-1234567-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dealer-contact">Contact Number</Label>
                          <Input
                            id="dealer-contact"
                            value={newDealer.contactNumber}
                            onChange={(e) => setNewDealer({ ...newDealer, contactNumber: e.target.value })}
                            placeholder="+92-300-1234567"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDealerOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddDealer}>Add Dealer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isEditDealerOpen} onOpenChange={setIsEditDealerOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Dealer</DialogTitle>
                        <DialogDescription>Update dealer profile information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-dealer-name">Business Name</Label>
                          <Input
                            id="edit-dealer-name"
                            value={newDealer.name}
                            onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                            placeholder="Enter dealer's business name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dealer-cnic">CNIC</Label>
                          <Input
                            id="edit-dealer-cnic"
                            value={newDealer.cnic}
                            onChange={(e) => setNewDealer({ ...newDealer, cnic: e.target.value })}
                            placeholder="42101-1234567-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dealer-contact">Contact Number</Label>
                          <Input
                            id="edit-dealer-contact"
                            value={newDealer.contactNumber}
                            onChange={(e) => setNewDealer({ ...newDealer, contactNumber: e.target.value })}
                            placeholder="+92-300-1234567"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditDealerOpen(false)
                            setEditingDealer(null)
                            setNewDealer({ name: "", cnic: "", contactNumber: "" })
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEditDealer}>Update Dealer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Input
                  type="search"
                  placeholder="Search dealers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>CNIC</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Total Deals</TableHead>
                      <TableHead>Total Commission</TableHead>
                      <TableHead>Debts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDealers.map((dealer) => {
                      const dealerDebtsData = getDealerDebts(dealer.id)
                      const totalOwed = dealerDebtsData
                        .filter((debt) => debt.type === "owed_to_client")
                        .reduce((sum, debt) => sum + debt.amount, 0)
                      const totalAdvance = dealerDebtsData
                        .filter((debt) => debt.type === "owed_by_client")
                        .reduce((sum, debt) => sum + debt.amount, 0)

                      return (
                        <TableRow key={dealer.id}>
                          <TableCell className="font-medium">{dealer.name}</TableCell>
                          <TableCell>{dealer.cnic}</TableCell>
                          <TableCell>{dealer.contactNumber}</TableCell>
                          <TableCell>{dealer.totalDeals}</TableCell>
                          <TableCell>{formatCurrency(dealer.totalCommission)}</TableCell>
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
                                onClick={() => {
                                  setEditingDealer(dealer)
                                  setNewDealer({
                                    name: dealer.name,
                                    cnic: dealer.cnic,
                                    contactNumber: dealer.contactNumber,
                                  })
                                  setIsEditDealerOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDealer(dealer.id)}
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

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle>Car Deals History</CardTitle>
                <CardDescription>Track dealer involvement in car purchases and sales</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="search"
                  placeholder="Search car deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Deal Type</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCarDeals.map((deal) => {
                      const dealer = dealers.find((d) => d.id === deal.dealerId)
                      return (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">{dealer?.name || "Unknown"}</TableCell>
                          <TableCell>
                            {deal.carMake} {deal.carModel}
                          </TableCell>
                          <TableCell>
                            <Badge variant={deal.dealType === "sale" ? "default" : "secondary"}>
                              {deal.dealType === "sale" ? "Sale" : "Purchase"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(deal.commission)}</TableCell>
                          <TableCell>{deal.date}</TableCell>
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
                    <CardTitle>Debts & Commissions</CardTitle>
                    <CardDescription>Track outstanding commissions and advances</CardDescription>
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
                        <DialogDescription>Record a new debt or commission payment</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="debt-dealer">Select Dealer</Label>
                          <select
                            id="debt-dealer"
                            value={newDebt.dealerId}
                            onChange={(e) => setNewDebt({ ...newDebt, dealerId: e.target.value })}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a dealer</option>
                            {dealers.map((dealer) => (
                              <option key={dealer.id} value={dealer.id}>
                                {dealer.name} - {dealer.cnic}
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
                            placeholder="50000"
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
                            <option value="owed_to_client">Dealer owes to me</option>
                            <option value="owed_by_client">I owe to dealer</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debt-description">Description</Label>
                          <Textarea
                            id="debt-description"
                            value={newDebt.description}
                            onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                            placeholder="Describe the commission or payment..."
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
                  placeholder="Search debts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDealerDebts.map((debt) => {
                      const dealer = dealers.find((d) => d.id === debt.dealerId)
                      return (
                        <TableRow key={debt.id}>
                          <TableCell className="font-medium">{dealer?.name || "Unknown"}</TableCell>
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
      {/* Settle Debt Dialog */}
      <Dialog open={isSettleDebtOpen} onOpenChange={setIsSettleDebtOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Debt</DialogTitle>
            <DialogDescription>
              {selectedDebtForSettlement && (
                <>
                  Mark debt as settled for {dealers.find((d) => d.id === selectedDebtForSettlement.dealerId)?.name}
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
                placeholder="25000"
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
