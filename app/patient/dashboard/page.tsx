"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { PatientNavbar } from "@/components/PatientNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appointmentsAPI, doctorsAPI, prescriptionsAPI, type Appointment, type Doctor } from "@/lib/api"
import { 
  Calendar, 
  Clock, 
  Star, 
  Heart,
  Activity,
  FileText,
  Users,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  MapPin,
  Phone,
  Video,
  Stethoscope,
  Plus,
  Search
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PatientDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalPrescriptions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (user && user.role === "patient") {
      loadDashboardData()
    } else if (user && user.role === "doctor") {
      router.push("/doctor/dashboard")
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [user, router])

  const loadDashboardData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [appointmentsData, doctorsData, prescriptionsData] = await Promise.all([
        appointmentsAPI.getByPatientId(user.id),
        doctorsAPI.getAll(),
        prescriptionsAPI.getByPatientId(user.id)
      ])

      setAppointments(appointmentsData)
      setDoctors(doctorsData)
      setPrescriptions(prescriptionsData)

      // Calculate stats
      const now = new Date()
      const upcoming = appointmentsData.filter(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`)
        return aptDate > now && apt.status !== "cancelled"
      }).length

      const completed = appointmentsData.filter(apt => apt.status === "completed").length

      setStats({
        totalAppointments: appointmentsData.length,
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        totalPrescriptions: prescriptionsData.length,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments
      .filter(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`)
        return aptDate > now && apt.status !== "cancelled"
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
      .slice(0, 3)
  }

  const getFeaturedDoctors = () => {
    return doctors
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "completed":
        return <Activity className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <PatientNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.name?.split(' ')[0] || "Patient"}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Take control of your health journey today
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                  Your health, our priority
                </p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button 
              onClick={() => router.push("/find-doctors")}
              className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Search className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Find Doctors</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push("/appointments")}
              className="h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">My Appointments</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push("/prescriptions")}
              className="h-20 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Prescriptions</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push("/profile")}
              className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">My Profile</span>
              </div>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prescriptions</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPrescriptions}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        Upcoming Appointments
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Your next scheduled consultations
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/appointments")}>
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p>Loading appointments...</p>
                    </div>
                  ) : getUpcomingAppointments().length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No upcoming appointments</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Book your next consultation</p>
                      <Button onClick={() => router.push("/find-doctors")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getUpcomingAppointments().map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{appointment.doctorName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.specialty}</p>
                                <div className="flex items-center mt-1">
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {getStatusIcon(appointment.status)}
                                    <span className="ml-1 capitalize">{appointment.status}</span>
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {new Date(appointment.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.time}</p>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                {appointment.consultationType === "video" && <Video className="w-3 h-3 mr-1" />}
                                {appointment.consultationType === "call" && <Phone className="w-3 h-3 mr-1" />}
                                {appointment.consultationType === "clinic" && <MapPin className="w-3 h-3 mr-1" />}
                                <span className="capitalize">{appointment.consultationType}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Featured Doctors */}
            <div className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Top Rated Doctors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getFeaturedDoctors().map((doctor) => (
                    <div key={doctor.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                         onClick={() => router.push(`/doctor/${doctor.id}`)}>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{doctor.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{doctor.rating || 4.8}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push("/find-doctors")}
                  >
                    View All Doctors
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Health Tips */}
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-green-100">Daily Health Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-100 text-sm leading-relaxed">
                    "Drink at least 8 glasses of water daily to keep your body hydrated and maintain optimal organ function."
                  </p>
                  <div className="flex items-center mt-4">
                    <Heart className="w-4 h-4 mr-2" />
                    <span className="text-xs">Stay healthy, stay happy!</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
