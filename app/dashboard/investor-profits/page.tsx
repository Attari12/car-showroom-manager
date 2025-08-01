"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Eye, 
  AlertCircle, 
  ArrowLeft,
  Car,
  Percent,
  Calendar
} from "lucide-react"
import { getCars, getCarInvestments, type Car as CarType } from "@/lib/supabase-client"
import { calculateProfitDistribution } from "@/lib/profit-calculations"

interface InvestorProfitDetail {
  investorId: string
  investorName: string
  totalProfit: number
  totalInvestment: number
  carsCount: number
  cars: Array<{
    car: CarType
    investmentAmount: number
    profitShare: number
    ownershipPercentage: number
  }>
}

export default function InvestorProfitsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [clientId, setClientId] = useState<string>("")
  const [investorDetails, setInvestorDetails] = useState<InvestorProfitDetail[]>([])
  const [totalInvestorProfit, setTotalInvestorProfit] = useState(0)

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId")
    const userType = localStorage.getItem("userType")

    if (!storedClientId || userType !== "client") {
      router.push("/")
      return
    }

    setClientId(storedClientId)
    loadInvestorProfits(storedClientId)
  }, [router])

  const loadInvestorProfits = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")
      
      // Get all sold cars
      const carsData = await getCars(clientId)
      const soldCars = carsData.filter((car) => car.status === "sold")

      const investorMap = new Map<string, InvestorProfitDetail>()
      let totalProfit = 0

      for (const car of soldCars) {
        try {
          // Get car investments
          const investments = await getCarInvestments(car.id)
          
          if (investments.length === 0) continue

          // Get money spent from description
          let moneySpent = 0
          if (car.description) {
            const moneySpentMatch = car.description.match(/Money spent on car: ₨([\d,]+)/i)
            if (moneySpentMatch) {
              moneySpent = parseFloat(moneySpentMatch[1].replace(/,/g, '')) || 0
            }
          }

          // Create profit distribution data
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

          // Process each investor's share
          for (const investorShare of distribution.investor_shares) {
            const investorId = investorShare.investor_id || investorShare.investor_name
            const investorName = investorShare.investor_name || 'Unknown'

            if (!investorMap.has(investorId)) {
              investorMap.set(investorId, {
                investorId,
                investorName,
                totalProfit: 0,
                totalInvestment: 0,
                carsCount: 0,
                cars: []
              })
            }

            const investorDetail = investorMap.get(investorId)!
            const investment = investments.find(inv => 
              inv.investor_id === investorId || inv.investor?.name === investorName
            )

            investorDetail.totalProfit += investorShare.profit_share
            investorDetail.totalInvestment += investment?.investment_amount || 0
            investorDetail.carsCount += 1
            investorDetail.cars.push({
              car,
              investmentAmount: investment?.investment_amount || 0,
              profitShare: investorShare.profit_share,
              ownershipPercentage: investorShare.ownership_percentage
            })

            totalProfit += investorShare.profit_share
          }
        } catch (error) {
          console.error(`Error processing car ${car.id}:`, error)
        }
      }

      const investorDetailsList = Array.from(investorMap.values())
        .sort((a, b) => b.totalProfit - a.totalProfit)

      setInvestorDetails(investorDetailsList)
      setTotalInvestorProfit(totalProfit)
    } catch (error: any) {
      console.error("Error loading investor profits:", error)
      setError(`Failed to load investor profits: ${error.message}`)
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

  const calculateROI = (profit: number, investment: number) => {
    if (investment === 0) return 0
    return ((profit / investment) * 100).toFixed(1)
  }

  const filteredInvestors = investorDetails.filter((investor) =>
    investor.investorName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investor Profits</h1>
                <p className="text-sm text-gray-600">Detailed breakdown of investor earnings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investor Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalInvestorProfit)}</div>
              <p className="text-xs text-muted-foreground">From all sold cars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{investorDetails.length}</div>
              <p className="text-xs text-muted-foreground">With profit earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(investorDetails.length > 0 ? totalInvestorProfit / investorDetails.length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per investor</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search investors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Investor Details */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading investor profits...</span>
          </div>
        ) : filteredInvestors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {investorDetails.length === 0 ? "No investor profits found" : "No investors match your search"}
              </h3>
              <p className="text-gray-600">
                {investorDetails.length === 0
                  ? "Investor profits will appear here once cars with investor partnerships are sold."
                  : "Try adjusting your search terms."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredInvestors.map((investor) => (
              <Card key={investor.investorId} className="overflow-hidden">
                <CardHeader className="bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-orange-900">{investor.investorName}</CardTitle>
                      <p className="text-sm text-orange-700">{investor.carsCount} cars invested</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(investor.totalProfit)}
                      </div>
                      <div className="text-sm text-orange-700">
                        ROI: {calculateROI(investor.totalProfit, investor.totalInvestment)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Total Investment</span>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-lg font-semibold text-blue-900">
                        {formatCurrency(investor.totalInvestment)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Total Profit</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-lg font-semibold text-green-900">
                        {formatCurrency(investor.totalProfit)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">Return on Investment</span>
                        <Percent className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-lg font-semibold text-purple-900">
                        {calculateROI(investor.totalProfit, investor.totalInvestment)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Car Details:</h4>
                    {investor.cars.map((carDetail, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Car className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {carDetail.car.make} {carDetail.car.model} {carDetail.car.year}
                            </span>
                            <Badge variant="secondary">{carDetail.car.registration_number}</Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/cars/${carDetail.car.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Investment:</span>
                            <div className="font-medium">{formatCurrency(carDetail.investmentAmount)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Ownership:</span>
                            <div className="font-medium">{carDetail.ownershipPercentage.toFixed(1)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Profit Share:</span>
                            <div className="font-medium text-green-600">
                              +{formatCurrency(carDetail.profitShare)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Sold Date:</span>
                            <div className="font-medium">
                              {new Date(carDetail.car.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
