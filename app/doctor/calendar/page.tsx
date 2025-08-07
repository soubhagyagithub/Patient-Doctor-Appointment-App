"use client"

import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { AppointmentCalendar } from "@/components/AppointmentCalendar"
import { SimpleFooter } from "@/components/SimpleFooter"

export default function CalendarPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your appointments with drag-and-drop functionality
            </p>
          </div>

          {user && <AppointmentCalendar doctorId={user.id} />}
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  )
}
