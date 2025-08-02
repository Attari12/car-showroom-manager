"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, LogIn, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { authenticateClient, testConnection } from "@/lib/supabase-client"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")

  // Test database connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Starting connection test...")
        const result = await testConnection()
        console.log("Connection test result:", result)

        if (result.success) {
          setConnectionStatus("connected")
        } else {
          setConnectionStatus("failed")
          setError(`Database connection failed: ${result.error}`)
        }
      } catch (error: any) {
        console.error("Connection check error:", error)
        setConnectionStatus("failed")
        setError("Unable to connect to database")
      }
    }

    checkConnection()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Check for admin credentials first
      if (credentials.username === "admin" && credentials.password === "admin123") {
        localStorage.setItem("userType", "admin")
        localStorage.setItem("username", "admin")
        window.location.href = "/admin"
        return
      }

      // Try client authentication
      console.log("Attempting client login for:", credentials.username)
      const result = await authenticateClient(credentials.username, credentials.password)
      console.log("Authentication result:", result)

      if (result.success && result.client) {
        localStorage.setItem("userType", "client")
        localStorage.setItem("username", result.client.username)
        localStorage.setItem("clientId", result.client.id)
        window.location.href = "/dashboard"
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-700">Car Showroom Manager</h1>
          <p className="text-gray-500 mt-2">Professional automotive inventory management</p>
        </div>

        {/* Connection Status */}
        {connectionStatus === "checking" && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Checking database connection...</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "failed" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Database connection failed. Please check your Supabase configuration.
              <br />
              <span className="text-xs mt-1 block">Error: {error}</span>
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "connected" && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Database connected successfully</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter your username"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
              </div>

              {error && connectionStatus === "connected" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || connectionStatus === "checking"}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>System automatically detects admin vs client login</p>
          <p className="mt-2">Contact administrator for account access</p>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-left text-gray-500">
              <p>
                <strong className="text-gray-600">Debug Info:</strong>
              </p>
              <p>Admin: admin / admin123</p>
              <p>Test Client: test_client / test123</p>
              <p>Connection: {connectionStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
