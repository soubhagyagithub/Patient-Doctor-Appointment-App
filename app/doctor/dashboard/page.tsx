"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appointmentsAPI, type Appointment } from "@/lib/api"
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronDown,
  DollarSign,
  Activity,
  Star,
  Phone,
  Video,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Award,
  Heart
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (user) {
      loadAppointments()
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [user])

  const loadAppointments = async () => {
    if (!user) return

    try {
      const appointmentsData = await appointmentsAPI.getByDoctorId(user.id)
      setAppointments(appointmentsData)
      const stats = {
        total: appointmentsData.length,
        pending: appointmentsData.filter((a) => a.status === "pending").length,
        confirmed: appointmentsData.filter((a) => a.status === "confirmed").length,
        completed: appointmentsData.filter((a) => a.status === "completed").length,
        cancelled: appointmentsData.filter((a) => a.status === "cancelled").length,
      }
      setStats(stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === new Date().toISOString().split("T")[0],
  )

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getTodayDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getAppointmentType = (appointment: Appointment) => {
    const types = ["CONSULTATION", "FIRST VISIT", "EMERGENCY", "FOLLOW-UP"]
    return types[Math.floor(Math.random() * types.length)]
  }

  const getPatientAvatar = (patientName: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
      "bg-gradient-to-br from-green-400 to-green-600 text-white", 
      "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
      "bg-gradient-to-br from-pink-400 to-pink-600 text-white",
      "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white",
      "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
      "bg-gradient-to-br from-red-400 to-red-600 text-white"
    ]
    const colorIndex = patientName.length % colors.length
    return colors[colorIndex]
  }

  // Calculate analytics data
  const totalRevenue = appointments.filter(a => a.status === "completed").reduce((sum, appointment) => {
    return sum + (appointment.consultationType === "video" ? 100 : appointment.consultationType === "call" ? 75 : 150)
  }, 0)

  const thisMonthAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date)
    const currentDate = new Date()
    return appointmentDate.getMonth() === currentDate.getMonth() && 
           appointmentDate.getFullYear() === currentDate.getFullYear()
  })

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const patientSatisfaction = 4.8 // Mock data
  const avgConsultationTime = 28 // Mock data in minutes

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.name || "Doctor"}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  You have <span className="font-bold text-blue-600 dark:text-blue-400">{todayAppointments.length}</span> patients scheduled for today
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                  Helping patients heal, one appointment at a time
                </p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{getTodayDate()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-100">Total Revenue</CardTitle>
                  <DollarSign className="w-5 h-5 text-green-200" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-green-200 text-sm mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Patients Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 border-0 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Patients</CardTitle>
                  <Users className="w-5 h-5 text-blue-200" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="flex items-center text-blue-200 text-sm mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+8.2% this week</span>
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 border-0 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-100">Completion Rate</CardTitle>
                  <Target className="w-5 h-5 text-purple-200" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold">{completionRate}%</div>
                <div className="flex items-center text-purple-200 text-sm mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+3.1% improvement</span>
                </div>
              </CardContent>
            </Card>

            {/* Patient Satisfaction */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 border-0 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-yellow-100">Patient Rating</CardTitle>
                  <Star className="w-5 h-5 text-yellow-200" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold">{patientSatisfaction}</div>
                <div className="flex items-center text-yellow-200 text-sm mt-1">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>Excellent rating</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgConsultationTime}m</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Consultation</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.confirmed}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Appointments */}
            <div className="lg:col-span-2">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        Today's Schedule
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {todayAppointments.length} appointments scheduled
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="bg-white/50">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p>Loading appointments...</p>
                    </div>
                  ) : todayAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No appointments today</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">Take some time to rest!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="group relative p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ${getPatientAvatar(appointment.patientName)}`}>
                                <span className="text-sm">
                                  {appointment.patientName.split(" ").map((n) => n[0]).join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-lg">{appointment.patientName}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {getAppointmentType(appointment)}
                                  </Badge>
                                  {appointment.consultationType === "video" && <Video className="w-4 h-4 text-blue-500" />}
                                  {appointment.consultationType === "call" && <Phone className="w-4 h-4 text-green-500" />}
                                  {appointment.consultationType === "clinic" && <UserCheck className="w-4 h-4 text-purple-500" />}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {getStatusIcon(appointment.status)}
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{appointment.time}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{appointment.status}</p>
                              </div>
                              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors cursor-pointer" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics Panel */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 text-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-indigo-100">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-200">This Month</span>
                    <span className="font-bold">{thisMonthAppointments.length} appointments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-200">Success Rate</span>
                    <span className="font-bold">{completionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-200">Avg. Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="font-bold">{patientSatisfaction}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Types */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Consultation Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm">Video Calls</span>
                    </div>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Phone Calls</span>
                    </div>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm">In-Person</span>
                    </div>
                    <span className="font-semibold">30%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Consultation completed</p>
                      <p className="text-xs text-gray-500">John Doe - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">New appointment booked</p>
                      <p className="text-xs text-gray-500">Jane Smith - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Prescription issued</p>
                      <p className="text-xs text-gray-500">Mike Johnson - 6 hours ago</p>
                    </div>
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
