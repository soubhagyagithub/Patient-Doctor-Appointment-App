"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ModernNavbar } from "@/components/ModernNavbar"
import { ModernFooter } from "@/components/ModernFooter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doctorsAPI, type Doctor } from "@/lib/api"
import { Star, MapPin, Calendar, Clock, Video, Phone, Building, Award, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadDoctor(params.id as string)
    }
  }, [params.id])

  const loadDoctor = async (id: string) => {
    try {
      const doctorData = await doctorsAPI.getById(id)
      setDoctor(doctorData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctor profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookAppointment = (consultationType: string) => {
    if (!doctor) return
    router.push(`/booking/${doctor.id}?type=${consultationType}`)
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading doctor profile...</p>
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
                <p className="text-gray-600 dark:text-gray-400">The doctor profile you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => router.push("/find-doctors")}>
                  Back to Search
                </Button>
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
          {/* Doctor Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <img
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                />
                <div className="flex-1 text-center md:text-left">
                  {/* CHANGED: Added dark mode text colors */}
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-2">{doctor.specialty}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{doctor.qualifications}</p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold dark:text-gray-100">{doctor.rating}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">({doctor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Award className="w-5 h-5 mr-1" />
                      {/* IMPROVEMENT: Added "years" for clarity */}
                      {doctor.experience} years experience
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="w-5 h-5 mr-1" />
                      {doctor.reviewCount}+ patients treated
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400 mb-6">
                    <MapPin className="w-5 h-5 mr-2" />
                    {doctor.clinicAddress}
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {doctor.consultationType?.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type === "clinic" && <Building className="w-3 h-3 mr-1" />}
                        {type === "video" && <Video className="w-3 h-3 mr-1" />}
                        {type === "call" && <Phone className="w-3 h-3 mr-1" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)} Available
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Dr. {doctor.name.split(" ").pop()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{doctor.about}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Qualifications & Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Education</h4>
                          <p className="text-gray-700 dark:text-gray-300">{doctor.qualifications}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Experience</h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {doctor.experience} years in {doctor.specialty}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Specialization</h4>
                          <p className="text-gray-700 dark:text-gray-300">{doctor.specialty}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="availability" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Clinic Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {doctor.availability?.clinic?.map((day) => (
                          // CHANGED: Added dark mode border
                          <div
                            key={day}
                            className="flex justify-between items-center py-2 border-b dark:border-gray-800"
                          >
                            <span className="font-medium">{day}</span>
                            <div className="flex flex-wrap gap-2">
                              {doctor.timeSlots?.slice(0, 3).map((time) => (
                                <Badge key={time} variant="outline">
                                  {time}
                                </Badge>
                              ))}
                              {doctor.timeSlots && doctor.timeSlots.length > 3 && (
                                <Badge variant="outline">+{doctor.timeSlots.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Online Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {doctor.availability?.online?.map((day) => (
                          // CHANGED: Added dark mode border
                          <div
                            key={day}
                            className="flex justify-between items-center py-2 border-b dark:border-gray-800"
                          >
                            <span className="font-medium">{day}</span>
                            <div className="flex flex-wrap gap-2">
                              {doctor.timeSlots?.slice(0, 3).map((time) => (
                                <Badge key={time} variant="outline">
                                  {time}
                                </Badge>
                              ))}
                              {doctor.timeSlots && doctor.timeSlots.length > 3 && (
                                <Badge variant="outline">+{doctor.timeSlots.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Reviews</CardTitle>
                      <CardDescription>Based on {doctor.reviewCount} verified patient reviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* IMPROVEMENT: In a real app, these reviews would be fetched dynamically */}
                        <div className="border-b dark:border-gray-800 pb-4">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">John D. • 2 days ago</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            Excellent doctor! Very thorough and caring. Highly recommend.
                          </p>
                        </div>
                        <div className="border-b dark:border-gray-800 pb-4">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Sarah M. • 1 week ago</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            Great experience. The doctor was very professional and explained everything clearly.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.consultationType?.includes("clinic") && (
                    // CHANGED: Added dark mode border
                    <div className="p-4 border dark:border-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">Clinic Visit</span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${doctor.consultationFee}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">In-person consultation at clinic</p>
                      <Button className="w-full" onClick={() => handleBookAppointment("clinic")}>
                        Book Clinic Visit
                      </Button>
                    </div>
                  )}

                  {doctor.consultationType?.includes("video") && (
                    <div className="p-4 border dark:border-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Video className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                          <span className="font-medium">Video Call</span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${doctor.videoConsultationFee}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Online video consultation</p>
                      <Button className="w-full" onClick={() => handleBookAppointment("video")}>
                        Book Video Call
                      </Button>
                    </div>
                  )}

                  {doctor.consultationType?.includes("call") && (
                    <div className="p-4 border dark:border-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">Phone Call</span>
                        </div>
                        {/* FIXED: Using correct fee for phone calls */}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${doctor.callConsultationFee}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Audio consultation via phone</p>
                      <Button className="w-full" onClick={() => handleBookAppointment("call")}>
                        Book Phone Call
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>Response time: Within 2 hours</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>Next available: Today</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>{doctor.reviewCount}+ patients treated</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ModernFooter />
      </div>
    </ProtectedRoute>
  )
}