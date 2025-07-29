"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Car, DollarSign, FileText, MessageCircle, Download, Edit, Gauge } from "lucide-react"

interface CarDetails {
  id: string
  make: string
  model: string
  year: number
  registrationNumber: string // Add this line
  mileage: number
  purchasePrice: number
  askingPrice: number
  soldPrice?: number
  purchaseDate: string
  soldDate?: string
  ownerName: string
  description?: string
  status: "available" | "sold"
  profit?: number
  dealerCommission?: number
  buyerName?: string // Add this line
  buyerCnic?: string // Add this line
  buyerContact?: string // Add this line
  images: string[]
  documents: { name: string; url: string; type: string }[]
  condition: {
    trunk: boolean
    pillars: boolean
    hood: boolean
    roof: boolean
    frontLeftDoor: boolean
    frontRightDoor: boolean
    backLeftDoor: boolean
    backRightDoor: boolean
    frontLeftFender: boolean
    frontRightFender: boolean
    backLeftFender: boolean
    backRightFender: boolean
    grade: number
  }
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  // Authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "client") {
      window.location.href = "/"
      return
    }
  }, [])

  // Sample car data - in real app, fetch based on params.id
  const [car] = useState<CarDetails>(() => {
    // Simulate fetching car by ID
    const carId = params.id

    // Sample cars database (in real app, this would be from your database)
    const carsDatabase: { [key: string]: CarDetails } = {
      "car-1": {
        id: "car-1",
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        registrationNumber: "LZH-238",
        mileage: 45000,
        purchasePrice: 2500000,
        askingPrice: 2800000,
        soldPrice: 2750000,
        purchaseDate: "2024-01-10",
        soldDate: "2024-01-18",
        ownerName: "Ahmed Ali",
        description: "Excellent condition, well maintained, single owner vehicle with complete service history.",
        status: "sold",
        profit: 200000,
        dealerCommission: 50000,
        buyerName: "Ahmed Ali Khan",
        buyerCnic: "42101-1234567-1",
        buyerContact: "+92-300-1234567",
        images: [
          "/placeholder.svg?height=300&width=400&text=Toyota+Corolla+Front",
          "/placeholder.svg?height=300&width=400&text=Toyota+Corolla+Side",
          "/placeholder.svg?height=300&width=400&text=Toyota+Corolla+Interior",
          "/placeholder.svg?height=300&width=400&text=Toyota+Corolla+Engine",
        ],
        documents: [
          { name: "Registration Certificate", url: "#", type: "pdf" },
          { name: "Insurance Papers", url: "#", type: "pdf" },
          { name: "Service History", url: "#", type: "pdf" },
          { name: "Auction Sheet", url: "#", type: "pdf" },
        ],
        condition: {
          trunk: true,
          pillars: false,
          hood: true,
          roof: false,
          frontLeftDoor: false,
          frontRightDoor: true,
          backLeftDoor: false,
          backRightDoor: false,
          frontLeftFender: true,
          frontRightFender: false,
          backLeftFender: false,
          backRightFender: true,
          grade: 3,
        },
      },
      "car-2": {
        id: "car-2",
        make: "Honda",
        model: "Civic",
        year: 2019,
        registrationNumber: "KHI-456",
        mileage: 62000,
        purchasePrice: 3000000,
        askingPrice: 3400000,
        purchaseDate: "2024-01-12",
        ownerName: "Sara Khan",
        description: "Well maintained Honda Civic with excellent performance and fuel efficiency.",
        status: "available",
        images: [
          "/placeholder.svg?height=300&width=400&text=Honda+Civic+Front",
          "/placeholder.svg?height=300&width=400&text=Honda+Civic+Side",
          "/placeholder.svg?height=300&width=400&text=Honda+Civic+Interior",
          "/placeholder.svg?height=300&width=400&text=Honda+Civic+Engine",
        ],
        documents: [
          { name: "Registration Certificate", url: "#", type: "pdf" },
          { name: "Insurance Papers", url: "#", type: "pdf" },
          { name: "Service History", url: "#", type: "pdf" },
        ],
        condition: {
          trunk: false,
          pillars: true,
          hood: false,
          roof: false,
          frontLeftDoor: true,
          frontRightDoor: false,
          backLeftDoor: false,
          backRightDoor: true,
          frontLeftFender: false,
          frontRightFender: false,
          backLeftFender: true,
          backRightFender: false,
          grade: 4,
        },
      },
      "car-3": {
        id: "car-3",
        make: "Suzuki",
        model: "Alto",
        year: 2021,
        registrationNumber: "ISB-789",
        mileage: 28000,
        purchasePrice: 1800000,
        askingPrice: 2100000,
        soldPrice: 2050000,
        purchaseDate: "2024-01-15",
        soldDate: "2024-01-20",
        ownerName: "Muhammad Hassan",
        description: "Low mileage Suzuki Alto in excellent condition.",
        status: "sold",
        profit: 220000,
        dealerCommission: 30000,
        buyerName: "Sara Malik",
        buyerCnic: "42101-9876543-2",
        buyerContact: "+92-321-9876543",
        images: [
          "/placeholder.svg?height=300&width=400&text=Suzuki+Alto+Front",
          "/placeholder.svg?height=300&width=400&text=Suzuki+Alto+Side",
          "/placeholder.svg?height=300&width=400&text=Suzuki+Alto+Interior",
        ],
        documents: [
          { name: "Registration Certificate", url: "#", type: "pdf" },
          { name: "Insurance Papers", url: "#", type: "pdf" },
        ],
        condition: {
          trunk: false,
          pillars: false,
          hood: true,
          roof: false,
          frontLeftDoor: false,
          frontRightDoor: false,
          backLeftDoor: true,
          backRightDoor: false,
          frontLeftFender: false,
          frontRightFender: true,
          backLeftFender: false,
          backRightFender: false,
          grade: 4,
        },
      },
      "car-4": {
        id: "car-4",
        make: "Toyota",
        model: "Camry",
        year: 2021,
        registrationNumber: "LHR-321",
        mileage: 35000,
        purchasePrice: 4500000,
        askingPrice: 4900000,
        purchaseDate: "2024-01-20",
        ownerName: "Ali Ahmed",
        description: "Premium Toyota Camry with luxury features and excellent condition.",
        status: "available",
        images: [
          "/placeholder.svg?height=300&width=400&text=Toyota+Camry+Front",
          "/placeholder.svg?height=300&width=400&text=Toyota+Camry+Side",
          "/placeholder.svg?height=300&width=400&text=Toyota+Camry+Interior",
          "/placeholder.svg?height=300&width=400&text=Toyota+Camry+Engine",
        ],
        documents: [
          { name: "Registration Certificate", url: "#", type: "pdf" },
          { name: "Insurance Papers", url: "#", type: "pdf" },
          { name: "Service History", url: "#", type: "pdf" },
        ],
        condition: {
          trunk: false,
          pillars: false,
          hood: false,
          roof: true,
          frontLeftDoor: false,
          frontRightDoor: false,
          backLeftDoor: false,
          backRightDoor: false,
          frontLeftFender: false,
          frontRightFender: false,
          backLeftFender: false,
          backRightFender: true,
          grade: 5,
        },
      },
    }

    // Return the car data for the requested ID, or a default car if not found
    return carsDatabase[carId] || carsDatabase["car-2"] // Default to Honda Civic if ID not found
  })

  // Add this after the car data initialization
  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Car Not Found</h2>
            <p className="text-gray-600 mb-4">The requested car could not be found.</p>
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

  const calculateGrade = () => {
    const conditionParts = { ...car.condition }
    delete conditionParts.grade // Remove grade from calculation

    const totalParts = Object.keys(conditionParts).length
    const paintedParts = Object.values(conditionParts).filter(Boolean).length
    const genuineParts = totalParts - paintedParts

    const gradePercentage = (genuineParts / totalParts) * 100

    if (gradePercentage >= 90) return 5
    if (gradePercentage >= 80) return 4
    if (gradePercentage >= 60) return 3
    if (gradePercentage >= 40) return 2
    return 1
  }

  const shareOnWhatsApp = (content: string, type: "text" | "image" | "document" = "text") => {
    let message = ""

    if (type === "text") {
      message =
        `🚗 *${car.make} ${car.model} ${car.year}*\n\n` +
        `💰 *Price:* ${formatCurrency(car.askingPrice)}\n` +
        `📅 *Year:* ${car.year}\n` +
        `🛣️ *Mileage:* ${car.mileage.toLocaleString()} km\n` +
        `⭐ *Grade:* ${calculateGrade()}/5\n` +
        `👤 *Owner:* ${car.ownerName}\n` +
        `📋 *Status:* ${car.status === "available" ? "Available" : "Sold"}\n\n` +
        `📝 *Description:* ${car.description || "No description available"}\n\n` +
        `Contact us for more details!`
    } else if (type === "image") {
      message =
        `🚗 *${car.make} ${car.model} ${car.year}* - Car Image\n\n` +
        `💰 Price: ${formatCurrency(car.askingPrice)}\n` +
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

  const generateAuctionSheet = () => {
    const conditionParts = { ...car.condition }
    delete conditionParts.grade

    const paintedParts = Object.values(conditionParts).filter(Boolean).length
    const genuineParts = Object.keys(conditionParts).length - paintedParts
    const grade = calculateGrade()

    const partLabels = {
      trunk: "Trunk",
      pillars: "Pillars",
      hood: "Hood",
      roof: "Roof",
      frontLeftDoor: "Front Left Door",
      frontRightDoor: "Front Right Door",
      backLeftDoor: "Back Left Door",
      backRightDoor: "Back Right Door",
      frontLeftFender: "Front Left Fender",
      frontRightFender: "Front Right Fender",
      backLeftFender: "Back Left Fender",
      backRightFender: "Back Right Fender",
    }

    const auctionSheetContent = `
🚗 AUCTION SHEET
================

Car Details:
• Make & Model: ${car.make} ${car.model} ${car.year}
• Mileage: ${car.mileage.toLocaleString()} km
• Owner: ${car.ownerName}
• Date: ${new Date().toLocaleDateString()}

Condition Assessment:
• Overall Grade: ${grade}/5
• Genuine Parts: ${genuineParts}/${Object.keys(conditionParts).length}
• Painted Parts: ${paintedParts}/${Object.keys(conditionParts).length}

Parts Condition (✓ = Painted, ✗ = Genuine):
${Object.entries(partLabels)
  .map(
    ([key, label]) => `• ${label}: ${conditionParts[key as keyof typeof conditionParts] ? "✓ Painted" : "✗ Genuine"}`,
  )
  .join("\n")}

Grade Scale:
5 = Excellent (90-100% genuine parts)
4 = Very Good (80-89% genuine parts)  
3 = Good (60-79% genuine parts)
2 = Fair (40-59% genuine parts)
1 = Poor (0-39% genuine parts)
`

    // Share on WhatsApp
    const encodedMessage = encodeURIComponent(auctionSheetContent)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const shareImageOnWhatsApp = (imageUrl: string, imageName: string) => {
    const message =
      `🚗 *${car.make} ${car.model} ${car.year}* - ${imageName}\n\n` +
      `💰 Price: ${formatCurrency(car.askingPrice)}\n` +
      `📅 Year: ${car.year}\n` +
      `🛣️ Mileage: ${car.mileage.toLocaleString()} km\n\n` +
      `Image: ${imageUrl}\n\n` +
      `Contact us for more details!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const conditionParts = { ...car.condition }
  delete conditionParts.grade
  const paintedParts = Object.values(conditionParts).filter(Boolean).length
  const genuineParts = Object.keys(conditionParts).length - paintedParts

  const partLabels = {
    trunk: "Trunk",
    pillars: "Pillars",
    hood: "Hood",
    roof: "Roof",
    frontLeftDoor: "Front Left Door",
    frontRightDoor: "Front Right Door",
    backLeftDoor: "Back Left Door",
    backRightDoor: "Back Right Door",
    frontLeftFender: "Front Left Fender",
    frontRightFender: "Front Right Fender",
    backLeftFender: "Back Left Fender",
    backRightFender: "Back Right Fender",
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
                  {car.make} {car.model} {car.year} ({car.registrationNumber})
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
              <div className="text-2xl font-bold">{formatCurrency(car.purchasePrice)}</div>
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
              <div className="text-2xl font-bold">
                {formatCurrency(car.status === "sold" ? car.soldPrice! : car.askingPrice)}
              </div>
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
              <div className="text-2xl font-bold text-green-600">{car.profit ? formatCurrency(car.profit) : "N/A"}</div>
              <p className="text-xs text-muted-foreground">
                {car.dealerCommission ? `After ₨${car.dealerCommission.toLocaleString()} commission` : "Net profit"}
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
                  {car.status === "available" ? "Available" : "Sold"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {car.status === "sold" && car.soldDate ? `Sold on ${car.soldDate}` : "Ready for sale"}
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
                      <p className="text-lg font-semibold">{car.registrationNumber}</p>
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
                      <p className="text-lg font-semibold">{car.ownerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Purchase Date</Label>
                      <p className="text-lg font-semibold">{car.purchaseDate}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Purchase Price</Label>
                      <p className="text-lg font-semibold">{formatCurrency(car.purchasePrice)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Asking Price</Label>
                      <p className="text-lg font-semibold">{formatCurrency(car.askingPrice)}</p>
                    </div>
                    {car.status === "sold" && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Sold Price</Label>
                          <p className="text-lg font-semibold">{formatCurrency(car.soldPrice!)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Sold Date</Label>
                          <p className="text-lg font-semibold">{car.soldDate}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {car.status === "sold" && car.buyerName && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Buyer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Buyer Name</Label>
                        <p className="text-lg font-semibold">{car.buyerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">CNIC</Label>
                        <p className="text-lg font-semibold">{car.buyerCnic || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Contact</Label>
                        <p className="text-lg font-semibold">{car.buyerContact || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {car.images.map((image, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Car image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => shareImageOnWhatsApp(image, `Image ${index + 1}`)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => downloadFile(image, `car-image-${index + 1}.jpg`)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {car.documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">{doc.type.toUpperCase()} Document</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => shareOnWhatsApp(doc.name, "document")}>
                              <MessageCircle className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => downloadFile(doc.url, doc.name)}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="condition">
            <Card>
              <CardHeader>
                <CardTitle>Auction Sheet & Car Condition</CardTitle>
                <CardDescription>Detailed condition assessment and grading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grade Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{calculateGrade()}/5</p>
                      <p className="text-sm text-gray-600">Overall Grade</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">{genuineParts}</p>
                      <p className="text-sm text-gray-600">Genuine Parts</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-red-600">{paintedParts}</p>
                      <p className="text-sm text-gray-600">Painted Parts</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-600">{car.mileage.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">KM Mileage</p>
                    </div>
                  </div>
                </div>

                {/* Parts Condition Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(partLabels).map(([key, label]) => {
                    const isPainted = conditionParts[key as keyof typeof conditionParts]
                    return (
                      <div key={key} className="text-center">
                        <div
                          className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                            isPainted ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                          }`}
                        >
                          <Car className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-gray-500">{isPainted ? "Painted" : "Genuine"}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Grade Scale */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Grading System:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Grade 5 (Excellent): 90-100% genuine parts</p>
                    <p>• Grade 4 (Very Good): 80-89% genuine parts</p>
                    <p>• Grade 3 (Good): 60-79% genuine parts</p>
                    <p>• Grade 2 (Fair): 40-59% genuine parts</p>
                    <p>• Grade 1 (Poor): 0-39% genuine parts</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={generateAuctionSheet}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share Auction Sheet
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
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
