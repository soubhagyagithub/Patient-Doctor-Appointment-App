"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prescriptionsAPI, patientsAPI, type Prescription, type Patient } from "@/lib/api"
import { FileText, Edit, Trash2, Loader2, Calendar, User, ArrowLeft, Search, Filter } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("") // YYYY-MM-DD
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("all") // "all", "Monday", etc.

  useEffect(() => {
    if (user) {
      loadPrescriptionsAndPatients()
    }
  }, [user])

  const loadPrescriptionsAndPatients = async () => {
    setIsLoading(true)
    try {
      const [prescriptionsData, patientsData] = await Promise.all([
        prescriptionsAPI.getAll(),
        patientsAPI.getAll(),
      ])

      // Filter prescriptions by the current doctor's ID
      const doctorPrescriptions = prescriptionsData.filter(
        (p) => p.doctorId === user?.id,
      )

      setPrescriptions(doctorPrescriptions)
      setPatients(patientsData)
    } catch (error) {
      console.error("Failed to load prescriptions or patients:", error)
      toast({
        title: "Error",
        description: "Failed to load prescriptions. Please check your network and API.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePrescription = async (id: string) => {
    try {
      await prescriptionsAPI.delete(id)
      toast({
        title: "Success",
        description: "Prescription deleted successfully!",
      })
      await loadPrescriptionsAndPatients() // Reload data
    } catch (error) {
      console.error("Failed to delete prescription:", error)
      toast({
        title: "Error",
        description: `Failed to delete prescription: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    return patient ? patient.name : "Unknown Patient"
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Memoize filtered and grouped prescriptions to avoid re-calculation on every render
  const filteredAndGroupedPrescriptions = useMemo(() => {
    let currentFilteredPrescriptions = prescriptions;

    // Apply date filter
    if (selectedDateFilter) {
      currentFilteredPrescriptions = currentFilteredPrescriptions.filter(
        (p) => p.datePrescribed === selectedDateFilter
      );
    }

    // Apply day of week filter
    if (selectedDayFilter !== "all") {
      currentFilteredPrescriptions = currentFilteredPrescriptions.filter(
        (p) => getDayName(p.datePrescribed) === selectedDayFilter
      );
    }

    // Group by patient name
    const grouped = currentFilteredPrescriptions.reduce((acc, prescription) => {
      const patientName = getPatientName(prescription.patientId);
      if (!acc[patientName]) {
        acc[patientName] = [];
      }
      acc[patientName].push(prescription);
      return acc;
    }, {} as Record<string, Prescription[]>);

    // Apply search term to grouped patient names
    return Object.entries(grouped).filter(([patientName]) =>
      patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prescriptions, patients, searchTerm, selectedDateFilter, selectedDayFilter]);


  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Patient Prescriptions
              </h1>
              <p className="text-slate-400 text-lg mt-2">Manage and view all patient prescriptions</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-teal-500/50"
              />
            </div>
            <Input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-teal-500/50"
            />
            <Select value={selectedDayFilter} onValueChange={setSelectedDayFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                <SelectItem value="all">All Days</SelectItem>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-slate-800/50">
                  <CardHeader>
                    <div className="h-6 bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-700 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-700 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndGroupedPrescriptions.length === 0 ? (
            <Card className="text-center py-16 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
              <CardContent>
                <div className="w-24 h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">No Prescriptions Found</h3>
                <p className="text-slate-400">
                  {searchTerm || selectedDateFilter || selectedDayFilter !== "all"
                    ? "No prescriptions match your current filter criteria."
                    : "You haven't issued any prescriptions yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {filteredAndGroupedPrescriptions.map(([patientName, patientPrescriptions]) => (
                <div key={patientName}>
                  <div className="flex items-center mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                    <h2 className="px-6 text-2xl font-bold text-white bg-slate-900/50 rounded-full py-2 flex items-center">
                      <User className="w-6 h-6 mr-3 text-teal-400" />
                      {patientName}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patientPrescriptions.map((prescription) => (
                      <Card
                        key={prescription.id}
                        className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="relative">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center text-white group-hover:text-blue-300 transition-colors">
                              <FileText className="w-5 h-5 mr-2 text-blue-400" />
                              Prescription
                            </CardTitle>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {prescription.datePrescribed}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center text-slate-400 mt-2">
                            <Calendar className="w-4 h-4 mr-2" />
                            Appointment ID: {prescription.appointmentId}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                          {prescription.symptoms && (
                            <div>
                              <h3 className="font-semibold text-slate-300 mb-1">Symptoms:</h3>
                              <p className="text-slate-400 text-sm">{prescription.symptoms}</p>
                            </div>
                          )}
                          {prescription.diagnosis && (
                            <div>
                              <h3 className="font-semibold text-slate-300 mb-1">Diagnosis:</h3>
                              <p className="text-slate-400 text-sm">{prescription.diagnosis}</p>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-300 mb-2">Medicines:</h3>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                              {prescription.medicines.map((med, idx) => (
                                <li key={idx}>
                                  <span className="font-medium text-white">{med.name}</span>: {med.dosage},{" "}
                                  {med.frequency} for {med.duration}
                                  {med.notes && ` (${med.notes})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {prescription.generalNotes && (
                            <div>
                              <h3 className="font-semibold text-slate-300 mb-2">General Notes:</h3>
                              <p className="text-slate-400 text-sm italic">{prescription.generalNotes}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={() => {
                                router.push(`/prescriptions/${prescription.id}/edit`)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1 bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-400">
                                    This action cannot be undone. This will permanently delete the prescription.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePrescription(prescription.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
