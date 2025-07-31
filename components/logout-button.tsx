"use client"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("clientId")
    localStorage.removeItem("userType") 
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout & Clear Session
    </Button>
  )
}
