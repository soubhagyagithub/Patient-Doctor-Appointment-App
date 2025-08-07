"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { HeroSection } from "@/components/HeroSection"
import { SpecialtySlider } from "@/components/SpecialtySlider"
import { TestimonialSection } from "@/components/TestimonialSection"
import { ModernFooter } from "@/components/ModernFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doctorsAPI, appointmentsAPI, type Doctor } from "@/lib/api"
import { Search, MapPin, Star, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Landing Page Components
import { motion } from "framer-motion"
import Navbar from "@/components/landing/navbar"
import HeroSections from "@/components/landing/hero-section"
import AboutSection from "@/components/landing/about-section"
import ServicesSection from "@/components/landing/services-section"
import TestimonialsSection from "@/components/landing/testimonials-section"
import Footer from "@/components/landing/footer"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // This logic correctly handles routing for non-patients.
    if (!user) {
  
      router.replace('/')
    } else if (user.role === "doctor") {
      router.push("/doctor/dashboard")
      return
    } else if (user.role === "patient") {
      router.push('/patient/dashboard')
      loadDoctors()
    }
  }, [user, router])

  const loadDoctors = async () => {
    setIsLoading(true)
    try {
      const doctorsData = await doctorsAPI.getAll()
      setDoctors(doctorsData)
      setFilteredDoctors(doctorsData)
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
    let filtered = doctors

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
    }

    setFilteredDoctors(filtered)
  }

  const handleSpecialtySelect = (specialty: string) => {
    router.push(`/find-doctors?specialty=${specialty}`)
  }

  // This is a simplified booking for demonstration. In a real app, this would go to a full booking page.
  const bookAppointment = (doctor: Doctor) => {
    router.push(`/booking/${doctor.id}`)
  }

  useEffect(() => {
    if (doctors.length > 0) {
      handleSearch()
    }
  }, [searchTerm, selectedSpecialty, doctors])

  // Logged-out or non-patient users see the marketing/landing page content
  if (!user || user.role !== "patient") {
    return (
      // CHANGED: Use a consistent background color from your theme
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <Navbar />
      <HeroSections />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <Footer />
    </motion.div>
    )
  }

  // Logged-in patients see the dashboard/search functionality
  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="bg-white dark:bg-gray-950">
        <ModernNavbar />
        <HeroSection />
        <SpecialtySlider title="Book Appointment in Clinic" onSpecialtySelect={handleSpecialtySelect} />
        <SpecialtySlider title="Consult with Doctors Online" onSpecialtySelect={(specialty) => router.push(`/consultations?specialty=${specialty}`)} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Find & Book Appointments</h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Connect with qualified doctors in your area</p>
          </div>

          {/* IMPROVEMENT: Removed hardcoded background/text colors to use theme-aware defaults */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search doctors or specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="md:w-64">
                  <Select onValueChange={setSelectedSpecialty} defaultValue="all">
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
                      {/* FIXED: Consistent value for General Medicine */}
                      <SelectItem value="general medicine">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center text-gray-700 dark:text-white">Loading doctors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                // IMPROVEMENT: Removed hardcoded background/text colors
                <Card key={doctor.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <img src={doctor.image || '/placeholder.svg'} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <CardTitle>{doctor.name}</CardTitle>
                        <CardDescription className="text-teal-600 dark:text-teal-400">{doctor.specialty}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Star className="w-4 h-4 mr-2 text-yellow-400" />
                        {doctor.qualifications}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {/* IMPROVEMENT: Added "years" for clarity */}
                        {doctor.experience} years experience
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {doctor.clinicAddress}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => bookAppointment(doctor)}>
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDoctors.length === 0 && !isLoading && (
            <div className="text-center text-gray-700 dark:text-white py-8">
              <p className="text-lg">No doctors found matching your criteria.</p>
            </div>
          )}
        </div>

        <TestimonialSection />
        <ModernFooter />
      </div>
    </ProtectedRoute>
  )
}