"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Camera, Upload, Download, FileText, X } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { dbOperations } from "@/lib/supabase-client"

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

export default function AddCarPage() {
  // Add authentication check
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "client") {
      window.location.href = "/"
      return
    }
  }, [])

  const { uploading, uploadProgress, uploadCarImages, uploadCarDocuments } = useFileUpload()

  const [carData, setCarData] = useState({
    make: "",
    model: "",
    year: "",
    registrationNumber: "",
    mileage: "",
    purchasePrice: "",
    askingPrice: "",
    purchaseDate: "",
    ownerName: "",
    dealerName: "",
    dealerCommission: "",
    description: "",
  })

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

  const [images, setImages] = useState<File[]>([])
  const [documents, setDocuments] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages([...images, ...newFiles])

      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
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

  const generateAuctionSheet = () => {
    const paintedParts = Object.values(carCondition).filter(Boolean).length
    const genuineParts = Object.keys(carCondition).length - paintedParts
    const grade = calculateGrade()

    const auctionSheetData = {
      car: `${carData.make} ${carData.model} ${carData.year}`,
      registrationNumber: carData.registrationNumber,
      mileage: carData.mileage,
      grade: grade,
      genuineParts: genuineParts,
      paintedParts: paintedParts,
      totalParts: Object.keys(carCondition).length,
      condition: carCondition,
      generatedDate: new Date().toLocaleDateString(),
    }

    // Create auction sheet content
    const auctionSheetContent = `
🚗 AUCTION SHEET
================

Car Details:
• Make & Model: ${auctionSheetData.car}
• Registration: ${carData.registrationNumber}
• Mileage: ${carData.mileage} km
• Owner: ${carData.ownerName}
• Date: ${auctionSheetData.generatedDate}

Condition Assessment:
• Overall Grade: ${grade}/5
• Genuine Parts: ${genuineParts}/${auctionSheetData.totalParts}
• Painted Parts: ${paintedParts}/${auctionSheetData.totalParts}

Parts Condition (✓ = Painted, ✗ = Genuine):
• Trunk: ${carCondition.trunk ? "✓ Painted" : "✗ Genuine"}
• Pillars: ${carCondition.pillars ? "✓ Painted" : "✗ Genuine"}
• Hood: ${carCondition.hood ? "✓ Painted" : "✗ Genuine"}
• Roof: ${carCondition.roof ? "✓ Painted" : "✗ Genuine"}
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

    // In a real app, this would generate a PDF
    alert(`Auction Sheet Generated!\n\n${auctionSheetContent}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const clientId = localStorage.getItem("clientId") || "temp-client-id"

      // Create car record first
      const carRecord = {
        client_id: clientId,
        make: carData.make,
        model: carData.model,
        year: Number.parseInt(carData.year),
        registration_number: carData.registrationNumber,
        mileage: Number.parseInt(carData.mileage),
        purchase_price: Number.parseFloat(carData.purchasePrice),
        asking_price: Number.parseFloat(carData.askingPrice),
        purchase_date: carData.purchaseDate,
        owner_name: carData.ownerName,
        description: carData.description,
        dealer_commission: carData.dealerCommission ? Number.parseFloat(carData.dealerCommission) : 0,
        status: "available",
      }

      const { data: carResult, error: carError } = await dbOperations.createCar(carRecord)

      if (carError) {
        throw new Error(`Failed to create car: ${carError.message}`)
      }

      const carId = carResult[0].id

      // Upload images if any
      if (images.length > 0) {
        const imageResult = await uploadCarImages(images, carId)
        if (!imageResult.success) {
          console.error("Failed to upload some images:", imageResult.error)
        }
      }

      // Upload documents if any
      if (documents.length > 0) {
        const documentResult = await uploadCarDocuments(documents, carId)
        if (!documentResult.success) {
          console.error("Failed to upload some documents:", documentResult.error)
        }
      }

      // Save car condition
      const conditionRecord = {
        car_id: carId,
        trunk_painted: carCondition.trunk,
        pillars_painted: carCondition.pillars,
        hood_painted: carCondition.hood,
        roof_painted: carCondition.roof,
        front_left_door_painted: carCondition.frontLeftDoor,
        front_right_door_painted: carCondition.frontRightDoor,
        back_left_door_painted: carCondition.backLeftDoor,
        back_right_door_painted: carCondition.backRightDoor,
        front_left_fender_painted: carCondition.frontLeftFender,
        front_right_fender_painted: carCondition.frontRightFender,
        back_left_fender_painted: carCondition.backLeftFender,
        back_right_fender_painted: carCondition.backRightFender,
        grade: calculateGrade(),
      }

      // You would save this to car_conditions table
      // await dbOperations.addCarCondition(conditionRecord)

      alert("Car profile created successfully!")
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error creating car:", error)
      alert(`Error creating car: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"
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
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the car</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={carData.make}
                    onChange={(e) => setCarData({ ...carData, make: e.target.value })}
                    placeholder="Toyota, Honda, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={carData.model}
                    onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                    placeholder="Corolla, Civic, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={carData.year}
                    onChange={(e) => setCarData({ ...carData, year: e.target.value })}
                    placeholder="2020"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={carData.registrationNumber}
                    onChange={(e) => setCarData({ ...carData, registrationNumber: e.target.value })}
                    placeholder="LZH-238"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (KM)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={carData.mileage}
                    onChange={(e) => setCarData({ ...carData, mileage: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (PKR)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={carData.purchasePrice}
                    onChange={(e) => setCarData({ ...carData, purchasePrice: e.target.value })}
                    placeholder="2500000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="askingPrice">Asking Price (PKR)</Label>
                  <Input
                    id="askingPrice"
                    type="number"
                    value={carData.askingPrice}
                    onChange={(e) => setCarData({ ...carData, askingPrice: e.target.value })}
                    placeholder="2800000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={carData.purchaseDate}
                    onChange={(e) => setCarData({ ...carData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={carData.ownerName}
                    onChange={(e) => setCarData({ ...carData, ownerName: e.target.value })}
                    placeholder="Previous owner name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={carData.description}
                  onChange={(e) => setCarData({ ...carData, description: e.target.value })}
                  placeholder="Additional details about the car..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dealer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dealer Information</CardTitle>
              <CardDescription>Details about dealers involved in the transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealerName">Dealer Name</Label>
                  <Input
                    id="dealerName"
                    value={carData.dealerName}
                    onChange={(e) => setCarData({ ...carData, dealerName: e.target.value })}
                    placeholder="Dealer involved in purchase/sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealerCommission">Dealer Commission (PKR)</Label>
                  <Input
                    id="dealerCommission"
                    type="number"
                    value={carData.dealerCommission}
                    onChange={(e) => setCarData({ ...carData, dealerCommission: e.target.value })}
                    placeholder="50000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images and Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Images and Documents</CardTitle>
              <CardDescription>Upload car images and related documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Progress */}
              {(uploading || isSubmitting) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploading ? "Uploading files..." : "Creating car profile..."}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="space-y-4">
                <Label>Car Images</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading || isSubmitting}
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                      </div>
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-8 bg-transparent"
                    disabled={uploading || isSubmitting}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                          disabled={uploading || isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label>Documents (Registration, etc.)</Label>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  disabled={uploading || isSubmitting}
                />
                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          disabled={uploading || isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Car Condition & Auction Sheet */}
          <Card>
            <CardHeader>
              <CardTitle>Car Condition Assessment & Auction Sheet</CardTitle>
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
                      disabled={isSubmitting}
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
                <Button type="button" variant="outline" onClick={generateAuctionSheet} disabled={isSubmitting}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Auction Sheet
                </Button>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || isSubmitting}>
              {isSubmitting ? "Creating Car Profile..." : "Add Car to Inventory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
