"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { ModernFooter } from "@/components/ModernFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
// ADDED: Assuming the Doctor type has a specific callConsultationFee
import { doctorsAPI, type Doctor } from "@/lib/api"
import { Phone, Star, Calendar, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

/*
ASSUMED Doctor Type Update:
export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  // ... other properties
  consultationType?: ("call" | "video" | "in-person")[];
  callConsultationFee: number; // ADDED: Specific fee for calls
  videoConsultationFee: number;
  // ... other properties
};
*/

export default function CallConsultationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "all")
  const [sortBy, setSortBy] = useState("rating")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const doctorsData = await doctorsAPI.getAll()
      // Filter doctors who offer call consultations
      const callConsultationDoctors = doctorsData.filter((doctor) => doctor.consultationType?.includes("call"))
      setDoctors(callConsultationDoctors)
      setFilteredDoctors(callConsultationDoctors)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    // IMPROVEMENT: Use a shallow copy to prevent potential side effects
    let filtered = [...doctors]

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.about.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "experience":
          return Number.parseInt(b.experience) - Number.parseInt(a.experience)
        case "fee":
          // FIXED: Sort by callConsultationFee, not videoConsultationFee
          return a.callConsultationFee - b.callConsultationFee
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredDoctors(filtered)
  }

  useEffect(() => {
    handleSearch()
  }, [searchTerm, selectedSpecialty, sortBy, doctors])

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      {/* CHANGED: Added dark mode background colors */}
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <ModernNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {/* CHANGED: Added dark mode text color */}
              <Phone className="w-12 h-12 text-purple-600 dark:text-purple-400 mr-4" />
              {/* CHANGED: Added dark mode text color */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">Call Consultation</h1>
            </div>
            {/* CHANGED: Added dark mode text color */}
            <p className="text-gray-600 dark:text-gray-400 text-lg">Get medical advice through secure phone consultations</p>
          </div>

          {/* Search and Filters Card will be handled by shadcn's theme */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Search by doctor name, specialty, or condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="general medicine">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                      <SelectItem value="fee">Lowest Fee</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              {/* CHANGED: Added dark mode border color */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto"></div>
              {/* CHANGED: Added dark mode text color */}
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                {/* Icon color handled by text color utility */}
                <Phone className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                {/* Text colors will be handled by Card's theme */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No doctors found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                {/* CHANGED: Added dark mode text color */}
                <p className="text-gray-600 dark:text-gray-400">
                  Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available for phone
                  consultation
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={doctor.image || "/placeholder.svg"}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              {/* Text colors below are inherited from the card and will adapt */}
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{doctor.name}</h3>
                              <p className="text-purple-600 dark:text-purple-400 font-medium">{doctor.specialty}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.qualifications}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm font-medium dark:text-gray-200">{doctor.rating}</span>
                                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">({doctor.reviewCount})</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              {/* IMPROVEMENT: Added "years" for clarity */}
                              {doctor.experience} years experience
                            </div>
                            <div className="flex items-center text-sm">
                              <DollarSign className="w-4 h-4 mr-2" />
                              {/* FIXED: Display callConsultationFee, not videoConsultationFee */}
                              Phone consultation: ${doctor.callConsultationFee}
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              Available today
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{doctor.about}</p>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            {/* Badge component will adapt via its variants */}
                            <Badge variant="secondary" className="text-xs">
                              <Phone className="w-3 h-3 mr-1" />
                              Call Available
                            </Badge>
                            <div className="space-x-2">
                              <Link href={`/doctor/${doctor.id}`}>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                              <Link href={`/booking/${doctor.id}?type=call`}>
                                <Button size="sm">Book Phone Call</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <ModernFooter />
      </div>
    </ProtectedRoute>
  )
}