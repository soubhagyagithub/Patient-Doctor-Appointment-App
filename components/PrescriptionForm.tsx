"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, FileText } from "lucide-react"
import { prescriptionsAPI, type Prescription, type Medicine } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
})

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  patientName: z.string().min(1, "Patient name is required"),
  appointmentId: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
  notes: z.string().optional(),
})

type PrescriptionFormData = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
  doctorId: string
  doctorName: string
  patients: Array<{ id: string; name: string }>
  appointments?: Array<{ id: string; patientName: string; patientId: string }>
  initialData?: Partial<Prescription>
  onSuccess: () => void
  onCancel: () => void
}

export function PrescriptionForm({
  doctorId,
  doctorName,
  patients,
  appointments = [],
  initialData,
  onSuccess,
  onCancel
}: PrescriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: initialData?.patientId || "",
      patientName: initialData?.patientName || "",
      appointmentId: initialData?.appointmentId || "",
      medicines: initialData?.medicines || [{ name: "", dosage: "", duration: "", instructions: "" }],
      notes: initialData?.notes || "",
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines"
  })

  const selectedPatientId = watch("patientId")
  const selectedAppointmentId = watch("appointmentId")

  // Update form when initialData changes (for appointment linking)
  useEffect(() => {
    if (initialData) {
      if (initialData.patientId) setValue("patientId", initialData.patientId)
      if (initialData.patientName) setValue("patientName", initialData.patientName)
      if (initialData.appointmentId) setValue("appointmentId", initialData.appointmentId)
    }
  }, [initialData, setValue])

  // Debug log to check form state
  useEffect(() => {
    console.log("Form state:", { selectedPatientId, selectedAppointmentId })
    console.log("Available patients:", patients)
    console.log("Available appointments:", appointments)
  }, [selectedPatientId, selectedAppointmentId, patients, appointments])

  const handlePatientChange = (patientId: string) => {
    console.log("Patient changed to:", patientId)
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setValue("patientId", patientId)
      setValue("patientName", patient.name)
      // Clear appointment selection when changing patient
      setValue("appointmentId", "")
      console.log("Updated patient:", patient.name, "Cleared appointment")
    }
  }

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsLoading(true)
    try {
      if (initialData?.id) {
        await prescriptionsAPI.update(initialData.id, {
          ...data,
          doctorId,
          doctorName,
        })
        toast({
          title: "Success",
          description: "Prescription updated successfully"
        })
      } else {
        await prescriptionsAPI.create({
          ...data,
          doctorId,
          doctorName,
        })
        toast({
          title: "Success",
          description: initialData?.appointmentId
            ? `Prescription created successfully for ${data.patientName}`
            : "Prescription created successfully"
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prescription",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {initialData?.id ? "Edit Prescription" : "Create New Prescription"}
          {initialData?.appointmentId && !initialData?.id && (
            <span className="text-sm font-normal text-blue-600 dark:text-blue-400">
              (From Appointment)
            </span>
          )}
        </CardTitle>
        {initialData?.appointmentId && !initialData?.id && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Creating prescription for <strong>{initialData.patientName}</strong> after completed appointment
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient">Select Patient *</Label>
              <Select
                onValueChange={handlePatientChange}
                value={selectedPatientId}
                key={`patient-${selectedPatientId}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && (
                <p className="text-sm text-red-500 mt-1">{errors.patientId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="appointment">Related Appointment (Optional)</Label>
              <Select
                onValueChange={(value) => setValue("appointmentId", value)}
                value={selectedAppointmentId}
                key={`appointment-${selectedPatientId}-${selectedAppointmentId}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const filteredAppointments = appointments.filter(apt => apt.patientId === selectedPatientId)
                    console.log("Filtered appointments for patient", selectedPatientId, ":", filteredAppointments)

                    if (filteredAppointments.length === 0 && selectedPatientId) {
                      return (
                        <SelectItem value="no-appointments" disabled>
                          No appointments found for this patient
                        </SelectItem>
                      )
                    }

                    return filteredAppointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {`${appointment.date} at ${appointment.time} - ${appointment.specialty}`}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Medicines *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", dosage: "", duration: "", instructions: "" })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`medicines.${index}.name`}>Medicine Name *</Label>
                      <Input
                        {...register(`medicines.${index}.name`)}
                        placeholder="e.g., Paracetamol"
                      />
                      {errors.medicines?.[index]?.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.medicines[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`medicines.${index}.dosage`}>Dosage *</Label>
                      <Input
                        {...register(`medicines.${index}.dosage`)}
                        placeholder="e.g., 500mg"
                      />
                      {errors.medicines?.[index]?.dosage && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.medicines[index]?.dosage?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`medicines.${index}.duration`}>Duration *</Label>
                      <Input
                        {...register(`medicines.${index}.duration`)}
                        placeholder="e.g., 7 days"
                      />
                      {errors.medicines?.[index]?.duration && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.medicines[index]?.duration?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor={`medicines.${index}.instructions`}>Instructions</Label>
                    <Textarea
                      {...register(`medicines.${index}.instructions`)}
                      placeholder="e.g., Take after meals, twice daily"
                      rows={2}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              {...register("notes")}
              placeholder="Any additional instructions or notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData?.id ? "Update" : "Create"} Prescription
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
