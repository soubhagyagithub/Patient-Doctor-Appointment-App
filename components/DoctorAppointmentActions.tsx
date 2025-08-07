// components/DoctorAppointmentActions.tsx
// This component displays a single appointment for a doctor and allows them to Confirm or Cancel it.
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { Calendar, Clock, User, Stethoscope } from "lucide-react"; // Icons for display
import { Appointment, appointmentsAPI } from "@/lib/api"; // Your API and Appointment type definition
import { useToast } from "@/hooks/use-toast"; // For displaying notifications

interface DoctorAppointmentActionsProps {
  appointment: Appointment;
  onUpdate: () => void; // Callback function to trigger a re-fetch of appointments after an action
}

export function DoctorAppointmentActions({
  appointment,
  onUpdate,
}: DoctorAppointmentActionsProps) {
  const { toast } = useToast();

  // Function to handle updating appointment status (Confirm/Cancel)
  const handleStatusUpdate = async (newStatus: "confirmed" | "cancelled") => {
    try {
      // API call to update the appointment status in your backend
      await appointmentsAPI.updateAppointmentStatus(appointment.id, newStatus); //
      toast({
        title: "Success",
        description: `Appointment ${newStatus} successfully!`,
        variant: "default",
      });
      onUpdate(); // Call the passed onUpdate function to refresh the list of appointments
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${newStatus} appointment.`,
        variant: "destructive",
      });
    }
  };

  // Helper function to apply status-specific styling to the badge
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Determine button visibility based on current appointment status
  const isPending = appointment.status === "pending";
  const isConfirmed = appointment.status === "confirmed";

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <User className="w-5 h-5 mr-2" />
            {appointment.patientName}{" "}
            {/* Display patient's name for the doctor */}
          </CardTitle>
          <Badge
            className={`${getStatusBadgeClass(appointment.status)} capitalize`}
          >
            {appointment.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-teal-600 dark:text-teal-400 pt-1">
          <Stethoscope className="w-4 h-4 mr-2" />
          {appointment.specialty}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(appointment.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4 mr-2" />
            {appointment.time}
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          {/* Confirm button is visible only if the appointment is pending */}
          {isPending && (
            <Button
              variant="default"
              onClick={() => handleStatusUpdate("confirmed")}
            >
              Confirm
            </Button>
          )}
          {/* Cancel button is visible if pending or confirmed */}
          {(isPending || isConfirmed) && (
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("cancelled")}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
