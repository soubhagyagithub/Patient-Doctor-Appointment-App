"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { SimpleFooter } from "@/components/SimpleFooter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { appointmentsAPI, prescriptionsAPI, type Appointment, type Prescription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Phone,
  Mail,
  Clock,
  User,
  Pill,
  Activity,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface PatientDetails {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  medicalHistory?: string[]
  allergies?: string[]
}

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const patientId = params.id as string

  useEffect(() => {
    if (user && patientId) {
      loadPatientData()
    }
  }, [user, patientId])

  const loadPatientData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [appointmentsData, prescriptionsData] = await Promise.all([
        appointmentsAPI.getByDoctorId(user.id),
        prescriptionsAPI.getByDoctorId(user.id)
      ])

      // Filter data for this patient
      const patientAppointments = appointmentsData.filter(apt => apt.patientId === patientId)
      const patientPrescriptions = prescriptionsData.filter(presc => presc.patientId === patientId)

      if (patientAppointments.length > 0) {
        // Create patient details from appointment data
        const firstAppointment = patientAppointments[0]
        setPatient({
          id: patientId,
          name: firstAppointment.patientName,
          email: `${firstAppointment.patientName.toLowerCase().replace(' ', '.')}@example.com`,
          phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          dateOfBirth: "1985-06-15", // Mock data
          address: "123 Main St, City, State 12345", // Mock data
          emergencyContact: "Jane Doe - +1 (555) 987-6543", // Mock data
          medicalHistory: ["Hypertension", "Type 2 Diabetes", "Allergic Rhinitis"],
          allergies: ["Penicillin", "Shellfish"]
        })
      } else if (patientPrescriptions.length > 0) {
        // Create patient details from prescription data
        const firstPrescription = patientPrescriptions[0]
        setPatient({
          id: patientId,
          name: firstPrescription.patientName,
          email: `${firstPrescription.patientName.toLowerCase().replace(' ', '.')}@example.com`,
          phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          dateOfBirth: "1985-06-15", // Mock data
          address: "123 Main St, City, State 12345", // Mock data
          emergencyContact: "Jane Doe - +1 (555) 987-6543", // Mock data
          medicalHistory: ["Hypertension", "Type 2 Diabetes"],
          allergies: ["Penicillin"]
        })
      } else {
        // Patient not found
        toast({
          title: "Patient not found",
          description: "The requested patient could not be found",
          variant: "destructive",
        })
        router.push("/doctor/patients")
        return
      }

      setAppointments(patientAppointments)
      setPrescriptions(patientPrescriptions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPatientAvatar = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700", 
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-indigo-100 text-indigo-700",
      "bg-yellow-100 text-yellow-700",
      "bg-red-100 text-red-700"
    ]
    const colorIndex = name.length % colors.length
    return colors[colorIndex]
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DoctorNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading patient data...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!patient) return null

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" asChild>
              <Link href="/doctor/patients">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Patients
              </Link>
            </Button>
          </div>

          {/* Patient Info Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className={`text-lg font-bold ${getPatientAvatar(patient.name)}`}>
                    {patient.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {patient.name}
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>DOB: {patient.dateOfBirth}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {appointments.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Appointments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {prescriptions.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Prescriptions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {appointments.filter(apt => apt.status === "completed").length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="medical">Medical Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(appointment.date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment.time}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No appointments found
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Prescriptions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Prescriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prescriptions.slice(0, 5).map((prescription) => (
                      <div key={prescription.id} className="py-3 border-b last:border-b-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(prescription.dateCreated), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {prescription.medicines.length} medicine(s)
                        </p>
                      </div>
                    ))}
                    {prescriptions.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No prescriptions found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(appointment.date), "EEEE, MMMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment.time} • {appointment.specialty}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No appointments found for this patient
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions">
              <Card>
                <CardHeader>
                  <CardTitle>All Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {format(new Date(prescription.dateCreated), "MMMM dd, yyyy")}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {prescription.medicines.length} medicine(s)
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {prescription.medicines.map((medicine, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Pill className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {medicine.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {medicine.dosage} • {medicine.duration}
                              </p>
                              {medicine.instructions && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                                  {medicine.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {prescription.notes && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Notes:</strong> {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    {prescriptions.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No prescriptions found for this patient
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patient.medicalHistory?.map((condition, index) => (
                        <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          {condition}
                        </div>
                      ))}
                      {(!patient.medicalHistory || patient.medicalHistory.length === 0) && (
                        <p className="text-gray-500 dark:text-gray-400">No medical history recorded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patient.allergies?.map((allergy, index) => (
                        <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
                          {allergy}
                        </div>
                      ))}
                      {(!patient.allergies || patient.allergies.length === 0) && (
                        <p className="text-gray-500 dark:text-gray-400">No known allergies</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address</h4>
                        <p className="text-gray-600 dark:text-gray-400">{patient.address}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Emergency Contact</h4>
                        <p className="text-gray-600 dark:text-gray-400">{patient.emergencyContact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  )
}
