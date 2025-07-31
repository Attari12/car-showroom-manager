"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Car,
  AlertCircle,
  Calendar,
  Percent,
  Building2,
} from "lucide-react"

interface InvestorDetail {
  id: string
  name: string
  cnic: string
  phone: string
  email?: string
  address?: string
  total_investment: number
  total_profit: number
  active_investments: number
  completed_investments: number
  roi_percentage: number
  created_at: string
}

interface Investment {
  id: string
  car_make: string
  car_model: string
  car_year: number
  investment_amount: number
  ownership_percentage: number
  status: 'active' | 'sold'
  profit_earned?: number
  sale_date?: string
  created_at: string
}

export default function InvestorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const investorId = params.id as string

  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadInvestorDetails()
  }, [investorId])

  const loadInvestorDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Mock data - replace with actual API calls
      const mockInvestor: InvestorDetail = {
        id: investorId,
        name: "Ahmed Ali",
        cnic: "42101-1234567-1",
        phone: "+92-300-1234567",
        email: "ahmed@example.com",
        address: "Lahore, Pakistan",
        total_investment: 500000,
        total_profit: 75000,
        active_investments: 2,
        completed_investments: 3,
        roi_percentage: 15.0,
        created_at: new Date().toISOString(),
      }

      const mockInvestments: Investment[] = [
        {
          id: "inv-1",
          car_make: "Toyota",
          car_model: "Corolla",
          car_year: 2020,
          investment_amount: 150000,
          ownership_percentage: 60,
          status: "sold",
          profit_earned: 25000,
          sale_date: "2024-01-15",
          created_at: "2023-12-01",
        },
        {
          id: "inv-2",
          car_make: "Honda",
          car_model: "Civic",
          car_year: 2021,
          investment_amount: 200000,
          ownership_percentage: 80,
          status: "active",
          created_at: "2024-01-10",
        },
        {
          id: "inv-3",
          car_make: "Suzuki",
          car_model: "Alto",
          car_year: 2019,
          investment_amount: 150000,
          ownership_percentage: 100,
          status: "sold",
          profit_earned: 50000,
          sale_date: "2024-01-20",
          created_at: "2023-11-15",
        },
      ]

      setInvestor(mockInvestor)
      setInvestments(mockInvestments)
    } catch (error: any) {
      console.error("Error loading investor details:", error)
      setError(`Failed to load investor details: ${error.message}`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !investor) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Investor not found"}</AlertDescription>
        </Alert>
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
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/investors")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Investors
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
                <p className="text-sm text-gray-600">Investor Profile & Investment History</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Investor Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Investor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">CNIC:</span> {investor.cnic}</p>
                  <p><span className="text-gray-600">Phone:</span> {investor.phone}</p>
                  {investor.email && <p><span className="text-gray-600">Email:</span> {investor.email}</p>}
                  {investor.address && <p><span className="text-gray-600">Address:</span> {investor.address}</p>}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Investment Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Total Invested:</span> <span className="font-medium">{formatCurrency(investor.total_investment)}</span></p>
                  <p><span className="text-gray-600">Total Profit:</span> <span className="font-medium text-green-600">{formatCurrency(investor.total_profit)}</span></p>
                  <p><span className="text-gray-600">ROI:</span> <span className="font-medium">{investor.roi_percentage.toFixed(1)}%</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Investment Status</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Active:</span> <span className="font-medium">{investor.active_investments} cars</span></p>
                  <p><span className="text-gray-600">Completed:</span> <span className="font-medium">{investor.completed_investments} cars</span></p>
                  <p><span className="text-gray-600">Member Since:</span> <span className="font-medium">{formatDate(investor.created_at)}</span></p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Avg per Investment:</span> <span className="font-medium">{formatCurrency(investor.total_investment / (investor.active_investments + investor.completed_investments))}</span></p>
                  <p><span className="text-gray-600">Avg Profit:</span> <span className="font-medium">{formatCurrency(investor.total_profit / investor.completed_investments)}</span></p>
                  <p><span className="text-gray-600">Success Rate:</span> <span className="font-medium">100%</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(investor.total_investment)}</div>
              <p className="text-xs text-muted-foreground">Across all cars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(investor.total_profit)}</div>
              <p className="text-xs text-muted-foreground">From completed sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <Percent className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{investor.roi_percentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Return on investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cars</CardTitle>
              <Car className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{investor.active_investments}</div>
              <p className="text-xs text-muted-foreground">Currently invested</p>
            </CardContent>
          </Card>
        </div>

        {/* Investment History */}
        <Card>
          <CardHeader>
            <CardTitle>Investment History</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No investments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {investment.car_make} {investment.car_model} {investment.car_year}
                          </h4>
                          <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                            {investment.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Investment:</span>
                            <div className="font-medium">{formatCurrency(investment.investment_amount)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Ownership:</span>
                            <div className="font-medium">{investment.ownership_percentage}%</div>
                          </div>
                          {investment.status === "sold" && investment.profit_earned && (
                            <div>
                              <span className="text-gray-600">Profit:</span>
                              <div className="font-medium text-green-600">{formatCurrency(investment.profit_earned)}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">{investment.status === "sold" ? "Sold Date:" : "Invested:"}</span>
                            <div className="font-medium">
                              {investment.status === "sold" && investment.sale_date 
                                ? formatDate(investment.sale_date) 
                                : formatDate(investment.created_at)}
                            </div>
                          </div>
                        </div>

                        {investment.status === "sold" && investment.profit_earned && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">ROI for this car:</span>
                              <span className="font-medium text-green-600">
                                {((investment.profit_earned / investment.investment_amount) * 100).toFixed(1)}%
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
      </div>
    </div>
  )
}
