"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppShareProps {
  message: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  children?: React.ReactNode
}

export function WhatsAppShare({
  message,
  variant = "outline",
  size = "sm",
  className = "",
  children,
}: WhatsAppShareProps) {
  const shareOnWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={shareOnWhatsApp}>
      {children || (
        <>
          <MessageCircle className="w-4 h-4 mr-1" />
          WhatsApp
        </>
      )}
    </Button>
  )
}

// Utility functions for different types of sharing
export const createCarShareMessage = (car: any) => {
  return (
    `🚗 *${car.make} ${car.model} ${car.year}*\n\n` +
    `💰 *Price:* ${new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(car.askingPrice)}\n` +
    `📅 *Year:* ${car.year}\n` +
    `👤 *Owner:* ${car.ownerName}\n` +
    `📋 *Status:* ${car.status === "available" ? "Available" : "Sold"}\n\n` +
    `📝 *Description:* ${car.description || "Excellent condition vehicle"}\n\n` +
    `Contact us for more details and to schedule a viewing!`
  )
}

export const createDocumentShareMessage = (documentName: string, carDetails: string) => {
  return (
    `📄 *${documentName}*\n\n` +
    `Car: ${carDetails}\n\n` +
    `Document shared for your reference.\n` +
    `Contact us for more information!`
  )
}

export const createImageShareMessage = (carDetails: string, imageDescription: string) => {
  return (
    `📸 *${carDetails}* - ${imageDescription}\n\n` +
    `High-quality image of the vehicle.\n` +
    `Contact us for more photos and details!`
  )
}
