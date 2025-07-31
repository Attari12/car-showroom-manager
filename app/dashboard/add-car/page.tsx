"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Download,
  FileText,
  X,
  Car,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  TrendingUp,
  Building2,
  Percent,
  Plus,
} from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { createCar, getSellers, getInvestors, getDealers, createSeller, createDealer, createInvestor, createCarInvestment, type Car as CarType, type Seller, type Investor } from "@/lib/supabase-client"

interface CarCondition {
  trunk: boolean
  pillars: boolean
  hood: boolean
  roof: boolean
  frontLeftDoor: boolean
  frontRightDoor: boolean
  backLeftDoor: boolean
  backRightDoor: boolean
  frontRightFender: boolean
  frontLeftFender: boolean
  backRightFender: boolean
  backLeftFender: boolean
}

interface InvestorData {
  id?: string
  name: string
  cnic: string
  phone?: string
  investment_amount: number
}

type OwnershipType = 'fully_showroom_owned' | 'partially_owned' | 'fully_investor_owned'
type CommissionType = 'flat' | 'percentage'

export default function AddCarPage() {
  const router = useRouter()
  const [clientId, setClientId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // File upload hooks
  const imageUpload = useFileUpload({
    bucket: "car-images",
    maxFiles: 10,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024,
  })

  const documentUpload = useFileUpload({
    bucket: "car-documents",
    maxFiles: 5,
    allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  })

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    registration_number: "",
    color: "",
    condition: "Excellent",
    mileage: 0,
    purchase_price: 0,
    asking_price: 0,
    purchase_date: new Date().toISOString().split("T")[0],
    owner_name: "",
    purchase_commission: 0,
    dealer_commission: 0,
    status: "available" as "available" | "sold" | "reserved" | "pending",
    description: "",
    seller_id: "",
    showroom_investment: 0,
    ownership_type: "fully_showroom_owned" as OwnershipType,
    dealer_id: "",
    commission_type: "flat" as CommissionType,
    commission_amount: 0,
    commission_percentage: 0,
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([])
  const [carCondition, setCarCondition] = useState<CarCondition>({
    trunk: false,
    pillars: false,
    hood: false,
    roof: false,
    frontLeftDoor: false,
    frontRightDoor: false,
    backLeftDoor: false,
    backRightDoor: false,
    frontRightFender: false,
    frontLeftFender: false,
    backRightFender: false,
    backLeftFender: false,
  })

  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [investors, setInvestors] = useState<InvestorData[]>([])
  const [selectedSeller, setSelectedSeller] = useState<string>("")
  const [availableSellers, setAvailableSellers] = useState<Seller[]>([])
  const [availableInvestors, setAvailableInvestors] = useState<Investor[]>([])
  const [availableDealers, setAvailableDealers] = useState<any[]>([])

  // Modal states
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false)
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false)
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false)

  // Form states for modals
  const [sellerForm, setSellerForm] = useState({ name: "", cnic: "", phone: "", email: "", address: "" })
  const [dealerForm, setDealerForm] = useState({ name: "", cnic: "", phone: "", email: "", address: "", license_number: "" })
  const [investorForm, setInvestorForm] = useState({ name: "", cnic: "", phone: "", email: "", address: "" })

  useEffect(() => {
    // Check authentication
    const storedClientId = localStorage.getItem("clientId")
    const userType = localStorage.getItem("userType")

    if (!storedClientId || userType !== "client") {
      router.push("/")
      return
    }

    setClientId(storedClientId)
    loadSellersAndInvestors(storedClientId)
  }, [router])

  const loadSellersAndInvestors = async (clientId: string) => {
    try {
      const [sellersData, investorsData, dealersData] = await Promise.all([
        getSellers(clientId),
        getInvestors(clientId),
        getDealers(clientId)
      ])
      setAvailableSellers(sellersData)
      setAvailableInvestors(investorsData)
      setAvailableDealers(dealersData)
    } catch (error) {
      console.error("Error loading sellers, investors, and dealers:", error)
    }
  }

  // Modal handlers
  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      const newSeller = await createSeller({
        client_id: clientId,
        name: sellerForm.name,
        cnic: sellerForm.cnic,
        phone: sellerForm.phone,
        email: sellerForm.email,
        address: sellerForm.address,
      })

      setAvailableSellers(prev => [...prev, newSeller])
      setFormData(prev => ({ ...prev, seller_id: newSeller.id }))
      setSellerForm({ name: "", cnic: "", phone: "", email: "", address: "" })
      setIsSellerModalOpen(false)
      setSuccess("Seller added successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(`Failed to create seller: ${error.message}`)
    }
  }

  const handleCreateDealer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      const newDealer = await createDealer({
        client_id: clientId,
        name: dealerForm.name,
        cnic: dealerForm.cnic,
        phone: dealerForm.phone,
        email: dealerForm.email,
        address: dealerForm.address,
        license_number: dealerForm.license_number,
      })

      setAvailableDealers(prev => [...prev, newDealer])
      setFormData(prev => ({ ...prev, dealer_id: newDealer.id }))
      setDealerForm({ name: "", cnic: "", phone: "", email: "", address: "", license_number: "" })
      setIsDealerModalOpen(false)
      setSuccess("Dealer added successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(`Failed to create dealer: ${error.message}`)
    }
  }

  const handleCreateInvestor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError("")
      const newInvestor = await createInvestor({
        client_id: clientId,
        name: investorForm.name,
        cnic: investorForm.cnic,
        phone: investorForm.phone,
        email: investorForm.email,
        address: investorForm.address,
      })

      setAvailableInvestors(prev => [...prev, newInvestor])
      setInvestorForm({ name: "", cnic: "", phone: "", email: "", address: "" })
      setIsInvestorModalOpen(false)
      setSuccess("Investor added successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(`Failed to create investor: ${error.message}`)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages((prev) => [...prev, ...files].slice(0, 10))

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedDocuments((prev) => [...prev, ...files].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateGrade = () => {
    const totalParts = Object.keys(carCondition).length
    const paintedParts = Object.values(carCondition).filter(Boolean).length
    const genuineParts = totalParts - paintedParts

    // Grade calculation: more genuine parts = higher grade
    const gradePercentage = (genuineParts / totalParts) * 100

    if (gradePercentage >= 90) return 5
    if (gradePercentage >= 80) return 4
    if (gradePercentage >= 60) return 3
    if (gradePercentage >= 40) return 2
    return 1
  }

  const handleAddInvestor = () => {
    setInvestors([...investors, { name: "", cnic: "", investment_amount: 0 }])
  }

  const handleRemoveInvestor = (index: number) => {
    setInvestors(investors.filter((_, i) => i !== index))
  }

  const handleInvestorChange = (index: number, field: keyof InvestorData, value: string | number) => {
    const updatedInvestors = investors.map((inv, i) =>
      i === index ? { ...inv, [field]: value } : inv
    )
    setInvestors(updatedInvestors)
  }

  const selectExistingInvestor = (index: number, investorId: string) => {
    const existingInvestor = availableInvestors.find(inv => inv.id === investorId)
    if (existingInvestor) {
      const updatedInvestors = investors.map((inv, i) =>
        i === index ? {
          ...inv,
          id: investorId,
          name: existingInvestor.name,
          cnic: existingInvestor.cnic,
          phone: existingInvestor.phone || inv.phone
        } : inv
      )
      setInvestors(updatedInvestors)
    } else {
      // Clear fields if no investor selected
      const updatedInvestors = investors.map((inv, i) =>
        i === index ? {
          ...inv,
          id: undefined,
          name: "",
          cnic: "",
          phone: undefined
        } : inv
      )
      setInvestors(updatedInvestors)
    }
  }

  const getTotalInvestment = () => {
    if (formData.ownership_type === 'fully_showroom_owned') {
      return formData.purchase_price || formData.asking_price || 0
    }
    const investorTotal = investors.reduce((sum, inv) => sum + (inv.investment_amount || 0), 0)
    return formData.showroom_investment + investorTotal
  }

  const getShowroomOwnershipPercentage = () => {
    if (formData.ownership_type === 'fully_showroom_owned') {
      return 100
    }
    const total = getTotalInvestment()
    return total > 0 ? (formData.showroom_investment / total) * 100 : 0
  }

  const generateAuctionSheet = () => {
    const paintedParts = Object.values(carCondition).filter(Boolean).length
    const genuineParts = Object.keys(carCondition).length - paintedParts
    const grade = calculateGrade()

    const auctionSheetContent = `
🚗 AUCTION SHEET
================

Car Details:
• Make & Model: ${formData.make} ${formData.model} ${formData.year}
• Registration: ${formData.registration_number}
• Mileage: ${formData.mileage} km
• Owner: ${formData.owner_name}
• Date: ${new Date().toLocaleDateString()}

Condition Assessment:
• Overall Grade: ${grade}/5
• Genuine Parts: ${genuineParts}/${Object.keys(carCondition).length}
• Painted Parts: ${paintedParts}/${Object.keys(carCondition).length}

Parts Condition (✓ = Painted, ✗ = Genuine):
• Trunk: ${carCondition.trunk ? "✓ Painted" : "✗ Genuine"}
• Pillars: ${carCondition.pillars ? "✓ Painted" : "✗ Genuine"}
• Hood: ${carCondition.hood ? "✓ Painted" : "✗ Genuine"}
• Roof: ${carCondition.roof ? "✓ Painted" : "��� Genuine"}
• Front Left Door: ${carCondition.frontLeftDoor ? "✓ Painted" : "✗ Genuine"}
• Front Right Door: ${carCondition.frontRightDoor ? "✓ Painted" : "✗ Genuine"}
• Back Left Door: ${carCondition.backLeftDoor ? "✓ Painted" : "✗ Genuine"}
• Back Right Door: ${carCondition.backRightDoor ? "✓ Painted" : "✗ Genuine"}
• Front Left Fender: ${carCondition.frontLeftFender ? "✓ Painted" : "✗ Genuine"}
• Front Right Fender: ${carCondition.frontRightFender ? "✓ Painted" : "✗ Genuine"}
• Back Left Fender: ${carCondition.backLeftFender ? "✓ Painted" : "✗ Genuine"}
• Back Right Fender: ${carCondition.backRightFender ? "✓ Painted" : "✗ Genuine"}

Grade Scale:
5 = Excellent (90-100% genuine parts)
4 = Very Good (80-89% genuine parts)
3 = Good (60-79% genuine parts)
2 = Fair (40-59% genuine parts)
1 = Poor (0-39% genuine parts)
`

    alert(`Auction Sheet Generated!\n\n${auctionSheetContent}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!clientId) {
      setError("Client ID not found. Please log in again.")
      setLoading(false)
      return
    }

    // Validate required fields
    if (!formData.make || !formData.model || !formData.registration_number || !formData.owner_name || !formData.color || !formData.condition) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    // Validate investment fields if investors are added
    if (investors.length > 0) {
      const invalidInvestor = investors.find(inv => !inv.name || !inv.cnic || inv.investment_amount <= 0)
      if (invalidInvestor) {
        setError("Please fill in all investor details properly")
        setLoading(false)
        return
      }
    }

    // Validate ownership and commission logic
    if (formData.ownership_type === 'fully_investor_owned' && investors.length === 0) {
      setError("Please add at least one investor for fully investor-owned cars")
      setLoading(false)
      return
    }

    if (formData.ownership_type === 'partially_owned' && formData.showroom_investment === 0 && investors.length === 0) {
      setError("For partially owned cars, please specify either showroom investment or add investors")
      setLoading(false)
      return
    }

    if (formData.asking_price <= 0) {
      setError("Asking price must be greater than 0")
      setLoading(false)
      return
    }

    try {
      // Generate temporary car ID for file uploads
      const tempCarId = `temp-${Date.now()}`

      // Upload images
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        try {
          imageUrls = await imageUpload.uploadCarImages(selectedImages, tempCarId)
        } catch (uploadError: any) {
          setError(`Failed to upload images: ${uploadError.message}`)
          setLoading(false)
          return
        }
      }

      // Upload documents
      let documentUrls: string[] = []
      if (selectedDocuments.length > 0) {
        try {
          documentUrls = await documentUpload.uploadCarDocuments(selectedDocuments, tempCarId)
        } catch (uploadError: any) {
          setError(`Failed to upload documents: ${uploadError.message}`)
          setLoading(false)
          return
        }
      }

      // Create car record
      const carData: Omit<CarType, "id" | "created_at" | "updated_at"> = {
        client_id: clientId,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        registration_number: formData.registration_number,
        color: formData.color,
        condition: formData.condition,
        mileage: formData.mileage,
        purchase_price: formData.purchase_price,
        asking_price: formData.asking_price,
        purchase_date: formData.purchase_date,
        owner_name: formData.owner_name,
        purchase_commission: formData.purchase_commission || undefined,
        dealer_commission: formData.dealer_commission || undefined,
        status: formData.status,
        description: formData.description || undefined,
        images: imageUrls,
        documents: documentUrls,
        auction_sheet: carCondition,
        seller_id: formData.seller_id || undefined,
        dealer_id: formData.dealer_id || undefined,
        showroom_investment: formData.showroom_investment,
        ownership_type: formData.ownership_type,
        commission_type: formData.commission_type,
        commission_amount: formData.commission_amount,
        commission_percentage: formData.commission_percentage,
        color: formData.color,
        condition: formData.condition,
      }

      console.log("Submitting car data:", carData)

      const result = await createCar(carData)

      if (result.error) {
        console.error("CreateCar error:", result.error)
        throw result.error
      }

      if (!result.data) {
        throw new Error("No data returned from car creation")
      }

      const createdCar = Array.isArray(result.data) ? result.data[0] : result.data

      // Create car investments if there are any investors
      if (investors.length > 0 && createdCar.id) {
        try {
          const totalInvestment = getTotalInvestment()
          for (const investor of investors) {
            if (investor.investment_amount > 0) {
              // If investor doesn't have an ID, create the investor first
              let investorId = investor.id
              if (!investorId && investor.name && investor.cnic) {
                try {
                  const newInvestor = await createInvestor({
                    client_id: clientId,
                    name: investor.name,
                    cnic: investor.cnic,
                    phone: investor.phone || "N/A",
                  })
                  investorId = newInvestor.id
                } catch (error) {
                  console.error("Error creating investor:", error)
                  continue // Skip this investor if creation fails
                }
              }

              if (investorId) {
                const ownershipPercentage = totalInvestment > 0 ? (investor.investment_amount / totalInvestment) * 100 : 0
                await createCarInvestment({
                  car_id: createdCar.id,
                  investor_id: investorId,
                  investment_amount: investor.investment_amount,
                  ownership_percentage: ownershipPercentage,
                  profit_earned: 0,
                  is_active: true,
                })
              }
            }
          }
          console.log("Car investments created successfully")
        } catch (investmentError) {
          console.error("Error creating car investments:", investmentError)
          // Don't throw here - car was created successfully, just log the investment error
        }
      }

      setSuccess("Car added successfully!")

      // Clear form
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        registration_number: "",
        color: "",
        condition: "Excellent",
        mileage: 0,
        purchase_price: 0,
        asking_price: 0,
        purchase_date: new Date().toISOString().split("T")[0],
        owner_name: "",
        purchase_commission: 0,
        dealer_commission: 0,
        status: "available",
        description: "",
        seller_id: "",
        showroom_investment: 0,
        ownership_type: "fully_showroom_owned",
        dealer_id: "",
        commission_type: "flat",
        commission_amount: 0,
        commission_percentage: 0,
      })
      setInvestors([])
      setSelectedSeller("")
      setSelectedImages([])
      setSelectedDocuments([])
      setImagePreviews([])
      setCarCondition({
        trunk: false,
        pillars: false,
        hood: false,
        roof: false,
        frontLeftDoor: false,
        frontRightDoor: false,
        backLeftDoor: false,
        backRightDoor: false,
        frontRightFender: false,
        frontLeftFender: false,
        backRightFender: false,
        backLeftFender: false,
      })
      imageUpload.clearUploads()
      documentUpload.clearUploads()

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error adding car:", error)
      setError(error.message || "Failed to add car")
    } finally {
      setLoading(false)
    }
  }

  if (!clientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
                <p className="text-sm text-gray-600">Add a new vehicle to your inventory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Enter the basic details of the vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    placeholder="e.g., Toyota, Honda, BMW"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="e.g., Camry, Civic, X5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange("registration_number", e.target.value.toUpperCase())}
                    placeholder="e.g., ABC-123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder="e.g., Pearl White, Silver Metallic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => handleInputChange("condition", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Seller Information
              </CardTitle>
              <CardDescription>Select who sold this car to the showroom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seller_id">Seller</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSellerModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Seller
                  </Button>
                </div>
                <select
                  id="seller_id"
                  value={formData.seller_id}
                  onChange={(e) => handleInputChange("seller_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a seller (optional)</option>
                  {availableSellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </CardTitle>
              <CardDescription>Enter pricing and financial details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange("purchase_price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asking_price">Asking Price *</Label>
                  <Input
                    id="asking_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.asking_price}
                    onChange={(e) => handleInputChange("asking_price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dealer_id">Dealer (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDealerModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Dealer
                    </Button>
                  </div>
                  <select
                    id="dealer_id"
                    value={formData.dealer_id || ""}
                    onChange={(e) => handleInputChange("dealer_id", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a dealer (optional)</option>
                    {availableDealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_commission">Purchase Commission</Label>
                  <Input
                    id="purchase_commission"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_commission}
                    onChange={(e) => handleInputChange("purchase_commission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                  <p className="text-xs text-gray-500">Commission paid to dealer at time of purchase</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer_commission">Sale Commission</Label>
                  <Input
                    id="dealer_commission"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.dealer_commission}
                    onChange={(e) => handleInputChange("dealer_commission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                  <p className="text-xs text-gray-500">Commission paid to dealer at time of sale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment & Ownership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Investment & Ownership Structure
              </CardTitle>
              <CardDescription>Configure investment details and ownership distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Showroom Investment */}
              <div className="space-y-2">
                <Label htmlFor="showroom_investment">Showroom Investment Amount</Label>
                <Input
                  id="showroom_investment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.showroom_investment}
                  onChange={(e) => handleInputChange("showroom_investment", Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              {/* Ownership Type */}
              <div className="space-y-2">
                <Label htmlFor="ownership_type">Car Ownership Type</Label>
                <select
                  id="ownership_type"
                  value={formData.ownership_type}
                  onChange={(e) => handleInputChange("ownership_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fully_showroom_owned">Fully Showroom Owned</option>
                  <option value="partially_owned">Partially Owned (Showroom + Investors)</option>
                  <option value="fully_investor_owned">Fully Investor-Owned</option>
                </select>
              </div>

              {/* Commission Settings for Fully Investor-Owned */}
              {formData.ownership_type === 'fully_investor_owned' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                  <h4 className="font-medium text-blue-900">Commission Configuration</h4>
                  <div className="space-y-2">
                    <Label htmlFor="commission_type">Commission Type</Label>
                    <select
                      id="commission_type"
                      value={formData.commission_type}
                      onChange={(e) => handleInputChange("commission_type", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="flat">Flat Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>

                  {formData.commission_type === 'flat' ? (
                    <div className="space-y-2">
                      <Label htmlFor="commission_amount">Commission Amount</Label>
                      <Input
                        id="commission_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.commission_amount}
                        onChange={(e) => handleInputChange("commission_amount", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="commission_percentage">Commission Percentage</Label>
                      <div className="relative">
                        <Input
                          id="commission_percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.commission_percentage}
                          onChange={(e) => handleInputChange("commission_percentage", Number.parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                          className="pr-8"
                        />
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Investors Section - Only show for partially owned and fully investor owned */}
              {formData.ownership_type !== 'fully_showroom_owned' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Investors</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsInvestorModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Investor
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddInvestor}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to List
                    </Button>
                  </div>
                </div>

                {investors.length > 0 && (
                  <div className="space-y-4">
                    {investors.map((investor, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Investor {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveInvestor(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Select Existing Investor (Optional)</Label>
                          <select
                            value={investor.id || ""}
                            onChange={(e) => selectExistingInvestor(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select existing investor or add new</option>
                            {availableInvestors.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} ({inv.cnic})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input
                              value={investor.name}
                              onChange={(e) => handleInvestorChange(index, 'name', e.target.value)}
                              placeholder="Investor name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CNIC / National ID *</Label>
                            <Input
                              value={investor.cnic}
                              onChange={(e) => handleInvestorChange(index, 'cnic', e.target.value)}
                              placeholder="42101-1234567-1"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Investment Amount *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={investor.investment_amount}
                              onChange={(e) => handleInvestorChange(index, 'investment_amount', Number.parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Investment Summary */}
                {(formData.showroom_investment > 0 || investors.length > 0) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium mb-3">Investment Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Showroom Investment:</span>
                        <span className="font-medium">₨{formData.showroom_investment.toLocaleString()}</span>
                      </div>
                      {investors.map((investor, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{investor.name || `Investor ${index + 1}`}:</span>
                          <span className="font-medium">₨{(investor.investment_amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Investment:</span>
                        <span>₨{getTotalInvestment().toLocaleString()}</span>
                      </div>
                      {formData.ownership_type === 'partially_owned' && getTotalInvestment() > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Showroom Ownership:</span>
                          <span>{getShowroomOwnershipPercentage().toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              )}
            </CardContent>
          </Card>

          {/* Owner & Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner & Vehicle Details
              </CardTitle>
              <CardDescription>Enter owner information and vehicle specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange("owner_name", e.target.value)}
                    placeholder="Enter owner's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter additional details about the vehicle..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Vehicle Images
              </CardTitle>
              <CardDescription>Upload photos of the vehicle (max 10 images, 5MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload images</span>
                      <span className="mt-1 block text-sm text-gray-500">PNG, JPG, WEBP up to 5MB each</span>
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {imagePreviews[index] ? (
                            <img
                              src={imagePreviews[index] || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-600 truncate">{file.name}</div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageUpload.uploads.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Upload Progress:</h4>
                  {imageUpload.uploads.map((upload, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{upload.file.name}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            upload.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : upload.status === "error"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {upload.status}
                        </span>
                      </div>
                      <Progress value={upload.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Vehicle Documents
              </CardTitle>
              <CardDescription>Upload vehicle documents (max 5 files, 10MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="documents" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload documents</span>
                      <span className="mt-1 block text-sm text-gray-500">PDF, JPG, PNG up to 10MB each</span>
                    </Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,image/*"
                      onChange={handleDocumentSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {selectedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Documents:</h4>
                  <div className="space-y-2">
                    {selectedDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {documentUpload.uploads.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Upload Progress:</h4>
                  {documentUpload.uploads.map((upload, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{upload.file.name}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            upload.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : upload.status === "error"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {upload.status}
                        </span>
                      </div>
                      <Progress value={upload.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Car Condition & Auction Sheet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Car Condition Assessment & Auction Sheet
              </CardTitle>
              <CardDescription>
                Mark which parts are painted. Unticked parts are considered genuine. More genuine parts = higher grade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(partLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={key}
                      checked={carCondition[key as keyof CarCondition]}
                      onCheckedChange={(checked) => setCarCondition({ ...carCondition, [key]: checked as boolean })}
                      disabled={loading}
                    />
                    <Label htmlFor={key} className="text-sm font-medium">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{calculateGrade()}/5</p>
                    <p className="text-sm text-gray-600">Calculated Grade</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.keys(carCondition).length - Object.values(carCondition).filter(Boolean).length}
                    </p>
                    <p className="text-sm text-gray-600">Genuine Parts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {Object.values(carCondition).filter(Boolean).length}
                    </p>
                    <p className="text-sm text-gray-600">Painted Parts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{Object.keys(carCondition).length}</p>
                    <p className="text-sm text-gray-600">Total Parts</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={generateAuctionSheet} disabled={loading}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Auction Sheet
                </Button>
                <Button type="button" variant="outline" disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || imageUpload.isUploading || documentUpload.isUploading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Car...
                </>
              ) : (
                <>
                  <Car className="w-4 h-4 mr-2" />
                  Add Car to Inventory
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Add Seller Modal */}
        <Dialog open={isSellerModalOpen} onOpenChange={setIsSellerModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Seller</DialogTitle>
              <DialogDescription>
                Enter the seller information to add them to your system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSeller} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller-name">Full Name *</Label>
                <Input
                  id="seller-name"
                  value={sellerForm.name}
                  onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                  placeholder="Enter seller's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-cnic">CNIC / National ID *</Label>
                <Input
                  id="seller-cnic"
                  value={sellerForm.cnic}
                  onChange={(e) => setSellerForm({ ...sellerForm, cnic: e.target.value })}
                  placeholder="42101-1234567-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-phone">Phone Number *</Label>
                <Input
                  id="seller-phone"
                  value={sellerForm.phone}
                  onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                  placeholder="+92-300-1234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-email">Email</Label>
                <Input
                  id="seller-email"
                  type="email"
                  value={sellerForm.email}
                  onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                  placeholder="seller@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-address">Address</Label>
                <Input
                  id="seller-address"
                  value={sellerForm.address}
                  onChange={(e) => setSellerForm({ ...sellerForm, address: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsSellerModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Seller</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Dealer Modal */}
        <Dialog open={isDealerModalOpen} onOpenChange={setIsDealerModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Dealer</DialogTitle>
              <DialogDescription>
                Enter the dealer information to add them to your system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDealer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dealer-name">Full Name *</Label>
                <Input
                  id="dealer-name"
                  value={dealerForm.name}
                  onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })}
                  placeholder="Enter dealer's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-cnic">CNIC / National ID *</Label>
                <Input
                  id="dealer-cnic"
                  value={dealerForm.cnic}
                  onChange={(e) => setDealerForm({ ...dealerForm, cnic: e.target.value })}
                  placeholder="42101-1234567-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-phone">Phone Number *</Label>
                <Input
                  id="dealer-phone"
                  value={dealerForm.phone}
                  onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                  placeholder="+92-300-1234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-email">Email</Label>
                <Input
                  id="dealer-email"
                  type="email"
                  value={dealerForm.email}
                  onChange={(e) => setDealerForm({ ...dealerForm, email: e.target.value })}
                  placeholder="dealer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-address">Address *</Label>
                <Input
                  id="dealer-address"
                  value={dealerForm.address}
                  onChange={(e) => setDealerForm({ ...dealerForm, address: e.target.value })}
                  placeholder="Business address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-license">License Number</Label>
                <Input
                  id="dealer-license"
                  value={dealerForm.license_number}
                  onChange={(e) => setDealerForm({ ...dealerForm, license_number: e.target.value })}
                  placeholder="Dealer license number"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDealerModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Dealer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Investor Modal */}
        <Dialog open={isInvestorModalOpen} onOpenChange={setIsInvestorModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Investor</DialogTitle>
              <DialogDescription>
                Enter the investor information to add them to your system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInvestor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investor-name">Full Name *</Label>
                <Input
                  id="investor-name"
                  value={investorForm.name}
                  onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                  placeholder="Enter investor's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investor-cnic">CNIC / National ID *</Label>
                <Input
                  id="investor-cnic"
                  value={investorForm.cnic}
                  onChange={(e) => setInvestorForm({ ...investorForm, cnic: e.target.value })}
                  placeholder="42101-1234567-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investor-phone">Phone Number *</Label>
                <Input
                  id="investor-phone"
                  value={investorForm.phone}
                  onChange={(e) => setInvestorForm({ ...investorForm, phone: e.target.value })}
                  placeholder="+92-300-1234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investor-email">Email</Label>
                <Input
                  id="investor-email"
                  type="email"
                  value={investorForm.email}
                  onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })}
                  placeholder="investor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investor-address">Address</Label>
                <Input
                  id="investor-address"
                  value={investorForm.address}
                  onChange={(e) => setInvestorForm({ ...investorForm, address: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsInvestorModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Investor</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
