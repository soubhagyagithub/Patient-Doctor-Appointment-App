"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { SimpleFooter } from "@/components/SimpleFooter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { appointmentsAPI, prescriptionsAPI, type Appointment, type Prescription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Users, 
  Calendar, 
  FileText, 
  Phone, 
  Mail,
  Eye,
  Clock,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

interface PatientStats {
  id: string
  name: string
  email: string
  phone: string
  totalAppointments: number
  upcomingAppointments: number
  totalPrescriptions: number
  lastVisit: string | null
  status: "active" | "inactive"
}

export default function PatientsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<PatientStats[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPatients()
    }
  }, [user])

  const loadPatients = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [appointments, prescriptions] = await Promise.all([
        appointmentsAPI.getByDoctorId(user.id),
        prescriptionsAPI.getByDoctorId(user.id)
      ])

      // Group data by patient
      const patientMap = new Map<string, PatientStats>()

      // Process appointments
      appointments.forEach(appointment => {
        const patientId = appointment.patientId
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: appointment.patientName,
            email: `${appointment.patientName.toLowerCase().replace(' ', '.')}@example.com`,
            phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            totalAppointments: 0,
            upcomingAppointments: 0,
            totalPrescriptions: 0,
            lastVisit: null,
            status: "active"
          })
        }

        const patient = patientMap.get(patientId)!
        patient.totalAppointments++
        
        const appointmentDate = new Date(appointment.date)
        const today = new Date()
        
        if (appointmentDate >= today && appointment.status !== "cancelled") {
          patient.upcomingAppointments++
        }
        
        if (appointment.status === "completed" && 
            (!patient.lastVisit || appointmentDate > new Date(patient.lastVisit))) {
          patient.lastVisit = appointment.date
        }
      })

      // Process prescriptions
      prescriptions.forEach(prescription => {
        const patientId = prescription.patientId
        if (patientMap.has(patientId)) {
          const patient = patientMap.get(patientId)!
          patient.totalPrescriptions++
        }
      })

      // Determine status based on activity
      patientMap.forEach(patient => {
        const lastVisitDate = patient.lastVisit ? new Date(patient.lastVisit) : null
        const daysSinceLastVisit = lastVisitDate 
          ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity

        patient.status = daysSinceLastVisit <= 90 ? "active" : "inactive"
      })

      setPatients(Array.from(patientMap.values()))
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

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const formatLastVisit = (date: string | null) => {
    if (!date) return "No visits"
    const visitDate = new Date(date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - visitDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DoctorNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading patients...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Patients
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your patient database and view their information
            </p>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {patients.filter(p => p.status === "active").length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Patient Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No patients found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "Try adjusting your search terms" : "Your patients will appear here"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className={`font-semibold ${getPatientAvatar(patient.name)}`}>
                              {patient.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {patient.name}
                            </h3>
                            <Badge 
                              variant={patient.status === "active" ? "default" : "secondary"}
                              className={patient.status === "active" ? "bg-green-100 text-green-800" : ""}
                            >
                              {patient.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {patient.totalAppointments}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {patient.upcomingAppointments}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {patient.totalPrescriptions}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Prescriptions</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <Clock className="w-4 h-4" />
                            <span>Last visit: {formatLastVisit(patient.lastVisit)}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <Button asChild size="sm" className="w-full">
                              <Link href={`/doctor/patients/${patient.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="w-full">
                              <Link href={`/doctor/patients/${patient.id}/medical-history`}>
                                <FileText className="w-4 h-4 mr-2" />
                                Medical History
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  )
}
