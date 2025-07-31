"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Car, DollarSign, FileText, MessageCircle, Download, Edit, Gauge, AlertCircle } from "lucide-react"
import { getCarById, getCarInvestments, getFileUrl, type Car as CarType } from "@/lib/supabase-client"

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<CarType | null>(null)
  const [carInvestments, setCarInvestments] = useState<any[]>([])
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

      // Load investment data
      try {
        const investments = await getCarInvestments(params.id)
        setCarInvestments(investments)
      } catch (investmentError) {
        console.error("Error loading car investments:", investmentError)
        // Don't fail the whole page if investments fail to load
        setCarInvestments([])
      }
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
      return car.asking_price - car.purchase_price - (car.purchase_commission || 0) - (car.dealer_commission || 0)
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
    if (!car) {
      alert("Car data not available for auction sheet generation.")
      return
    }

    // Create HTML content for better PDF generation
    const auctionSheetContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Auction Sheet - ${car.make} ${car.model}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin-bottom: 5px; }
        .header p { color: #666; margin: 0; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { margin-left: 10px; }
        .highlight { background-color: #f3f4f6; padding: 15px; border-radius: 8px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status.available { background-color: #10b981; color: white; }
        .status.sold { background-color: #6b7280; color: white; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚗 AUCTION SHEET</h1>
        <p>Vehicle Information & Documentation</p>
    </div>

    <div class="section">
        <h2>Vehicle Details</h2>
        <div class="details-grid">
            <div>
                <div class="detail-item">
                    <span class="detail-label">Make & Model:</span>
                    <span class="detail-value">${car.make} ${car.model} ${car.year}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registration:</span>
                    <span class="detail-value">${car.registration_number}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mileage:</span>
                    <span class="detail-value">${car.mileage.toLocaleString()} km</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Previous Owner:</span>
                    <span class="detail-value">${car.owner_name}</span>
                </div>
            </div>
            <div>
                <div class="detail-item">
                    <span class="detail-label">Purchase Date:</span>
                    <span class="detail-value">${car.purchase_date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Purchase Price:</span>
                    <span class="detail-value">${formatCurrency(car.purchase_price)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Asking Price:</span>
                    <span class="detail-value">${formatCurrency(car.asking_price)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="status ${car.status}">${car.status.toUpperCase()}</span>
                    </span>
                </div>
            </div>
        </div>
    </div>

    ${car.status === "sold" ? `
    <div class="section">
        <h2>Sale Information</h2>
        <div class="highlight">
            <div class="detail-item">
                <span class="detail-label">Sold Price:</span>
                <span class="detail-value">${formatCurrency(car.asking_price)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Profit:</span>
                <span class="detail-value" style="color: #10b981; font-weight: bold;">${formatCurrency(calculateProfit())}</span>
            </div>
            ${car.dealer_commission ? `
            <div class="detail-item">
                <span class="detail-label">Dealer Commission:</span>
                <span class="detail-value">${formatCurrency(car.dealer_commission)}</span>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${car.auction_sheet ? `
    <div class="section">
        <h2>Car Condition Assessment</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="highlight" style="text-align: center;">
                <h3 style="margin: 0; color: #2563eb;">Overall Grade</h3>
                <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0;">
                    ${(() => {
                      const totalParts = Object.keys(car.auction_sheet).length
                      const paintedParts = Object.values(car.auction_sheet).filter(Boolean).length
                      const genuinePercentage = ((totalParts - paintedParts) / totalParts) * 100
                      if (genuinePercentage >= 90) return "5/5"
                      if (genuinePercentage >= 80) return "4/5"
                      if (genuinePercentage >= 60) return "3/5"
                      if (genuinePercentage >= 40) return "2/5"
                      return "1/5"
                    })()}
                </div>
                <p style="margin: 0; font-size: 12px; color: #666;">
                    ${(() => {
                      const totalParts = Object.keys(car.auction_sheet).length
                      const paintedParts = Object.values(car.auction_sheet).filter(Boolean).length
                      const genuinePercentage = ((totalParts - paintedParts) / totalParts) * 100
                      if (genuinePercentage >= 90) return "Excellent"
                      if (genuinePercentage >= 80) return "Very Good"
                      if (genuinePercentage >= 60) return "Good"
                      if (genuinePercentage >= 40) return "Fair"
                      return "Poor"
                    })()}
                </p>
            </div>
            <div class="highlight" style="text-align: center;">
                <h3 style="margin: 0; color: #10b981;">Genuine Parts</h3>
                <div style="font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0;">
                    ${Object.keys(car.auction_sheet).length - Object.values(car.auction_sheet).filter(Boolean).length}
                </div>
                <p style="margin: 0; font-size: 12px; color: #666;">out of ${Object.keys(car.auction_sheet).length} total</p>
            </div>
            <div class="highlight" style="text-align: center;">
                <h3 style="margin: 0; color: #ef4444;">Painted Parts</h3>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444; margin: 10px 0;">
                    ${Object.values(car.auction_sheet).filter(Boolean).length}
                </div>
                <p style="margin: 0; font-size: 12px; color: #666;">require attention</p>
            </div>
        </div>

        <h3>Parts Condition Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Part</th>
                    <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Condition</th>
                    <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(car.auction_sheet).map(([part, isPainted]) => {
                  const partLabels = {
                    trunk: "Trunk",
                    pillars: "Pillars",
                    hood: "Hood",
                    roof: "Roof",
                    frontLeftDoor: "Front Left Door",
                    frontRightDoor: "Front Right Door",
                    backLeftDoor: "Back Left Door",
                    backRightDoor: "Back Right Door",
                    frontRightFender: "Front Right Fender",
                    frontLeftFender: "Front Left Fender",
                    backRightFender: "Back Right Fender",
                    backLeftFender: "Back Left Fender",
                  }
                  return `
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${partLabels[part] || part}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; color: ${isPainted ? '#ef4444' : '#10b981'}; font-weight: bold;">
                            ${isPainted ? 'Painted' : 'Genuine'}
                        </td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">
                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; color: white; background-color: ${isPainted ? '#ef4444' : '#10b981'};">
                                ${isPainted ? 'P' : 'G'}
                            </span>
                        </td>
                    </tr>
                  `
                }).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${car.description ? `
    <div class="section">
        <h2>Description</h2>
        <div class="highlight">
            <p>${car.description}</p>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Car Inventory Management System</p>
    </div>
</body>
</html>
`

    // Create HTML blob and open in new tab for PDF generation
    const blob = new Blob([auctionSheetContent], { type: "text/html" })
    const url = window.URL.createObjectURL(blob)

    // Open in new tab so user can print as PDF
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          window.URL.revokeObjectURL(url)
        }, 500)
      }
    } else {
      // Fallback: download as HTML file
      const link = document.createElement("a")
      link.href = url
      link.download = `auction-sheet-${car.make}-${car.model}-${car.registration_number}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
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
      // Check if URL is valid
      if (!url || url === "/placeholder.svg") {
        alert("File not available for download.")
        return
      }

      // Show loading state
      const loadingToast = document.createElement("div")
      loadingToast.className = "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50"
      loadingToast.textContent = "Downloading file..."
      document.body.appendChild(loadingToast)

      // Try direct download first (works for most Supabase storage URLs)
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

        // Remove loading toast and show success
        document.body.removeChild(loadingToast)
        const successToast = document.createElement("div")
        successToast.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
        successToast.textContent = "File downloaded successfully!"
        document.body.appendChild(successToast)
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast)
          }
        }, 3000)
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

        // Remove loading toast and show success
        document.body.removeChild(loadingToast)
        const successToast = document.createElement("div")
        successToast.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
        successToast.textContent = "Download initiated!"
        document.body.appendChild(successToast)
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast)
          }
        }, 3000)
      }
    } catch (error) {
      console.error("Error downloading file:", error)

      // Remove loading toast if present
      const loadingToast = document.querySelector('.fixed.top-4.right-4.bg-blue-500')
      if (loadingToast && document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast)
      }

      // Show error message
      const errorToast = document.createElement("div")
      errorToast.className = "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50"
      errorToast.textContent = "Error downloading file. Please try again."
      document.body.appendChild(errorToast)
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast)
        }
      }, 3000)
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
      alert("Error opening file. Please try again.")
    }
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
                    {car.purchase_commission && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Purchase Commission</Label>
                        <p className="text-lg font-semibold">{formatCurrency(car.purchase_commission)}</p>
                      </div>
                    )}
                    {car.dealer_commission && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Sale Commission</Label>
                        <p className="text-lg font-semibold">{formatCurrency(car.dealer_commission)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Investment & Ownership Information */}
                {(car.ownership_type !== 'fully_showroom_owned' || (car.showroom_investment && car.showroom_investment > 0)) && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-800 mb-3 block">Investment & Ownership Structure</Label>

                    <div className="space-y-3">
                      {/* Ownership Type */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ownership Type:</span>
                        <Badge variant="outline" className="bg-white">
                          {car.ownership_type === 'fully_showroom_owned' && 'Fully Showroom Owned'}
                          {car.ownership_type === 'partially_owned' && 'Partially Owned (Showroom + Investors)'}
                          {car.ownership_type === 'fully_investor_owned' && 'Fully Investor-Owned'}
                        </Badge>
                      </div>

                      {/* Showroom Investment */}
                      {car.showroom_investment && car.showroom_investment > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Showroom Investment:</span>
                          <span className="font-semibold text-blue-700">{formatCurrency(car.showroom_investment)}</span>
                        </div>
                      )}

                      {/* Investors List */}
                      {carInvestments.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 border-t pt-2">Investors:</div>
                          {carInvestments.map((investment, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{investment.investor?.name || 'Unknown Investor'}</div>
                                <div className="text-xs text-gray-500">{investment.investor?.cnic || 'No CNIC'}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">{formatCurrency(investment.investment_amount)}</div>
                                <div className="text-xs text-gray-500">{investment.ownership_percentage?.toFixed(1) || '0'}% ownership</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Total Investment Summary */}
                      {(() => {
                        const totalInvestment = (car.showroom_investment || 0) + carInvestments.reduce((sum, inv) => sum + (inv.investment_amount || 0), 0)
                        const showroomPercentage = totalInvestment > 0 ? ((car.showroom_investment || 0) / totalInvestment) * 100 : 0

                        return totalInvestment > 0 && (
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center font-semibold">
                              <span className="text-sm text-gray-700">Total Investment:</span>
                              <span className="text-blue-700">{formatCurrency(totalInvestment)}</span>
                            </div>
                            {car.ownership_type === 'partially_owned' && showroomPercentage > 0 && (
                              <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                                <span>Showroom Share:</span>
                                <span>{showroomPercentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* Commission Settings for Fully Investor-Owned */}
                      {car.ownership_type === 'fully_investor_owned' && (
                        <div className="border-t pt-2">
                          <div className="text-sm text-gray-600 mb-1">Showroom Commission:</div>
                          <div className="text-sm">
                            {car.commission_type === 'flat' ? (
                              <span className="font-medium">Flat Amount: {formatCurrency(car.commission_amount || 0)}</span>
                            ) : (
                              <span className="font-medium">Percentage: {car.commission_percentage || 0}%</span>
                            )}
                          </div>
                        </div>
                      )}
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
                              onClick={() => viewFile(imageUrl, `car-image-${index + 1}.jpg`)}
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
                                <Button variant="outline" size="sm" onClick={() => viewFile(docUrl, docName)}>
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
                <CardTitle>Car Condition Assessment & Auction Sheet</CardTitle>
                <CardDescription>Detailed condition assessment captured during car evaluation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auction Sheet Data */}
                {car.auction_sheet ? (
                  <>
                    {/* Grading Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Assessment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {(() => {
                              const totalParts = Object.keys(car.auction_sheet).length
                              const paintedParts = Object.values(car.auction_sheet).filter(Boolean).length
                              const genuinePercentage = ((totalParts - paintedParts) / totalParts) * 100
                              if (genuinePercentage >= 90) return "5"
                              if (genuinePercentage >= 80) return "4"
                              if (genuinePercentage >= 60) return "3"
                              if (genuinePercentage >= 40) return "2"
                              return "1"
                            })()}/5
                          </div>
                          <p className="text-sm font-medium text-gray-700">Overall Grade</p>
                          <p className="text-xs text-gray-500">
                            {(() => {
                              const totalParts = Object.keys(car.auction_sheet).length
                              const paintedParts = Object.values(car.auction_sheet).filter(Boolean).length
                              const genuinePercentage = ((totalParts - paintedParts) / totalParts) * 100
                              if (genuinePercentage >= 90) return "Excellent"
                              if (genuinePercentage >= 80) return "Very Good"
                              if (genuinePercentage >= 60) return "Good"
                              if (genuinePercentage >= 40) return "Fair"
                              return "Poor"
                            })()}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {Object.keys(car.auction_sheet).length - Object.values(car.auction_sheet).filter(Boolean).length}
                          </div>
                          <p className="text-sm font-medium text-gray-700">Genuine Parts</p>
                          <p className="text-xs text-gray-500">
                            out of {Object.keys(car.auction_sheet).length} total
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-1">
                            {Object.values(car.auction_sheet).filter(Boolean).length}
                          </div>
                          <p className="text-sm font-medium text-gray-700">Painted Parts</p>
                          <p className="text-xs text-gray-500">
                            require attention
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Grading System Legend */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-3">Grading System Reference</h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>Grade 5 - Excellent (90-100%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-400 rounded"></div>
                          <span>Grade 4 - Very Good (80-89%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                          <span>Grade 3 - Good (60-79%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-orange-400 rounded"></div>
                          <span>Grade 2 - Fair (40-59%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Grade 1 - Poor (0-39%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Parts Condition Grid */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Parts Condition Assessment</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(car.auction_sheet).map(([part, isPainted]) => {
                          const partLabels: Record<string, string> = {
                            trunk: "Trunk",
                            pillars: "Pillars",
                            hood: "Hood",
                            roof: "Roof",
                            frontLeftDoor: "Front Left Door",
                            frontRightDoor: "Front Right Door",
                            backLeftDoor: "Back Left Door",
                            backRightDoor: "Back Right Door",
                            frontRightFender: "Front Right Fender",
                            frontLeftFender: "Front Left Fender",
                            backRightFender: "Back Right Fender",
                            backLeftFender: "Back Left Fender",
                          }

                          return (
                            <div
                              key={part}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isPainted
                                  ? "bg-red-50 border-red-200 text-red-800"
                                  : "bg-green-50 border-green-200 text-green-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{partLabels[part]}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  isPainted ? "bg-red-500" : "bg-green-500"
                                }`}>
                                  {isPainted ? "P" : "G"}
                                </div>
                              </div>
                              <div className="text-xs mt-1 font-medium">
                                {isPainted ? "Painted" : "Genuine"}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Car Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Vehicle Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{car.year}</p>
                          <p className="text-sm text-gray-600">Model Year</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{car.mileage.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">KM Mileage</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-600">{formatCurrency(car.asking_price)}</p>
                          <p className="text-sm text-gray-600">Asking Price</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Auction Sheet Data</h3>
                    <p className="text-gray-600">Auction sheet data was not captured when this car was added.</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={generateAuctionSheetPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Auction Sheet as PDF
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
