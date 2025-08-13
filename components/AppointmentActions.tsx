"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { appointmentsAPI } from "@/lib/api";
import { reviewsAPI, type Review } from "@/lib/reviews-api";
import { PatientReviewForm } from "./PatientReviewForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Star, MessageSquare } from "lucide-react";

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
  doctorName?: string;
  onAppointmentAction: () => void;
}

export function AppointmentActions({
  appointmentId,
  status,
  doctorId,
  doctorName,
  onAppointmentAction,
}: AppointmentActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  const handleReschedule = () => {
    toast({
      title: "Reschedule Action",
      description: `Navigating to booking page for doctor ID: ${doctorId} to reschedule appointment ID: ${appointmentId}`,
    });
    router.push(`/booking/${doctorId}?rescheduleId=${appointmentId}`);
  };

  const loadExistingReview = async () => {
    if (status !== "completed") return;

    setIsLoadingReview(true);
    try {
      const review = await reviewsAPI.getByAppointmentId(appointmentId);
      setExistingReview(review);
    } catch (error) {
      console.error("Failed to load existing review:", error);
    } finally {
      setIsLoadingReview(false);
    }
  };

  useEffect(() => {
    loadExistingReview();
  }, [appointmentId, status]);

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

  const handleReviewClick = () => {
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmitted = (review: Review) => {
    setExistingReview(review);
    setIsReviewDialogOpen(false);
    toast({
      title: "Success",
      description: existingReview ? "Review updated successfully!" : "Thank you for your review!",
    });
  };

  const showRescheduleButton =
    status === "pending" || status === "confirmed" || status === "cancelled";
  const showCancelButton = status === "pending" || status === "confirmed";
  const showReviewButton = status === "completed" && doctorName;

  if (!showRescheduleButton && !showCancelButton && !showReviewButton) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2 mt-4">
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

        {showReviewButton && (
          <Button
            variant={existingReview ? "outline" : "default"}
            className={existingReview
              ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
            }
            onClick={handleReviewClick}
            disabled={isLoadingReview}
          >
            {existingReview ? (
              <>
                <Star className="w-4 h-4 mr-2 fill-current" />
                Edit Review
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Write Review
              </>
            )}
          </Button>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {existingReview ? "Edit Your Review" : "Write a Review"}
            </DialogTitle>
          </DialogHeader>
          {doctorName && (
            <PatientReviewForm
              appointmentId={appointmentId}
              doctorId={doctorId}
              doctorName={doctorName}
              existingReview={existingReview}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setIsReviewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
