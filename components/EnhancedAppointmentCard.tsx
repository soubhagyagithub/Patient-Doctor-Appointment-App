"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { appointmentsAPI, prescriptionsAPI, type Appointment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
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
  Video,
  Stethoscope,
  Eye,
  Download
} from "lucide-react"
import { PrescriptionActions } from './PrescriptionViewer'

interface EnhancedAppointmentCardProps {
  appointment: Appointment
  onUpdate?: (updatedAppointment: Appointment) => void
  onDelete?: (appointmentId: string) => void
  showActions?: boolean
  showPatientInfo?: boolean
  prescriptions?: Array<{ id: string; appointmentId?: string; patientId: string; [key: string]: any }>
}

export function EnhancedAppointmentCard({
  appointment,
  onUpdate,
  onDelete,
  showActions = true,
  showPatientInfo = true,
  prescriptions = []
}: EnhancedAppointmentCardProps) {
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState(appointment.date)
  const [rescheduleTime, setRescheduleTime] = useState(appointment.time)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Confirmed",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        }
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertCircle,
          label: "Pending",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        }
      case "completed":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: CheckCircle,
          label: "Completed",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200"
        }
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "Cancelled",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
          label: "Unknown",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        }
    }
  }

  const statusConfig = getStatusConfig(appointment.status)
  const StatusIcon = statusConfig.icon

  const updateAppointmentStatus = async (newStatus: Appointment["status"]) => {
    // Special handling for completion - show prescription creation dialog
    if (newStatus === "completed") {
      setShowActionDialog(false)
      setShowCompletionDialog(true)
      return
    }

    setIsUpdating(true)
    try {
      await appointmentsAPI.updateStatus(appointment.id, newStatus)
      const updatedAppointment = { ...appointment, status: newStatus }
      onUpdate?.(updatedAppointment)

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
    } finally {
      setIsUpdating(false)
      setShowActionDialog(false)
    }
  }

  const handleCompleteAppointment = async (createPrescription: boolean) => {
    setIsUpdating(true)
    try {
      await appointmentsAPI.updateStatus(appointment.id, "completed")
      const updatedAppointment = { ...appointment, status: "completed" }
      onUpdate?.(updatedAppointment)

      toast({
        title: "Success",
        description: "Appointment marked as completed",
      })

      if (createPrescription) {
        // Redirect to prescription creation with appointment details
        router.push(`/doctor/prescriptions?appointmentId=${appointment.id}&patientId=${appointment.patientId}&patientName=${encodeURIComponent(appointment.patientName)}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete appointment",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setShowCompletionDialog(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return
    
    setIsUpdating(true)
    try {
      await appointmentsAPI.updateStatus(appointment.id, "confirmed")
      const updatedAppointment = { 
        ...appointment, 
        date: rescheduleDate, 
        time: rescheduleTime, 
        status: "confirmed" as const 
      }
      onUpdate?.(updatedAppointment)

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
      setIsUpdating(false)
      setShowRescheduleDialog(false)
    }
  }

  const handleDelete = async () => {
    setIsUpdating(true)
    try {
      await appointmentsAPI.cancelAppointment(appointment.id)
      onDelete?.(appointment.id)
      
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
    } finally {
      setIsUpdating(false)
      setShowActionDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Check if prescription exists for this appointment
  const getPrescriptionForAppointment = () => {
    // First try to find by exact appointment ID match
    const exactMatch = prescriptions.find(p => p.appointmentId === appointment.id)
    if (exactMatch) return exactMatch

    // If no exact match and appointment is completed, look for any prescription for this patient from this doctor
    if (appointment.status === "completed") {
      return prescriptions.find(p =>
        p.patientId === appointment.patientId &&
        p.doctorId === appointment.doctorId
      )
    }

    return null
  }

  const existingPrescription = getPrescriptionForAppointment()

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-200 ${statusConfig.borderColor} border-l-4`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {showPatientInfo && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showPatientInfo ? appointment.patientName : `Dr. ${appointment.doctorName}`}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    {appointment.specialty}
                  </Badge>
                </div>
              </div>
            </div>
            
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActionDialog(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.time)}</span>
            </div>
          </div>
          
          {showActions && appointment.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => updateAppointmentStatus("confirmed")}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateAppointmentStatus("cancelled")}
                disabled={isUpdating}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
          
          {showActions && appointment.status === "confirmed" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => updateAppointmentStatus("completed")}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRescheduleDialog(true)}
                disabled={isUpdating}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
            </div>
          )}

          {/* Prescription Actions for Completed Appointments */}
          {showActions && appointment.status === "completed" && (
            <div className="space-y-2 pt-2">
              {existingPrescription ? (
                <div className="space-y-2">
                  <PrescriptionActions
                    prescription={existingPrescription}
                    doctorInfo={{
                      name: appointment.doctorName,
                      qualifications: "MD, MBBS",
                      specialty: appointment.specialty,
                      phone: "+1-555-0101",
                      clinicAddress: "123 Medical Plaza, Healthcare City",
                      registrationNumber: "MED12345"
                    }}
                  />
                  <p className="text-xs text-green-600 dark:text-green-400 text-center">
                    Prescription created
                  </p>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/doctor/prescriptions?appointmentId=${appointment.id}&patientId=${appointment.patientId}&patientName=${encodeURIComponent(appointment.patientName)}`)
                  }
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Prescription
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Appointment Actions
            </DialogTitle>
            <DialogDescription>
              Manage this appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className={`p-4 ${statusConfig.bgColor} rounded-lg border ${statusConfig.borderColor} space-y-2`}>
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4" />
                {appointment.patientName}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                {formatDate(appointment.date)} at {formatTime(appointment.time)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                {appointment.specialty}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRescheduleDialog(true)}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reschedule
              </Button>
              
              <Button
                variant="outline"
                onClick={() => updateAppointmentStatus("confirmed")}
                disabled={isUpdating || appointment.status === "confirmed"}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm
              </Button>
              
              <Button
                variant="outline"
                onClick={() => updateAppointmentStatus("pending")}
                disabled={isUpdating || appointment.status === "pending"}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Pending
              </Button>
              
              <Button
                variant="outline"
                onClick={() => updateAppointmentStatus("completed")}
                disabled={isUpdating || appointment.status === "completed"}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </Button>
              
              <Button
                variant="outline"
                onClick={() => updateAppointmentStatus("cancelled")}
                disabled={isUpdating || appointment.status === "cancelled"}
                className="flex items-center gap-2 text-orange-600"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
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
            <Button 
              variant="outline" 
              onClick={() => setShowRescheduleDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={!rescheduleDate || !rescheduleTime || isUpdating}
            >
              {isUpdating ? "Updating..." : "Confirm Reschedule"}
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

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4" />
                {appointment.patientName}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                {formatDate(appointment.date)} at {formatTime(appointment.time)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                {appointment.specialty}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Would you like to create a prescription for this patient?
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleCompleteAppointment(true)}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {isUpdating ? "Completing..." : "Complete & Create Prescription"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleCompleteAppointment(false)}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isUpdating ? "Completing..." : "Complete Without Prescription"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCompletionDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
