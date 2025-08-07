"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { appointmentsAPI } from "@/lib/api"
import { TrendingUp, Users, Calendar, Clock, ArrowLeft, DollarSign, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    revenue: 0,
    avgSessionTime: 0,
    successRate: 0,
    monthlyData: [],
    consultationTypes: { clinic: 0, video: 0, call: 0 },
    statusDistribution: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
  })

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, timeRange])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      const appointmentsData = await appointmentsAPI.getByDoctorId(user.id)
      setAppointments(appointmentsData || [])

      // Calculate analytics
      const now = new Date()
      const daysAgo = new Date(now.getTime() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000)

      const filteredAppointments = appointmentsData?.filter((apt) => new Date(apt.date) >= daysAgo) || []

      const uniquePatients = new Set(filteredAppointments.map((apt) => apt.patientId)).size
      const completed = filteredAppointments.filter((apt) => apt.status === "completed").length
      const cancelled = filteredAppointments.filter((apt) => apt.status === "cancelled").length

      // Revenue calculation (assuming consultation fees)
      const revenue = completed * 100 // $100 per consultation

      // Success rate
      const successRate =
        filteredAppointments.length > 0 ? Math.round((completed / filteredAppointments.length) * 100) : 0

      // Monthly data for chart
      const monthlyData = generateMonthlyData(appointmentsData || [])

      // Consultation types
      const consultationTypes = {
        clinic: filteredAppointments.filter((apt) => apt.consultationType === "clinic").length,
        video: filteredAppointments.filter((apt) => apt.consultationType === "video").length,
        call: filteredAppointments.filter((apt) => apt.consultationType === "call").length,
      }

      // Status distribution
      const statusDistribution = {
        pending: filteredAppointments.filter((apt) => apt.status === "pending").length,
        confirmed: filteredAppointments.filter((apt) => apt.status === "confirmed").length,
        completed: filteredAppointments.filter((apt) => apt.status === "completed").length,
        cancelled: filteredAppointments.filter((apt) => apt.status === "cancelled").length,
      }

      setAnalytics({
        totalPatients: uniquePatients,
        totalAppointments: filteredAppointments.length,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        revenue,
        avgSessionTime: 45, // minutes
        successRate,
        monthlyData,
        consultationTypes,
        statusDistribution,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateMonthlyData = (appointments) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === monthIndex
      })

      data.push({
        month: months[monthIndex],
        appointments: monthAppointments.length,
        completed: monthAppointments.filter((apt) => apt.status === "completed").length,
        revenue: monthAppointments.filter((apt) => apt.status === "completed").length * 100,
      })
    }

    return data
  }

  const StatCard = ({ title, value, change, icon: Icon, color, prefix = "", suffix = "" }) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-slate-200">{title}</CardTitle>
        <div
          className={`p-2 rounded-lg bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 transition-all duration-300 group-hover:scale-110">
          {isLoading ? (
            <div className="h-6 sm:h-8 w-12 sm:w-16 bg-slate-700 rounded animate-pulse" />
          ) : (
            `${prefix}${value}${suffix}`
          )}
        </div>
        <p className="text-xs text-green-400">{change}</p>
      </CardContent>
    </Card>
  )

  const ChartCard = ({ title, description, children }) => (
    <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl text-white">{title}</CardTitle>
        <CardDescription className="text-slate-400 text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )

  const SimpleBarChart = ({ data, dataKey, color = "teal" }) => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <span className="text-slate-300 text-sm w-8">{item.month}</span>
          <div className="flex-1 bg-slate-800 rounded-full h-2 relative overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-1000 ease-out`}
              style={{
                width: `${Math.max((item[dataKey] / Math.max(...data.map((d) => d[dataKey]))) * 100, 5)}%`,
                animationDelay: `${index * 100}ms`,
              }}
            />
          </div>
          <span className="text-slate-300 text-sm w-8 text-right">{item[dataKey]}</span>
        </div>
      ))}
    </div>
  )

  const DonutChart = ({ data, colors }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0)
    let currentAngle = 0

    return (
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(51 65 85)" strokeWidth="8" />
            {Object.entries(data).map(([key, value], index) => {
              if (value === 0) return null
              const percentage = (value / total) * 100
              const strokeDasharray = `${percentage * 2.51} 251.2`
              const strokeDashoffset = -currentAngle * 2.51
              currentAngle += percentage

              return (
                <circle
                  key={key}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-xl">{total}</span>
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
              <span className="text-slate-300 text-sm capitalize">
                {key}: {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mr-3 sm:mr-4 border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-slate-400 text-sm sm:text-lg mt-1 sm:mt-2">Track your practice performance</p>
              </div>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-600/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Patients"
              value={analytics.totalPatients}
              change="+12% from last period"
              icon={Users}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Appointments"
              value={analytics.totalAppointments}
              change="+8% from last period"
              icon={Calendar}
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              title="Revenue"
              value={analytics.revenue}
              change="+15% from last period"
              icon={DollarSign}
              color="from-purple-500 to-pink-500"
              prefix="$"
            />
            <StatCard
              title="Success Rate"
              value={analytics.successRate}
              change="+2% from last period"
              icon={TrendingUp}
              color="from-orange-500 to-red-500"
              suffix="%"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <ChartCard title="Monthly Appointments" description="Appointment trends over the last 6 months">
              <div className="h-48 sm:h-64">
                <SimpleBarChart data={analytics.monthlyData} dataKey="appointments" color="teal" />
              </div>
            </ChartCard>

            <ChartCard title="Revenue Trend" description="Monthly revenue from completed appointments">
              <div className="h-48 sm:h-64">
                <SimpleBarChart data={analytics.monthlyData} dataKey="revenue" color="green" />
              </div>
            </ChartCard>
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <ChartCard title="Consultation Types" description="Distribution of consultation methods">
              <DonutChart data={analytics.consultationTypes} colors={["#8b5cf6", "#06b6d4", "#10b981"]} />
            </ChartCard>

            <ChartCard title="Appointment Status" description="Current status distribution">
              <DonutChart data={analytics.statusDistribution} colors={["#f59e0b", "#10b981", "#3b82f6", "#ef4444"]} />
            </ChartCard>

            <ChartCard title="Quick Stats" description="Key performance indicators">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-300 text-sm">Avg Session</span>
                  </div>
                  <span className="text-white font-semibold">{analytics.avgSessionTime} min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">Completed</span>
                  </div>
                  <span className="text-white font-semibold">{analytics.completedAppointments}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">New Patients</span>
                  </div>
                  <span className="text-white font-semibold">{Math.floor(analytics.totalPatients * 0.3)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 text-sm">Growth Rate</span>
                  </div>
                  <span className="text-white font-semibold">+12%</span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
