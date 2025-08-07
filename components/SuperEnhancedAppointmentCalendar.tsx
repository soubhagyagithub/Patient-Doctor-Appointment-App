"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import "@/app/styles/enhanced-calendar.css"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { appointmentsAPI, prescriptionsAPI, type Appointment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  RotateCcw,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  FileText,
  Filter,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  CalendarDays,
  Zap
} from "lucide-react"

interface AppointmentCalendarProps {
  doctorId: string
}

interface AppointmentEvent {
  id: string
  title: string
  start: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    appointment: Appointment
    patientName: string
    status: string
    date: string
    time: string
    specialty: string
  }
}

interface HoverInfo {
  x: number
  y: number
  appointment: Appointment
  visible: boolean
}

interface RescheduleConfirmation {
  appointment: Appointment
  oldDateTime: string
  newDateTime: string
  visible: boolean
}

export function SuperEnhancedAppointmentCalendar({ doctorId }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Array<{ id: string; appointmentId?: string; patientId: string; [key: string]: any }>>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({ x: 0, y: 0, appointment: null as any, visible: false })
  const [rescheduleConfirmation, setRescheduleConfirmation] = useState<RescheduleConfirmation>({
    appointment: null as any,
    oldDateTime: "",
    newDateTime: "",
    visible: false
  })
  const [cancelConfirmation, setCancelConfirmation] = useState({ appointment: null as any, visible: false })
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [patientFilter, setPatientFilter] = useState<string>("all-patients")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [showFilters, setShowFilters] = useState(false)
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const dragTimeoutRef = useRef<NodeJS.Timeout>()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadAppointments()
  }, [doctorId])

  useEffect(() => {
    applyFilters()
  }, [appointments, statusFilter, patientFilter, dateRange])

  const loadAppointments = async () => {
    try {
      const [appointmentsData, prescriptionsData] = await Promise.all([
        appointmentsAPI.getByDoctorId(doctorId),
        prescriptionsAPI.getByDoctorId(doctorId)
      ])
      setAppointments(appointmentsData)
      setPrescriptions(prescriptionsData)
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

  const applyFilters = () => {
    let filtered = [...appointments]

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Patient name filter
    if (patientFilter.trim() && patientFilter !== "all-patients") {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(patientFilter.toLowerCase())
      )
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date)
        const fromDate = dateRange.from!
        const toDate = dateRange.to || fromDate
        
        return aptDate >= fromDate && aptDate <= toDate
      })
    }

    setFilteredAppointments(filtered)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          backgroundColor: "#10b981",
          borderColor: "#059669",
          textColor: "#ffffff",
          label: "Confirmed",
          icon: CheckCircle
        }
      case "pending":
        return {
          backgroundColor: "#f59e0b",
          borderColor: "#d97706",
          textColor: "#ffffff",
          label: "Pending",
          icon: AlertCircle
        }
      case "completed":
        return {
          backgroundColor: "#6366f1",
          borderColor: "#4f46e5",
          textColor: "#ffffff",
          label: "Completed",
          icon: CheckCircle
        }
      case "cancelled":
        return {
          backgroundColor: "#ef4444",
          borderColor: "#dc2626",
          textColor: "#ffffff",
          label: "Cancelled",
          icon: XCircle
        }
      default:
        return {
          backgroundColor: "#6b7280",
          borderColor: "#4b5563",
          textColor: "#ffffff",
          label: "Unknown",
          icon: AlertCircle
        }
    }
  }

  const calendarEvents: AppointmentEvent[] = filteredAppointments.map(appointment => {
    const statusConfig = getStatusConfig(appointment.status)
    return {
      id: appointment.id,
      title: `${appointment.patientName}`,
      start: `${appointment.date}T${appointment.time}`,
      backgroundColor: statusConfig.backgroundColor,
      borderColor: statusConfig.borderColor,
      textColor: statusConfig.textColor,
      extendedProps: {
        appointment,
        patientName: appointment.patientName,
        status: appointment.status,
        date: appointment.date,
        time: appointment.time,
        specialty: appointment.specialty
      }
    }
  })

  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment
    setSelectedAppointment(appointment)
    setShowActionDialog(true)
  }

  const handleEventDrop = async (info: any) => {
    const appointment = info.event.extendedProps.appointment
    const newDate = info.event.start.toISOString().split('T')[0]
    const newTime = info.event.start.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    const oldDateTime = `${appointment.date} at ${appointment.time}`
    const newDateTime = `${newDate} at ${newTime}`

    // Show confirmation dialog for drag and drop
    setRescheduleConfirmation({
      appointment,
      oldDateTime,
      newDateTime,
      visible: true
    })
    
    // Revert the visual change until confirmed
    info.revert()
  }

  const confirmReschedule = async () => {
    const { appointment, newDateTime } = rescheduleConfirmation
    const [newDate, newTime] = newDateTime.split(' at ')
    
    try {
      await appointmentsAPI.updateDateTime(appointment.id, newDate, newTime)
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointment.id 
            ? { ...apt, date: newDate, time: newTime }
            : apt
        )
      )

      toast({
        title: "Appointment Rescheduled",
        description: `Successfully moved to ${newDateTime}`,
        className: "border-green-500 bg-green-50"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setRescheduleConfirmation({ ...rescheduleConfirmation, visible: false })
    }
  }

  const handleMouseEnter = (info: any, e: MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      const appointment = info.event.extendedProps.appointment
      setHoverInfo({
        x: e.clientX,
        y: e.clientY,
        appointment,
        visible: true
      })
    }, 500)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoverInfo(prev => ({ ...prev, visible: false }))
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment["status"]) => {
    if (newStatus === "completed") {
      setShowActionDialog(false)
      setShowCompletionDialog(true)
      return
    }

    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus)
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      )
      
      toast({
        title: "Status Updated",
        description: `Appointment marked as ${newStatus}`,
      })
      setShowActionDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  const handleCancelAppointment = (appointment: Appointment) => {
    setCancelConfirmation({ appointment, visible: true })
  }

  const confirmCancelAppointment = async () => {
    try {
      await appointmentsAPI.updateStatus(cancelConfirmation.appointment.id, "cancelled")
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === cancelConfirmation.appointment.id 
            ? { ...apt, status: "cancelled" }
            : apt
        )
      )
      
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully",
        className: "border-orange-500 bg-orange-50"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    } finally {
      setCancelConfirmation({ appointment: null, visible: false })
      setShowActionDialog(false)
    }
  }

  const handleCompleteAppointment = async (createPrescription: boolean) => {
    if (!selectedAppointment) return

    try {
      await appointmentsAPI.updateStatus(selectedAppointment.id, "completed")
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: "completed" }
            : apt
        )
      )
      
      toast({
        title: "Appointment Completed",
        description: "The appointment has been marked as completed",
        className: "border-blue-500 bg-blue-50"
      })

      if (createPrescription) {
        router.push(`/doctor/prescriptions?appointmentId=${selectedAppointment.id}&patientId=${selectedAppointment.patientId}&patientName=${encodeURIComponent(selectedAppointment.patientName)}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete appointment",
        variant: "destructive",
      })
    } finally {
      setShowCompletionDialog(false)
      setSelectedAppointment(null)
    }
  }

  const getPrescriptionForAppointment = (appointment: Appointment) => {
    return prescriptions.find(p => 
      p.appointmentId === appointment.id || 
      (p.patientId === appointment.patientId && appointment.status === "completed")
    )
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setPatientFilter("all-patients")
    setDateRange({})
  }

  const uniquePatients = [...new Set(appointments.map(apt => apt.patientName))].sort()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading calendar...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                Appointment Calendar
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Drag appointments to reschedule • Click for actions • Hover for details
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAppointments}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Patient</Label>
                  <Select value={patientFilter} onValueChange={setPatientFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Patients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-patients">All Patients</SelectItem>
                      {uniquePatients.map((patient) => (
                        <SelectItem key={patient} value={patient}>
                          {patient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Search Patient</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name..."
                      value={patientFilter}
                      onChange={(e) => setPatientFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Confirmed ({appointments.filter(a => a.status === "confirmed").length})
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                  Pending ({appointments.filter(a => a.status === "pending").length})
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                  Completed ({appointments.filter(a => a.status === "completed").length})
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  Cancelled ({appointments.filter(a => a.status === "cancelled").length})
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Filter className="w-3 h-3 mr-1" />
                  Showing {filteredAppointments.length} of {appointments.length}
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={calendarEvents}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            eventClassNames="cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            eventOverlap={false}
            selectOverlap={false}
            dragScroll={true}
            eventDragStart={(info) => {
              // Add visual feedback when drag starts
              info.el.style.opacity = '0.7'
              info.el.style.transform = 'scale(1.1)'
              info.el.style.zIndex = '1000'
            }}
            eventDidMount={(info) => {
              const appointment = info.event.extendedProps.appointment
              const statusConfig = getStatusConfig(appointment.status)
              
              // Add hover effects
              info.el.addEventListener('mouseenter', (e) => handleMouseEnter(info, e))
              info.el.addEventListener('mouseleave', handleMouseLeave)
              
              // Add custom styling
              info.el.style.borderRadius = '8px'
              info.el.style.border = `2px solid ${statusConfig.borderColor}`
              info.el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
              info.el.style.fontWeight = '600'
              info.el.style.transition = 'all 0.2s ease'
              
              // Add status indicator and action buttons
              info.el.style.position = 'relative'
              
              // Status dot
              const statusDot = document.createElement('div')
              statusDot.style.width = '8px'
              statusDot.style.height = '8px'
              statusDot.style.backgroundColor = statusConfig.borderColor
              statusDot.style.borderRadius = '50%'
              statusDot.style.position = 'absolute'
              statusDot.style.top = '4px'
              statusDot.style.right = '4px'
              statusDot.style.zIndex = '10'
              info.el.appendChild(statusDot)

              // Quick cancel button for non-cancelled appointments
              if (appointment.status !== "cancelled" && appointment.status !== "completed") {
                const cancelBtn = document.createElement('button')
                cancelBtn.innerHTML = '×'
                cancelBtn.style.position = 'absolute'
                cancelBtn.style.top = '2px'
                cancelBtn.style.left = '4px'
                cancelBtn.style.width = '16px'
                cancelBtn.style.height = '16px'
                cancelBtn.style.borderRadius = '50%'
                cancelBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'
                cancelBtn.style.color = 'white'
                cancelBtn.style.border = 'none'
                cancelBtn.style.fontSize = '12px'
                cancelBtn.style.fontWeight = 'bold'
                cancelBtn.style.cursor = 'pointer'
                cancelBtn.style.display = 'none'
                cancelBtn.style.zIndex = '20'
                cancelBtn.title = 'Cancel Appointment'
                
                cancelBtn.onclick = (e) => {
                  e.stopPropagation()
                  handleCancelAppointment(appointment)
                }
                
                info.el.appendChild(cancelBtn)
                
                // Show cancel button on hover
                info.el.addEventListener('mouseenter', () => {
                  cancelBtn.style.display = 'block'
                })
                info.el.addEventListener('mouseleave', () => {
                  cancelBtn.style.display = 'none'
                })
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Enhanced Hover Tooltip */}
      {hoverInfo.visible && hoverInfo.appointment && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm pointer-events-none animate-in fade-in-0 zoom-in-95"
          style={{ 
            left: Math.min(hoverInfo.x + 15, window.innerWidth - 300), 
            top: Math.max(hoverInfo.y - 10, 10) 
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {hoverInfo.appointment.patientName}
                </p>
                <Badge 
                  className={`${getStatusConfig(hoverInfo.appointment.status).backgroundColor} text-white border-0 text-xs`}
                >
                  {getStatusConfig(hoverInfo.appointment.status).label}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(hoverInfo.appointment.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{hoverInfo.appointment.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{hoverInfo.appointment.specialty}</span>
              </div>
              {hoverInfo.appointment.fee && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-center text-gray-500 font-bold">$</span>
                  <span>${hoverInfo.appointment.fee}</span>
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                💡 Drag to reschedule • Click for more actions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Confirmation Dialog */}
      <AlertDialog open={rescheduleConfirmation.visible} onOpenChange={(open) => 
        setRescheduleConfirmation({...rescheduleConfirmation, visible: open})}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              Confirm Reschedule
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reschedule this appointment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {rescheduleConfirmation.appointment && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <User className="w-4 h-4" />
                  {rescheduleConfirmation.appointment.patientName}
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-red-600">
                    <span>From: {rescheduleConfirmation.oldDateTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>To: {rescheduleConfirmation.newDateTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReschedule} className="bg-blue-600 hover:bg-blue-700">
              Confirm Reschedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelConfirmation.visible} onOpenChange={(open) => 
        setCancelConfirmation({...cancelConfirmation, visible: open})}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Cancel Appointment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {cancelConfirmation.appointment && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 font-medium mb-2">
                <User className="w-4 h-4" />
                {cancelConfirmation.appointment.patientName}
              </div>
              <div className="text-sm">
                {cancelConfirmation.appointment.date} at {cancelConfirmation.appointment.time}
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelAppointment} className="bg-red-600 hover:bg-red-700">
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action Dialog - Enhanced */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Appointment Management
            </DialogTitle>
            <DialogDescription>
              Choose an action for this appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedAppointment.patientName}</p>
                    <Badge className={`${getStatusConfig(selectedAppointment.status).backgroundColor} text-white border-0`}>
                      {getStatusConfig(selectedAppointment.status).label}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{selectedAppointment.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{selectedAppointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{selectedAppointment.specialty}</span>
                  </div>
                  {selectedAppointment.fee && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-center text-gray-500 font-bold">$</span>
                      <span>${selectedAppointment.fee}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRescheduleDialog(true)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reschedule
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed")}
                  disabled={selectedAppointment.status === "confirmed"}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, "pending")}
                  disabled={selectedAppointment.status === "pending"}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Pending
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed")}
                  disabled={selectedAppointment.status === "completed"}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleCancelAppointment(selectedAppointment)}
                  disabled={selectedAppointment.status === "cancelled"}
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => {
                    // Handle delete logic here
                    setShowActionDialog(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>

              {/* Prescription Management */}
              {selectedAppointment.status === "completed" && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Prescription Management</h4>
                  {(() => {
                    const existingPrescription = getPrescriptionForAppointment(selectedAppointment)
                    return existingPrescription ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push('/doctor/prescriptions')
                          setShowActionDialog(false)
                        }}
                        className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Prescription
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          router.push(`/doctor/prescriptions?appointmentId=${selectedAppointment.id}&patientId=${selectedAppointment.patientId}&patientName=${encodeURIComponent(selectedAppointment.patientName)}`)
                          setShowActionDialog(false)
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Create Prescription
                      </Button>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Complete Appointment
            </DialogTitle>
            <DialogDescription>
              Mark this appointment as completed and optionally create a prescription
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <User className="w-4 h-4" />
                  {selectedAppointment.patientName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedAppointment.date} at {selectedAppointment.time}
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Would you like to create a prescription for this patient?
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => handleCompleteAppointment(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Complete & Create Prescription
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleCompleteAppointment(false)}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Without Prescription
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCompletionDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Reschedule</DialogTitle>
            <DialogDescription>
              Select a new date and time for the appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>New Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <Label>New Time</Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Handle manual reschedule
                setShowRescheduleDialog(false)
              }}
              disabled={!rescheduleDate || !rescheduleTime}
            >
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
