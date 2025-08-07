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
  FileText
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

export function EnhancedAppointmentCalendar({ doctorId }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Array<{ id: string; appointmentId?: string; patientId: string; [key: string]: any }>>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({ x: 0, y: 0, appointment: null as any, visible: false })
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadAppointments()
  }, [doctorId])

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

  const calendarEvents: AppointmentEvent[] = appointments.map(appointment => {
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

    try {
      // Update appointment date and time via API
      await appointmentsAPI.updateDateTime(appointment.id, newDate, newTime)

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointment.id
            ? { ...apt, date: newDate, time: newTime }
            : apt
        )
      )

      toast({
        title: "Success",
        description: `Appointment moved to ${newDate} at ${newTime}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
      // Revert the change
      info.revert()
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
    }, 500) // 500ms delay
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoverInfo(prev => ({ ...prev, visible: false }))
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment["status"]) => {
    // Special handling for completion - show prescription creation dialog
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
        title: "Success",
        description: `Appointment marked as ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
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
        title: "Success",
        description: "Appointment marked as completed",
      })

      if (createPrescription) {
        // Redirect to prescription creation with appointment details
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

  const handleReschedule = () => {
    if (!selectedAppointment) return
    setRescheduleDate(selectedAppointment.date)
    setRescheduleTime(selectedAppointment.time)
    setShowActionDialog(false)
    setShowRescheduleDialog(true)
  }

  const confirmReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return
    
    try {
      // Update appointment date and time via API
      await appointmentsAPI.updateDateTime(selectedAppointment.id, rescheduleDate, rescheduleTime)

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id
            ? { ...apt, date: rescheduleDate, time: rescheduleTime, status: "confirmed" }
            : apt
        )
      )

      toast({
        title: "Success",
        description: `Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setShowRescheduleDialog(false)
      setSelectedAppointment(null)
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentsAPI.cancelAppointment(appointmentId)
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  }

  // Check if prescription exists for the selected appointment
  const getPrescriptionForAppointment = (appointment: Appointment) => {
    return prescriptions.find(p =>
      p.appointmentId === appointment.id ||
      (p.patientId === appointment.patientId && appointment.status === "completed")
    )
  }

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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Enhanced Appointment Calendar
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {[
              { status: "confirmed", label: "Confirmed", color: "bg-green-500" },
              { status: "pending", label: "Pending", color: "bg-yellow-500" },
              { status: "completed", label: "Completed", color: "bg-purple-500" },
              { status: "cancelled", label: "Cancelled", color: "bg-red-500" }
            ].map(({ status, label, color }) => (
              <Badge key={status} variant="outline" className="flex items-center gap-1">
                <div className={`w-2 h-2 ${color} rounded-full`}></div>
                {label}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            • Click appointments for actions • Drag to reschedule • Hover for details
          </p>
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
            eventDidMount={(info) => {
              const appointment = info.event.extendedProps.appointment
              const statusConfig = getStatusConfig(appointment.status)
              
              // Add hover effects
              info.el.addEventListener('mouseenter', (e) => handleMouseEnter(info, e))
              info.el.addEventListener('mouseleave', handleMouseLeave)
              
              // Add custom styling
              info.el.style.borderRadius = '8px'
              info.el.style.border = `2px solid ${statusConfig.borderColor}`
              info.el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              info.el.style.fontWeight = '500'
              
              // Add status indicator
              const statusDot = document.createElement('div')
              statusDot.style.width = '8px'
              statusDot.style.height = '8px'
              statusDot.style.backgroundColor = statusConfig.borderColor
              statusDot.style.borderRadius = '50%'
              statusDot.style.position = 'absolute'
              statusDot.style.top = '2px'
              statusDot.style.right = '2px'
              info.el.style.position = 'relative'
              info.el.appendChild(statusDot)
            }}
          />
        </CardContent>
      </Card>

      {/* Hover Tooltip */}
      {hoverInfo.visible && hoverInfo.appointment && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm pointer-events-none"
          style={{ 
            left: Math.min(hoverInfo.x + 10, window.innerWidth - 300), 
            top: Math.max(hoverInfo.y - 10, 10) 
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <User className="w-4 h-4" />
              {hoverInfo.appointment.patientName}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              {hoverInfo.appointment.date}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              {hoverInfo.appointment.time}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              {hoverInfo.appointment.specialty}
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusConfig(hoverInfo.appointment.status).backgroundColor} text-white border-0`}
            >
              {getStatusConfig(hoverInfo.appointment.status).label}
            </Badge>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Appointment Actions
            </DialogTitle>
            <DialogDescription>
              Choose an action for this appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4" />
                  {selectedAppointment.patientName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  {selectedAppointment.date} at {selectedAppointment.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {selectedAppointment.specialty}
                </div>
                <Badge className={`${getStatusConfig(selectedAppointment.status).backgroundColor} text-white border-0`}>
                  {getStatusConfig(selectedAppointment.status).label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleReschedule}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reschedule
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, "confirmed")
                    setShowActionDialog(false)
                  }}
                  disabled={selectedAppointment.status === "confirmed"}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, "pending")
                    setShowActionDialog(false)
                  }}
                  disabled={selectedAppointment.status === "pending"}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Pending
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, "completed")
                    setShowActionDialog(false)
                  }}
                  disabled={selectedAppointment.status === "completed"}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, "cancelled")
                    setShowActionDialog(false)
                  }}
                  disabled={selectedAppointment.status === "cancelled"}
                  className="flex items-center gap-2 text-orange-600"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteAppointment(selectedAppointment.id)
                    setShowActionDialog(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>

              {/* Prescription Actions for Completed Appointments */}
              {selectedAppointment.status === "completed" && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Prescription Management
                  </h4>
                  {(() => {
                    const existingPrescription = getPrescriptionForAppointment(selectedAppointment)
                    return existingPrescription ? (
                      <div className="space-y-2">
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
                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                          Prescription created
                        </p>
                      </div>
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

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Reschedule Appointment
            </DialogTitle>
            <DialogDescription>
              Select a new date and time for the appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reschedule-date">New Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <Label htmlFor="reschedule-time">New Time</Label>
              <Input
                id="reschedule-time"
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
            <Button onClick={confirmReschedule} disabled={!rescheduleDate || !rescheduleTime}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog with Prescription Option */}
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
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4" />
                  {selectedAppointment.patientName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  {selectedAppointment.date} at {selectedAppointment.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {selectedAppointment.specialty}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Would you like to create a prescription for this patient?
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleCompleteAppointment(true)}
                    className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Complete & Create Prescription
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleCompleteAppointment(false)}
                    className="w-full flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Without Prescription
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCompletionDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
