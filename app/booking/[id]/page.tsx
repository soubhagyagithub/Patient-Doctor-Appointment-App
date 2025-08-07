"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMemo } from "react"

import { appointmentsAPI, doctorsAPI, type Doctor } from "@/lib/api"
import { Calendar, Clock, Video, Phone, Building, CreditCard, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [consultationType, setConsultationType] = useState(searchParams.get("type") || "clinic")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  // IMPROVEMENT: Memoize available dates to avoid re-calculating on every render
  const availableDates =useMemo(() => {
    if (!doctor) return []
    const dates = []
    const today = new Date()

    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })

      // Check if doctor is available on this day
      const availabilityKey = consultationType === "clinic" ? "clinic" : "online"
      const isAvailable = doctor?.availability?.[availabilityKey]?.includes(dayName)

      if (isAvailable) {
        dates.push({
          date: date.toISOString().split("T")[0],
          display: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          dayName,
        })
      }
    }
    return dates
  }, [doctor, consultationType])

  useEffect(() => {
    if (params.id) {
      loadDoctor(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    // IMPROVEMENT: Set default date to the *first available* date
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].date)
    }
  }, [availableDates, selectedDate])

  const loadDoctor = async (id: string) => {
    try {
      const doctorData = await doctorsAPI.getById(id)
      setDoctor(doctorData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctor information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // FIXED: More robust fee calculation for different consultation types
  const getConsultationFee = () => {
    if (!doctor) return 0
    switch (consultationType) {
      case "clinic":
        return doctor.consultationFee
      case "video":
        return doctor.videoConsultationFee
      case "call":
        return doctor.callConsultationFee
      default:
        return 0
    }
  }

  const handleBookAppointment = async () => {
    if (!doctor || !user || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    setShowPayment(true)
  }

  const handlePayment = async () => {
    if (!doctor || !user) return
    setIsBooking(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const appointment = {
        doctorId: doctor.id,
        patientId: user.id,
        doctorName: doctor.name,
        patientName: user.name,
        specialty: doctor.specialty,
        date: selectedDate,
        time: selectedTime,
        status: "confirmed" as const,
        consultationType,
        symptoms,
        fee: getConsultationFee(),
      }

      await appointmentsAPI.create(appointment)
      setBookingComplete(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        {/* CHANGED: Added dark mode classes */}
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <ModernNavbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading booking information...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!doctor) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        {/* CHANGED: Added dark mode classes */}
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <ModernNavbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Doctor not found</h3>
                <Button onClick={() => router.push("/find-doctors")}>Back to Search</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (bookingComplete) {
    return (
      <ProtectedRoute allowedRoles={["patient"]}>
        {/* CHANGED: Added dark mode classes */}
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <ModernNavbar />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Booking Confirmed!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your appointment with Dr. {doctor.name} has been successfully booked.
                </p>
                <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg mb-6 text-gray-800 dark:text-gray-300">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(selectedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{consultationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">${getConsultationFee()}</span>
                    </div>
                  </div>
                </div>
                <div className="space-x-4">
                  <Button onClick={() => router.push("/appointments")}>View Appointments</Button>
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      {/* CHANGED: Added dark mode background */}
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <ModernNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            {/* CHANGED: Added dark mode text */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Book Appointment</h1>
            <p className="text-gray-600 dark:text-gray-400">Schedule your consultation with Dr. {doctor.name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {!showPayment ? (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={doctor.image || "/placeholder.svg"}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{doctor.name}</h3>
                          <p className="text-blue-600 dark:text-blue-400">{doctor.specialty}</p>
                          <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
                            {consultationType === "clinic" && <Building className="w-4 h-4 mr-1" />}
                            {consultationType === "video" && <Video className="w-4 h-4 mr-1" />}
                            {consultationType === "call" && <Phone className="w-4 h-4 mr-1" />}
                            <span className="text-sm capitalize">{consultationType} Consultation</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Select Date
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableDates.map((dateOption) => (
                          <button
                            key={dateOption.date}
                            onClick={() => setSelectedDate(dateOption.date)}
                            // CHANGED: Added dark mode classes for selected/unselected states
                            className={`p-3 text-center border rounded-lg transition-colors ${
                              selectedDate === dateOption.date
                                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:border-blue-400 dark:text-blue-300"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                          >
                            <div className="text-sm font-medium">{dateOption.display}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{dateOption.dayName}</div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Select Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {doctor.timeSlots?.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            // CHANGED: Added dark mode classes for selected/unselected states
                            className={`p-2 text-center border rounded-lg transition-colors ${
                              selectedTime === time
                                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:border-blue-400 dark:text-blue-300"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Describe Your Symptoms</CardTitle>
                      <CardDescription>
                        Please provide details about your condition to help the doctor prepare
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Describe your symptoms, concerns, or reason for consultation..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows={4}
                      />
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Proceed to Payment
                  </Button>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Information
                    </CardTitle>
                    <CardDescription>Complete your payment to confirm the appointment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input id="cardName" placeholder="John Doe" />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>

                    {/* CHANGED: Added dark mode border */}
                    <div className="pt-4 border-t dark:border-gray-700">
                      <Button className="w-full" size="lg" onClick={handlePayment} disabled={isBooking}>
                        {isBooking ? "Processing..." : `Pay $${getConsultationFee()} & Book Appointment`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Doctor:</span>
                      <span className="font-medium">{doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Specialty:</span>
                      <span className="font-medium">{doctor.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <div className="flex items-center">
                        {consultationType === "clinic" && <Building className="w-4 h-4 mr-1" />}
                        {consultationType === "video" && <Video className="w-4 h-4 mr-1" />}
                        {consultationType === "call" && <Phone className="w-4 h-4 mr-1" />}
                        <span className="font-medium capitalize">{consultationType}</span>
                      </div>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    )}
                  </div>

                  {/* CHANGED: Added dark mode border and text */}
                  <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${getConsultationFee()}
                      </span>
                    </div>
                  </div>

                  {consultationType !== "clinic" && (
                    // CHANGED: Added dark mode classes for note box
                    <div className="bg-blue-50 dark:bg-blue-950/60 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> You will receive a{" "}
                        {consultationType === "video" ? "video call" : "phone call"} link/number before your
                        appointment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}