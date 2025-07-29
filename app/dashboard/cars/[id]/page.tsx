"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Car, DollarSign, FileText, MessageCircle, Download, Edit, Gauge, AlertCircle } from "lucide-react"
import { getCarById, getFileUrl, type Car as CarType } from "@/lib/supabase-client"

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<CarType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "client") {
      window.location.href = "/"
      return
    }

    loadCarDetails()
  }, [])

  const loadCarDetails = async () => {
    try {
      setLoading(true)
      setError("")
      const carData = await getCarById(params.id)
      setCar(carData)
    } catch (error: any) {
      console.error("Error loading car details:", error)
      setError(`Failed to load car details: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading car details...</span>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Car Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The requested car could not be found."}</p>
            <Button onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateProfit = () => {
    if (car.status === "sold") {
      return car.asking_price - car.purchase_price - (car.dealer_commission || 0)
    }
    return 0
  }

  const shareOnWhatsApp = (content: string, type: "text" | "image" | "document" = "text") => {
    let message = ""

    if (type === "text") {
      message =
        `🚗 *${car.make} ${car.model} ${car.year}*\n\n` +
        `💰 *Price:* ${formatCurrency(car.asking_price)}\n` +
        `📅 *Year:* ${car.year}\n` +
        `🛣️ *Mileage:* ${car.mileage.toLocaleString()} km\n` +
        `👤 *Owner:* ${car.owner_name}\n` +
        `📋 *Status:* ${car.status === "available" ? "Available" : "Sold"}\n\n` +
        `📝 *Description:* ${car.description || "No description available"}\n\n` +
        `Contact us for more details!`
    } else if (type === "image") {
      message =
        `🚗 *${car.make} ${car.model} ${car.year}* - Car Image\n\n` +
        `💰 Price: ${formatCurrency(car.asking_price)}\n` +
        `🛣️ Mileage: ${car.mileage.toLocaleString()} km\n` +
        `Contact us for more details!`
    } else if (type === "document") {
      message =
        `📄 *${content}* - ${car.make} ${car.model} ${car.year}\n\n` +
        `🛣️ Mileage: ${car.mileage.toLocaleString()} km\n` +
        `Document shared for your reference.\n` +
        `Contact us for more details!`
    }

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const generateAuctionSheetPDF = () => {
    const auctionSheetContent = `
🚗 AUCTION SHEET
================

Car Details:
• Make & Model: ${car.make} ${car.model} ${car.year}
• Registration: ${car.registration_number}
• Mileage: ${car.mileage.toLocaleString()} km
• Owner: ${car.owner_name}
• Purchase Date: ${car.purchase_date}
• Purchase Price: ${formatCurrency(car.purchase_price)}
• Asking Price: ${formatCurrency(car.asking_price)}
• Status: ${car.status}

${
  car.status === "sold"
    ? `
Sale Information:
• Sold Price: ${formatCurrency(car.asking_price)}
• Profit: ${formatCurrency(calculateProfit())}
• Commission: ${formatCurrency(car.dealer_commission || 0)}
`
    : ""
}

Description:
${car.description || "No description available"}

Generated on: ${new Date().toLocaleDateString()}
`

    // Create a blob with the content
    const blob = new Blob([auctionSheetContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `auction-sheet-${car.make}-${car.model}-${car.registration_number}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const shareImageOnWhatsApp = (imageUrl: string, imageName: string) => {
    const message =
      `🚗 *${car.make} ${car.model} ${car.year}* - ${imageName}\n\n` +
      `💰 Price: ${formatCurrency(car.asking_price)}\n` +
      `📅 Year: ${car.year}\n` +
      `🛣️ Mileage: ${car.mileage.toLocaleString()} km\n\n` +
      `Contact us for more details!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Error downloading file. Please try again.")
    }
  }

  const viewFile = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {car.make} {car.model} {car.year} ({car.registration_number})
                </h1>
                <p className="text-sm text-gray-600">Car Details & Documentation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => shareOnWhatsApp("", "text")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Car Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mileage</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{car.mileage.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Kilometers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchase Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(car.purchase_price)}</div>
              <p className="text-xs text-muted-foreground">Original cost</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {car.status === "sold" ? "Sold Price" : "Asking Price"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(car.asking_price)}</div>
              <p className="text-xs text-muted-foreground">
                {car.status === "sold" ? "Final sale price" : "Current asking price"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {car.status === "sold" ? formatCurrency(calculateProfit()) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {car.dealer_commission ? `After ₨${car.dealer_commission.toLocaleString()} commission` : "Net profit"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={car.status === "available" ? "default" : "secondary"} className="text-lg px-3 py-1">
                  {car.status === "available" ? "Available" : car.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {car.status === "sold" ? `Sold on ${car.updated_at.split("T")[0]}` : "Ready for sale"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="condition">Auction Sheet</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Car Information</CardTitle>
                <CardDescription>Detailed specifications and history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Make & Model</Label>
                      <p className="text-lg font-semibold">
                        {car.make} {car.model}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Registration Number</Label>
                      <p className="text-lg font-semibold">{car.registration_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Year</Label>
                      <p className="text-lg font-semibold">{car.year}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Mileage</Label>
                      <p className="text-lg font-semibold">{car.mileage.toLocaleString()} km</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Previous Owner</Label>
                      <p className="text-lg font-semibold">{car.owner_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Purchase Date</Label>
                      <p className="text-lg font-semibold">{car.purchase_date}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Purchase Price</Label>
                      <p className="text-lg font-semibold">{formatCurrency(car.purchase_price)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Asking Price</Label>
                      <p className="text-lg font-semibold">{formatCurrency(car.asking_price)}</p>
                    </div>
                    {car.status === "sold" && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Sold Price</Label>
                          <p className="text-lg font-semibold">{formatCurrency(car.asking_price)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Profit</Label>
                          <p className="text-lg font-semibold text-green-600">{formatCurrency(calculateProfit())}</p>
                        </div>
                      </>
                    )}
                    {car.dealer_commission && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Dealer Commission</Label>
                        <p className="text-lg font-semibold">{formatCurrency(car.dealer_commission)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {car.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-base mt-2 p-4 bg-gray-50 rounded-lg">{car.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Car Images</CardTitle>
                <CardDescription>Photo gallery of the vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                {car.images && car.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {car.images.map((imagePath, index) => {
                      const imageUrl = getFileUrl("car-images", imagePath)
                      return (
                        <Card key={index} className="overflow-hidden">
                          <div className="aspect-video relative">
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={`Car image ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => viewFile(imageUrl)}
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => shareImageOnWhatsApp(imageUrl, `Image ${index + 1}`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                WhatsApp
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => downloadFile(imageUrl, `car-image-${index + 1}.jpg`)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Available</h3>
                    <p className="text-gray-600">No images were uploaded for this car.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Legal documents and certificates</CardDescription>
              </CardHeader>
              <CardContent>
                {car.documents && car.documents.length > 0 ? (
                  <div className="space-y-4">
                    {car.documents.map((docPath, index) => {
                      const docUrl = getFileUrl("car-documents", docPath)
                      const docName = docPath.split("/").pop() || `Document ${index + 1}`
                      const fileExtension = docName.split(".").pop()?.toLowerCase() || "file"

                      return (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{docName}</p>
                                  <p className="text-sm text-gray-500">{fileExtension.toUpperCase()} Document</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => viewFile(docUrl)}>
                                  <FileText className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => shareOnWhatsApp(docName, "document")}
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  WhatsApp
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => downloadFile(docUrl, docName)}>
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                    <p className="text-gray-600">No documents were uploaded for this car.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="condition">
            <Card>
              <CardHeader>
                <CardTitle>Auction Sheet & Car Information</CardTitle>
                <CardDescription>Detailed car information and documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Car Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{car.year}</p>
                      <p className="text-sm text-gray-600">Model Year</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">{car.mileage.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">KM Mileage</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">{formatCurrency(car.purchase_price)}</p>
                      <p className="text-sm text-gray-600">Purchase Price</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-orange-600">{formatCurrency(car.asking_price)}</p>
                      <p className="text-sm text-gray-600">Asking Price</p>
                    </div>
                  </div>
                </div>

                {/* Car Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make & Model:</span>
                        <span className="font-medium">
                          {car.make} {car.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration:</span>
                        <span className="font-medium">{car.registration_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Previous Owner:</span>
                        <span className="font-medium">{car.owner_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Date:</span>
                        <span className="font-medium">{car.purchase_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Financial Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Price:</span>
                        <span className="font-medium">{formatCurrency(car.purchase_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Asking Price:</span>
                        <span className="font-medium">{formatCurrency(car.asking_price)}</span>
                      </div>
                      {car.dealer_commission && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dealer Commission:</span>
                          <span className="font-medium">{formatCurrency(car.dealer_commission)}</span>
                        </div>
                      )}
                      {car.status === "sold" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit:</span>
                          <span className="font-medium text-green-600">{formatCurrency(calculateProfit())}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={generateAuctionSheetPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Auction Sheet
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => shareOnWhatsApp("", "text")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share Car Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
