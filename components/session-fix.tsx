"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"

export function SessionFix() {
  const [fixed, setFixed] = useState(false)

  const handleFixSession = () => {
    // Clear all session data
    localStorage.removeItem("clientId")
    localStorage.removeItem("userType") 
    localStorage.removeItem("username")
    setFixed(true)
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Session Fix Required
        </CardTitle>
        <CardDescription>
          Your session data is invalid. This happens when the database is reset.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Valid login accounts:</strong>
            <br />• Username: <code>test_client</code>, Password: <code>test123</code>
            <br />• Username: <code>sigma_motors</code>, Password: <code>sigma123</code>
            <br />• Username: <code>admin</code>, Password: <code>admin123</code>
          </AlertDescription>
        </Alert>
        
        {fixed ? (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Session cleared! Redirecting to login page...
            </AlertDescription>
          </Alert>
        ) : (
          <Button onClick={handleFixSession} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Session & Go to Login
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
