"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { PatientNavbar } from "@/components/PatientNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prescriptionsAPI, type Prescription } from "@/lib/api"
import { FileText, Calendar, User, ArrowLeft, Search, Filter, Eye } from 'lucide-react'
import { PrescriptionViewer } from '@/components/PrescriptionViewer'
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PatientPrescriptionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("") // YYYY-MM-DD
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("all") // "all", "Monday", etc.

  useEffect(() => {
    if (user) {
      loadPatientPrescriptions()
    }
  }, [user])

  const loadPatientPrescriptions = async () => {
    setIsLoading(true)
    try {
      const prescriptionsData = await prescriptionsAPI.getAll()

      // Filter prescriptions by the current patient's ID
      const patientPrescriptions = prescriptionsData.filter(
        (p) => p.patientId === user?.id,
      )

      setPrescriptions(patientPrescriptions)
    } catch (error) {
      console.error("Failed to load prescriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load your prescriptions. Please check your network and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Memoize filtered prescriptions to avoid re-calculation on every render
  const filteredPrescriptions = useMemo(() => {
    let currentFilteredPrescriptions = prescriptions;

    // Apply date filter
    if (selectedDateFilter) {
      currentFilteredPrescriptions = currentFilteredPrescriptions.filter(
        (p) => p.dateCreated?.split('T')[0] === selectedDateFilter
      );
    }

    // Apply day of week filter
    if (selectedDayFilter !== "all") {
      currentFilteredPrescriptions = currentFilteredPrescriptions.filter(
        (p) => getDayName(p.dateCreated || '') === selectedDayFilter
      );
    }

    // Apply search term to doctor names or medicine names
    if (searchTerm) {
      currentFilteredPrescriptions = currentFilteredPrescriptions.filter(
        (p) =>
          p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return currentFilteredPrescriptions.sort((a, b) =>
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );
  }, [prescriptions, searchTerm, selectedDateFilter, selectedDayFilter]);


  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PatientNavbar />
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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Prescriptions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">View and download your medical prescriptions</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by doctor or medicine name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
            />
            <Select value={selectedDayFilter} onValueChange={setSelectedDayFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent>
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
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Prescriptions Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || selectedDateFilter || selectedDayFilter !== "all"
                    ? "No prescriptions match your current filter criteria."
                    : "You don't have any prescriptions yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center text-gray-900 dark:text-white">
                        <FileText className="w-5 h-5 mr-2 text-blue-500" />
                        Prescription
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {prescription.dateCreated ? new Date(prescription.dateCreated).toLocaleDateString() : 'N/A'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-gray-600 dark:text-gray-400 mt-2">
                      <User className="w-4 h-4 mr-2" />
                      Dr. {prescription.doctorName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Medicines:</h3>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1">
                        {prescription.medicines.slice(0, 2).map((med, idx) => (
                          <li key={idx}>
                            <span className="font-medium text-gray-900 dark:text-white">{med.name}</span>: {med.dosage}
                          </li>
                        ))}
                        {prescription.medicines.length > 2 && (
                          <li className="text-blue-600 dark:text-blue-400">+{prescription.medicines.length - 2} more medicines</li>
                        )}
                      </ul>
                    </div>
                    {prescription.notes && (
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Notes:</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm italic line-clamp-2">{prescription.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <PrescriptionViewer
                        prescription={prescription}
                        doctorInfo={{
                          name: prescription.doctorName,
                          qualifications: "MD, MBBS",
                          specialty: "General Medicine",
                          phone: "+1-555-0101",
                          clinicAddress: "Shedula Health Center, 123 Medical Plaza, Healthcare City",
                          registrationNumber: "MED12345"
                        }}
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
