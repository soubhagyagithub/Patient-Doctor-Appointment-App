"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { appointmentsAPI, type Appointment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, X } from "lucide-react"

interface AppointmentCalendarProps {
  doctorId: string
}

export function AppointmentCalendar({ doctorId }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAppointments()
  }, [doctorId])

  const loadAppointments = async () => {
    try {
      const data = await appointmentsAPI.getByDoctorId(doctorId)
      setAppointments(data)
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

  const handleEventDrop = async (info: any) => {
    const { event } = info
    const appointmentId = event.id
    const newDate = info.event.start.toISOString().split('T')[0]
    const newTime = info.event.start.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    setSelectedEvent({
      id: appointmentId,
      title: event.title,
      newDate,
      newTime,
      oldDate: event.extendedProps.originalDate,
      oldTime: event.extendedProps.originalTime
    })
    setShowRescheduleDialog(true)
  }

  const confirmReschedule = async () => {
    if (!selectedEvent) return
    
    try {
      // Update appointment via API
      await appointmentsAPI.updateStatus(selectedEvent.id, "confirmed")
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedEvent.id 
            ? { ...apt, date: selectedEvent.newDate, time: selectedEvent.newTime }
            : apt
        )
      )

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
      // Revert the change
      await loadAppointments()
    } finally {
      setShowRescheduleDialog(false)
      setSelectedEvent(null)
    }
  }

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      patientName: info.event.extendedProps.patientName,
      date: info.event.extendedProps.date,
      time: info.event.extendedProps.time,
      status: info.event.extendedProps.status
    })
    setShowCancelDialog(true)
  }

  const confirmCancel = async () => {
    if (!selectedEvent) return
    
    try {
      await appointmentsAPI.updateStatus(selectedEvent.id, "cancelled")
      await loadAppointments()
      
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    } finally {
      setShowCancelDialog(false)
      setSelectedEvent(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#10b981"
      case "pending": return "#f59e0b"
      case "completed": return "#6366f1"
      case "cancelled": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const calendarEvents = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.patientName}`,
    start: `${appointment.date}T${appointment.time}`,
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    extendedProps: {
      patientName: appointment.patientName,
      status: appointment.status,
      date: appointment.date,
      time: appointment.time,
      originalDate: appointment.date,
      originalTime: appointment.time
    }
  }))

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
            Appointment Calendar
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Confirmed
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              Pending
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
              Completed
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Cancelled
            </Badge>
          </div>
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
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
            eventDidMount={(info) => {
              info.el.title = `${info.event.extendedProps.patientName} - ${info.event.extendedProps.status}`
            }}
          />
        </CardContent>
      </Card>

      {/* Reschedule Confirmation Dialog */}
      <AlertDialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reschedule</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-4">Are you sure you want to reschedule this appointment?</p>
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{selectedEvent?.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>From: {selectedEvent?.oldDate} at {selectedEvent?.oldTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Clock className="w-4 h-4" />
                    <span>To: {selectedEvent?.newDate} at {selectedEvent?.newTime}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRescheduleDialog(false)
              loadAppointments() // Revert the visual change
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmReschedule}>
              Confirm Reschedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-4">Are you sure you want to cancel this appointment?</p>
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{selectedEvent?.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{selectedEvent?.date} at {selectedEvent?.time}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              <X className="w-4 h-4 mr-2" />
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
