"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("doctor" | "patient")[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth")
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to the appropriate dashboard if role doesn't match
        router.push(user.role === "doctor" ? "/doctor/dashboard" : "/")
        return
      }
    }
  }, [user, isLoading, router, allowedRoles])

  if (isLoading) {
    return (
      // CHANGED: Added theme-aware background
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          {/* IMPROVEMENT: Added a visual spinner for a better loading experience */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          {/* CHANGED: Added theme-aware text color */}
          <p className="text-gray-700 dark:text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or authorized, return null while the redirect happens
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}