"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSearchParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { SimpleFooter } from "@/components/SimpleFooter"
import { PrescriptionForm } from "@/components/PrescriptionForm"
import { PrescriptionList } from "@/components/PrescriptionList"
import { Button } from "@/components/ui/button"
import { prescriptionsAPI, appointmentsAPI, type Prescription, type Appointment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, FileText } from "lucide-react"
import { ApiStatusChecker } from "@/components/ApiStatusChecker"

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [initialFormData, setInitialFormData] = useState<any>(null)

  // Generate patients list from appointments
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([])

  // Update patients list when appointments load
  useEffect(() => {
    if (appointments.length > 0) {
      const uniquePatients = appointments.reduce((acc, appointment) => {
        if (!acc.find(p => p.id === appointment.patientId)) {
          acc.push({
            id: appointment.patientId,
            name: appointment.patientName
          })
        }
        return acc
      }, [] as Array<{ id: string; name: string }>)
      setPatients(uniquePatients)
    }
  }, [appointments])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Handle URL parameters for direct appointment prescription creation
  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId')
    const patientId = searchParams.get('patientId')
    const patientName = searchParams.get('patientName')

    if (appointmentId && patientId && patientName) {
      setInitialFormData({
        appointmentId,
        patientId,
        patientName: decodeURIComponent(patientName)
      })
      setShowForm(true)
    }
  }, [searchParams])

  const loadData = async () => {
    if (!user) return

    setIsLoading(true)
    setHasError(false)
    try {
      const [prescriptionsData, appointmentsData] = await Promise.all([
        prescriptionsAPI.getByDoctorId(user.id),
        appointmentsAPI.getByDoctorId(user.id)
      ])

      setPrescriptions(prescriptionsData)
      setAppointments(appointmentsData)
      setHasError(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setHasError(true)
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to load data. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingPrescription(null)
    setShowForm(true)
  }

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await prescriptionsAPI.delete(id)
      await loadData()
      toast({
        title: "Success",
        description: "Prescription deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive"
      })
    }
  }

  const handleFormSuccess = async () => {
    setShowForm(false)
    setEditingPrescription(null)

    // Check if this was created from an appointment
    const appointmentId = searchParams.get('appointmentId')

    if (appointmentId) {
      // Redirect back to appointments if prescription was created from appointment
      toast({
        title: "Success",
        description: "Prescription created successfully! Redirecting to appointments...",
      })
      setTimeout(() => {
        router.push('/doctor/appointments')
      }, 1500)
    } else {
      // Normal flow - stay on prescriptions page
      await loadData()
    }

    setInitialFormData(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingPrescription(null)
    setInitialFormData(null)
  }

  if (!user) return null

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {hasError && (
            <div className="mb-6">
              <ApiStatusChecker />
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Prescriptions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage patient prescriptions
              </p>
            </div>
            
            {!showForm && (
              <Button onClick={handleCreateNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Prescription
              </Button>
            )}
          </div>

          {showForm ? (
            <PrescriptionForm
              doctorId={user.id}
              doctorName={user.name}
              patients={patients}
              appointments={appointments}
              initialData={editingPrescription || initialFormData || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <PrescriptionList
              prescriptions={prescriptions}
              patients={patients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  )
}
