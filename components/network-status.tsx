"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      // Try to fetch from the current domain to test connectivity
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      setIsOnline(response.ok)
    } catch (error) {
      console.warn('Network check failed:', error)
      setIsOnline(false)
    } finally {
      setIsChecking(false)
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine)
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      checkConnection()
    }
    
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connection check
    const interval = setInterval(checkConnection, 30000) // Check every 30s

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  // Don't show anything if connection is good
  if (isOnline) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Network connection issue detected. Some features may not work properly.
          {lastChecked && (
            <span className="text-xs block mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
          className="ml-4"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          {isChecking ? 'Checking...' : 'Retry'}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
