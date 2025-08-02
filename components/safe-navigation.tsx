"use client"

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useSafeNavigation() {
  const router = useRouter()

  const navigate = useCallback((href: string) => {
    try {
      // Use window.location for more reliable navigation in case of RSC issues
      if (typeof window !== 'undefined') {
        window.location.href = href
      } else {
        router.push(href)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location
      if (typeof window !== 'undefined') {
        window.location.href = href
      }
    }
  }, [router])

  const refresh = useCallback(() => {
    try {
      router.refresh()
    } catch (error) {
      console.error('Refresh error:', error)
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }, [router])

  return { navigate, refresh }
}
