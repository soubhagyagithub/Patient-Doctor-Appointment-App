"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { PrescriptionForm } from "@/components/PrescriptionForm"
import { prescriptionsAPI, type Prescription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function EditPrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const prescriptionId = params.id as string

  useEffect(() => {
    if (prescriptionId) {
      loadPrescription()
    }
  }, [prescriptionId])

  const loadPrescription = async () => {
    setIsLoading(true)
    try {
      const data = await prescriptionsAPI.getById(prescriptionId)
      setPrescription(data)
    } catch (error) {
      console.error("Failed to load prescription for editing:", error)
      toast({
        title: "Error",
        description: "Failed to load prescription. Please try again.",
        variant: "destructive",
      })
      router.push("/doctor/prescriptions") // Redirect if not found or error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = (updatedPrescription: Prescription) => {
    toast({
      title: "Success",
      description: "Prescription updated successfully!",
    })
    router.push("/doctor/prescriptions") // Navigate back to list after update
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-slate-800 border-slate-700 text-white">
              <CardContent>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-400">Loading prescription...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!prescription) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-slate-800 border-slate-700 text-white">
              <CardContent>
                <h3 className="text-xl font-semibold text-white mb-2">Prescription not found</h3>
                <p className="text-slate-400">The prescription you're looking for doesn't exist.</p>
                <Button className="mt-4 bg-teal-500 hover:bg-teal-600" onClick={() => router.push("/doctor/prescriptions")}>
                  Back to Prescriptions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Edit Prescription
            </h1>
          </div>
          <PrescriptionForm
            appointmentId={prescription.appointmentId}
            patientId={prescription.patientId}
            patientName={prescription.patientName}
            doctorId={prescription.doctorId}
            doctorName={prescription.doctorName}
            initialData={prescription}
            onSuccess={handleSuccess}
            onClose={() => router.push("/doctor/prescriptions")}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
