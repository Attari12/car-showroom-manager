"use client"

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export function useClientRouter() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const safeNavigate = useCallback((href: string, options?: { replace?: boolean }) => {
    setIsNavigating(true)
    
    try {
      if (options?.replace) {
        // For replace navigation, use window.location to avoid RSC issues
        if (typeof window !== 'undefined') {
          window.location.replace(href)
        }
      } else {
        // For push navigation, try router first, fallback to window
        router.push(href)
      }
    } catch (error) {
      console.warn('Router navigation failed, falling back to window.location:', error)
      if (typeof window !== 'undefined') {
        if (options?.replace) {
          window.location.replace(href)
        } else {
          window.location.href = href
        }
      }
    } finally {
      // Reset navigation state after a delay
      setTimeout(() => setIsNavigating(false), 1000)
    }
  }, [router])

  const safeRefresh = useCallback(() => {
    try {
      router.refresh()
    } catch (error) {
      console.warn('Router refresh failed, falling back to window.location.reload:', error)
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }, [router])

  const safeBack = useCallback(() => {
    try {
      router.back()
    } catch (error) {
      console.warn('Router back failed, falling back to window.history.back:', error)
      if (typeof window !== 'undefined') {
        window.history.back()
      }
    }
  }, [router])

  return {
    navigate: safeNavigate,
    refresh: safeRefresh,
    back: safeBack,
    isNavigating,
  }
}
