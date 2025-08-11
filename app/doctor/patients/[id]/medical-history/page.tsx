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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { appointmentsAPI, prescriptionsAPI, checkApiHealth, type Appointment, type Prescription } from "@/lib/api"
import { diagnosesAPI, type Diagnosis } from "@/lib/diagnoses-api"
import { useToast } from "@/hooks/use-toast"
import { format, isWithinInterval, parseISO } from "date-fns"
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Activity,
  Pill,
  AlertCircle,
  Download,
  Filter,
  Clock,
  TrendingUp,
  User,
  Stethoscope,
  FileX,
  Search
} from "lucide-react"
import Link from "next/link"

interface MedicalHistoryItem {
  id: string
  type: "appointment" | "diagnosis" | "prescription"
  date: string
  title: string
  subtitle?: string
  status?: string
  details: any
}

interface PatientSummary {
  id: string
  name: string
  totalAppointments: number
  totalPrescriptions: number
  totalDiagnoses: number
  activeConditions: number
  lastVisit?: string
}

export default function MedicalHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [patientSummary, setPatientSummary] = useState<PatientSummary | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<MedicalHistoryItem[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  })
  const [typeFilter, setTypeFilter] = useState<"all" | "appointment" | "diagnosis" | "prescription">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const patientId = params.id as string

  useEffect(() => {
    if (user && patientId) {
      loadMedicalHistory()
    }
  }, [user, patientId])

  useEffect(() => {
    applyFilters()
  }, [medicalHistory, dateRange, typeFilter, searchTerm])

  const loadMedicalHistory = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      console.log("Starting to load medical history for patient:", patientId)
      console.log("Current user (doctor):", user?.id, user?.name)

      // Check API health first - but don't fail if health check itself fails
      try {
        const healthCheck = await checkApiHealth()
        console.log("API Health Check before loading:", healthCheck)

        if (!healthCheck.isHealthy) {
          console.warn("API health check failed, but continuing with data loading:", healthCheck.error)
        }
      } catch (healthError) {
        console.warn("Health check failed, but continuing with data loading:", healthError)
      }

      // Load all data - diagnoses API will return empty array if not available
      console.log("Making API calls...")
      const [appointmentsData, prescriptionsData, diagnosesData] = await Promise.all([
        appointmentsAPI.getByDoctorId(user.id),
        prescriptionsAPI.getByDoctorId(user.id),
        diagnosesAPI.getByPatientId(patientId)
      ])

      console.log("API calls completed successfully:")
      console.log("- Appointments:", appointmentsData.length)
      console.log("- Prescriptions:", prescriptionsData.length)
      console.log("- Diagnoses:", diagnosesData.length)

      // Filter data for this patient - ensure arrays exist
      const patientAppointments = Array.isArray(appointmentsData) ?
        appointmentsData.filter(apt => apt.patientId === patientId) : []
      const patientPrescriptions = Array.isArray(prescriptionsData) ?
        prescriptionsData.filter(presc => presc.patientId === patientId) : []
      const patientDiagnoses = Array.isArray(diagnosesData) ? diagnosesData : []

      if (patientAppointments.length === 0 && patientPrescriptions.length === 0) {
        toast({
          title: "No medical history found",
          description: "This patient has no appointments or prescriptions on record, or there was an issue loading the data.",
          variant: "destructive",
        })
        router.push(`/doctor/patients/${patientId}`)
        return
      }

      setAppointments(patientAppointments)
      setPrescriptions(patientPrescriptions)
      setDiagnoses(patientDiagnoses)

      // Create patient summary
      const patientName = patientAppointments[0]?.patientName || patientPrescriptions[0]?.patientName || "Unknown Patient"
      const completedAppointments = patientAppointments.filter(apt => apt.status === "completed")
      const lastVisit = completedAppointments.length > 0 
        ? completedAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : undefined

      setPatientSummary({
        id: patientId,
        name: patientName,
        totalAppointments: patientAppointments.length,
        totalPrescriptions: patientPrescriptions.length,
        totalDiagnoses: patientDiagnoses.length,
        activeConditions: patientDiagnoses.filter(d => d.status === "Active" || d.status === "Chronic").length,
        lastVisit
      })

      // Combine all medical history items
      const historyItems: MedicalHistoryItem[] = []

      // Add appointments
      patientAppointments.forEach(appointment => {
        historyItems.push({
          id: `apt-${appointment.id}`,
          type: "appointment",
          date: appointment.date,
          title: `${appointment.specialty} Appointment`,
          subtitle: `Dr. ${appointment.doctorName.replace("Dr. ", "")} • ${appointment.time}`,
          status: appointment.status,
          details: appointment
        })
      })

      // Add diagnoses
      patientDiagnoses.forEach(diagnosis => {
        historyItems.push({
          id: `diag-${diagnosis.id}`,
          type: "diagnosis",
          date: diagnosis.dateOfDiagnosis,
          title: diagnosis.diagnosis,
          subtitle: `${diagnosis.severity || "Moderate"} severity • ${diagnosis.status}`,
          status: diagnosis.status.toLowerCase(),
          details: diagnosis
        })
      })

      // Add prescriptions
      patientPrescriptions.forEach(prescription => {
        historyItems.push({
          id: `presc-${prescription.id}`,
          type: "prescription",
          date: prescription.dateCreated,
          title: `Prescription - ${prescription.medicines.length} medicine(s)`,
          subtitle: prescription.medicines.map(m => m.name).join(", "),
          details: prescription
        })
      })

      // Sort chronologically (most recent first)
      historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setMedicalHistory(historyItems)
    } catch (error) {
      console.error("Error loading medical history:", error)

      let errorMessage = "Failed to load medical history. "
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage += "Unable to connect to the medical records server. Please check your internet connection."
        } else {
          errorMessage += error.message
        }
      } else {
        errorMessage += "Please try again or contact support if the issue persists."
      }

      toast({
        title: "Error Loading Medical History",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...medicalHistory]

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter)
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = parseISO(dateRange.start)
      const endDate = parseISO(dateRange.end)
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.date)
        return isWithinInterval(itemDate, { start: startDate, end: endDate })
      })
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredHistory(filtered)
  }

  const getStatusColor = (status: string, type: string) => {
    if (type === "appointment") {
      switch (status) {
        case "confirmed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      }
    } else if (type === "diagnosis") {
      switch (status) {
        case "active": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        case "chronic": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        case "improving": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      }
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Calendar className="w-5 h-5" />
      case "diagnosis": return <Stethoscope className="w-5 h-5" />
      case "prescription": return <Pill className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
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

  const downloadAsPDF = () => {
    // Create a comprehensive text version for download
    const textContent = generateMedicalHistoryReport()

    // Create downloadable text file (in a real implementation, you'd use a PDF library like jsPDF)
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${patientSummary?.name.replace(/\s+/g, '_')}_Medical_History_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Medical History Downloaded",
      description: "The medical history has been downloaded as a text file. In a production environment, this would be a formatted PDF.",
    })
  }

  const generateMedicalHistoryReport = (): string => {
    if (!patientSummary) return ""

    let report = `MEDICAL HISTORY REPORT\n`
    report += `======================\n\n`
    report += `Patient: ${patientSummary.name}\n`
    report += `Generated: ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}\n`
    report += `Generated by: Dr. ${user?.name?.replace("Dr. ", "") || "Unknown"}\n\n`

    report += `SUMMARY\n`
    report += `-------\n`
    report += `Total Appointments: ${patientSummary.totalAppointments}\n`
    report += `Total Diagnoses: ${patientSummary.totalDiagnoses}\n`
    report += `Total Prescriptions: ${patientSummary.totalPrescriptions}\n`
    report += `Active Conditions: ${patientSummary.activeConditions}\n`
    if (patientSummary.lastVisit) {
      report += `Last Visit: ${format(new Date(patientSummary.lastVisit), "MMMM dd, yyyy")}\n`
    }
    report += `\n`

    report += `CHRONOLOGICAL MEDICAL HISTORY\n`
    report += `==============================\n\n`

    filteredHistory.forEach((item, index) => {
      report += `${index + 1}. ${format(new Date(item.date), "MMMM dd, yyyy")} - ${item.title}\n`

      if (item.subtitle) {
        report += `   ${item.subtitle}\n`
      }

      if (item.status) {
        report += `   Status: ${item.status}\n`
      }

      if (item.type === "appointment" && item.details.vitalSigns) {
        report += `   Vital Signs:\n`
        if (item.details.vitalSigns.bloodPressure) report += `     Blood Pressure: ${item.details.vitalSigns.bloodPressure}\n`
        if (item.details.vitalSigns.heartRate) report += `     Heart Rate: ${item.details.vitalSigns.heartRate} bpm\n`
        if (item.details.vitalSigns.temperature) report += `     Temperature: ${item.details.vitalSigns.temperature}\n`
        if (item.details.vitalSigns.weight) report += `     Weight: ${item.details.vitalSigns.weight}\n`

        if (item.details.diagnosis) {
          report += `   Diagnosis: ${item.details.diagnosis}\n`
        }
        if (item.details.notes) {
          report += `   Notes: ${item.details.notes}\n`
        }
      }

      if (item.type === "diagnosis") {
        if (item.details.icdCode) report += `   ICD Code: ${item.details.icdCode}\n`
        if (item.details.severity) report += `   Severity: ${item.details.severity}\n`
        if (item.details.notes) report += `   Notes: ${item.details.notes}\n`
      }

      if (item.type === "prescription") {
        if (item.details.diagnosis) report += `   For: ${item.details.diagnosis}\n`
        report += `   Medications:\n`
        item.details.medicines.forEach((medicine: any) => {
          report += `     - ${medicine.name} ${medicine.dosage}\n`
          report += `       ${medicine.frequency} for ${medicine.duration}\n`
          if (medicine.instructions) {
            report += `       Instructions: ${medicine.instructions}\n`
          }
        })
        if (item.details.notes) {
          report += `   Notes: ${item.details.notes}\n`
        }
      }

      report += `\n`
    })

    report += `END OF REPORT\n`
    report += `Generated by Healthcare Management System\n`

    return report
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DoctorNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading medical history...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!patientSummary) return null

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href={`/doctor/patients/${patientId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Patient
                </Link>
              </Button>
            </div>
            <Button onClick={downloadAsPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Patient Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className={`text-lg font-bold ${getPatientAvatar(patientSummary.name)}`}>
                    {patientSummary.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {patientSummary.name} - Medical History
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete medical record with chronological timeline
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {patientSummary.totalAppointments}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Visits</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {patientSummary.totalDiagnoses}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Diagnoses</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {patientSummary.totalPrescriptions}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prescriptions</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {patientSummary.activeConditions}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Conditions</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {appointments.filter(apt => apt.status === "completed").length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed Visits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type-filter">Record Type</Label>
                  <select 
                    id="type-filter"
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="all">All Records</option>
                    <option value="appointment">Appointments</option>
                    <option value="diagnosis">Diagnoses</option>
                    <option value="prescription">Prescriptions</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDateRange({ start: "", end: "" })
                    setTypeFilter("all")
                    setSearchTerm("")
                  }}
                >
                  Clear Filters
                </Button>
                <Badge variant="secondary">
                  {filteredHistory.length} of {medicalHistory.length} records
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Information Banner - Only show if no diagnoses after successful API call */}
          {diagnoses.length === 0 && appointments.length > 0 && (
            <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Info:</strong> This patient has appointment and prescription records.
                    Formal diagnoses may be documented in appointment notes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {filteredHistory.filter(item => {
                        const itemDate = new Date(item.date)
                        const thirtyDaysAgo = new Date()
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                        return itemDate >= thirtyDaysAgo
                      }).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Visits/Month</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {appointments.length > 0
                        ? Math.round((appointments.length / Math.max(1,
                            Math.ceil((new Date().getTime() - new Date(Math.min(...appointments.map(apt => new Date(apt.date).getTime()))).getTime()) / (1000 * 60 * 60 * 24 * 30))
                          )) * 10) / 10
                        : 0
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Historical average</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Treatment Response</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {diagnoses.length > 0
                        ? `${Math.round((diagnoses.filter(d => d.status === "Resolved" || d.status === "Improving").length / diagnoses.length) * 100)}%`
                        : "N/A"
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {diagnoses.length > 0 ? "Improving/Resolved" : "No diagnoses data"}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Medical History Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No records found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {medicalHistory.length === 0 
                      ? "This patient has no medical history yet"
                      : "Try adjusting your filters to see more records"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {item.status && (
                              <Badge className={getStatusColor(item.status, item.type)}>
                                {item.status}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(item.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                        
                        {item.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.subtitle}
                          </p>
                        )}

                        {/* Detailed Information based on type */}
                        {item.type === "appointment" && (
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {item.details.diagnosis && (
                              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border-l-4 border-blue-500">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  <strong>Diagnosis:</strong> {item.details.diagnosis}
                                </p>
                              </div>
                            )}
                            {item.details.vitalSigns && (
                              <>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Vital Signs:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                                  {item.details.vitalSigns.bloodPressure && (
                                    <span>BP: {item.details.vitalSigns.bloodPressure}</span>
                                  )}
                                  {item.details.vitalSigns.heartRate && (
                                    <span>HR: {item.details.vitalSigns.heartRate} bpm</span>
                                  )}
                                  {item.details.vitalSigns.temperature && (
                                    <span>Temp: {item.details.vitalSigns.temperature}</span>
                                  )}
                                  {item.details.vitalSigns.weight && (
                                    <span>Weight: {item.details.vitalSigns.weight}</span>
                                  )}
                                </div>
                              </>
                            )}
                            {item.details.notes && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Notes:</strong> {item.details.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {item.type === "diagnosis" && (
                          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                              {item.details.icdCode && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-green-800 dark:text-green-200">ICD Code:</span>
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs font-mono">
                                    {item.details.icdCode}
                                  </span>
                                </div>
                              )}
                              {item.details.severity && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-green-800 dark:text-green-200">Severity:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.details.severity}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {item.details.notes && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                <strong>Clinical Notes:</strong> {item.details.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {item.type === "prescription" && (
                          <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                            {item.details.diagnosis && (
                              <div className="mb-3 p-2 bg-purple-100 dark:bg-purple-800/50 rounded">
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                  <strong>Prescribed For:</strong> {item.details.diagnosis}
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.details.medicines.map((medicine: any, idx: number) => (
                                <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-lg border shadow-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Pill className="w-4 h-4 text-purple-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {medicine.name} {medicine.dosage}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {medicine.frequency} for {medicine.duration}
                                  </div>
                                  {medicine.instructions && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      {medicine.instructions}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            {item.details.notes && (
                              <p className="text-sm text-purple-700 dark:text-purple-300 mt-3">
                                <strong>Prescription Notes:</strong> {item.details.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
