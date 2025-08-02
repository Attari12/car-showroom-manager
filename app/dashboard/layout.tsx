"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClientSidebar } from "@/components/client-sidebar"
import { ErrorBoundary } from "@/components/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      // Check authentication
      const userType = localStorage.getItem("userType")
      const clientId = localStorage.getItem("clientId")

      if (userType !== "client" || !clientId) {
        router.push("/")
        return
      }

      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }, [router, mounted])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        <ClientSidebar />
        <div className="flex-1 lg:ml-0 overflow-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  )
}
