"use client";

import { useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { appointmentsAPI } from "@/lib/api";

// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppointmentActionsProps {
  appointmentId: string;
  status: string;
  doctorId: string;
  onAppointmentAction: () => void;
}

export function AppointmentActions({
  appointmentId,
  status,
  doctorId,
  onAppointmentAction,
}: AppointmentActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false); // State to control dialog

  const handleReschedule = () => {
    toast({
      title: "Reschedule Action",
      description: `Navigating to booking page for doctor ID: ${doctorId} to reschedule appointment ID: ${appointmentId}`,
    });
    router.push(`/booking/${doctorId}?rescheduleId=${appointmentId}`);
  };

  const performCancellation = async () => {
    try {
        await appointmentsAPI.updateStatus(appointmentId, "cancelled");;
      toast({
        title: "Appointment Cancelled Successfully!",
        description: "Your appointment has been successfully cancelled.",
        variant: "success", // Assuming you have a 'success' variant or default is fine
      });
      onAppointmentAction(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsConfirmingCancel(false); // Close the dialog
    }
  };

  const showRescheduleButton =
    status === "pending" || status === "confirmed" || status === "cancelled";
  const showCancelButton = status === "pending" || status === "confirmed";

  if (!showRescheduleButton && !showCancelButton) {
    return null;
  }

  return (
    <div className="flex justify-between mt-4">
      {showRescheduleButton && (
        <Button
          variant="outline"
          className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          onClick={handleReschedule}
        >
          Reschedule
        </Button>
      )}

      {showCancelButton && (
        <AlertDialog
          open={isConfirmingCancel}
          onOpenChange={setIsConfirmingCancel}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="bg-red-700 hover:bg-red-800 px-6 py-3"
              // No direct onClick here anymore, AlertDialogTrigger handles opening
            >
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your
                appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction onClick={performCancellation}>
                Yes, Cancel Appointment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
