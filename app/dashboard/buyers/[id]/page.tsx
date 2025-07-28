"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Car, DollarSign, Calendar, FileText } from "lucide-react"

interface Buyer {
  id: string
  name: string
  cnic: string
  contactNumber: string
  createdAt: string
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
  // Authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "client") {
      window.location.href = "/"
      return
    }
  }, [])

  // Sample data - in real app, fetch based on params.id
  const [buyer] = useState<Buyer>({
    id: "1",
    name: "Ahmed Ali Khan",
    cnic: "42101-1234567-1",
    contactNumber: "+92-300-1234567",
    createdAt: "2024-01-15",
  })

  const [carPurchases] = useState<CarPurchase[]>([
    {
      id: "1",
      buyerId: "1",
      carId: "car1",
      carMake: "Toyota",
      carModel: "Corolla",
      carYear: 2020,
      purchasePrice: 2500000,
      soldPrice: 2750000,
      purchaseDate: "2024-01-18",
      profit: 200000, // After dealer commission
    },
    {
      id: "2",
      buyerId: "1",
      carId: "car2",
      carMake: "Honda",
      carModel: "City",
      carYear: 2019,
      purchasePrice: 2200000,
      soldPrice: 2400000,
      purchaseDate: "2024-01-10",
      profit: 170000, // After dealer commission
    },
  ])

  const [debts] = useState<Debt[]>([
    {
      id: "1",
      buyerId: "1",
      amount: 100000,
      type: "owed_to_client",
      description: "Remaining payment for Toyota Corolla",
      createdAt: "2024-01-20",
      documents: ["receipt_001.pdf"],
    },
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalPurchaseValue = carPurchases.reduce((sum, purchase) => sum + purchase.soldPrice, 0)
  const totalProfit = carPurchases.reduce((sum, purchase) => sum + purchase.profit, 0)
  const totalOwed = debts.filter((debt) => debt.type === "owed_to_client").reduce((sum, debt) => sum + debt.amount, 0)
  const totalAdvance = debts
    .filter((debt) => debt.type === "owed_by_client")
    .reduce((sum, debt) => sum + debt.amount, 0)

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
                <p className="text-lg font-semibold">{buyer.contactNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Customer Since</Label>
                <p className="text-lg font-semibold">{buyer.createdAt}</p>
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
              <div className="text-2xl font-bold">{carPurchases.length}</div>
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
                  <TableHead>Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {purchase.carMake} {purchase.carModel}
                          </p>
                          <p className="text-sm text-gray-500">Car ID: {purchase.carId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.carYear}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(purchase.purchasePrice)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(purchase.soldPrice)}</TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">{formatCurrency(purchase.profit)}</span>
                    </TableCell>
                    <TableCell>{purchase.purchaseDate}</TableCell>
                  </TableRow>
                ))}
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
