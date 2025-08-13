"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Star, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { PatientReviewForm } from "./PatientReviewForm";
import { reviewsAPI, type Review } from "@/lib/reviews-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewCardProps {
  review: Review;
  onReviewUpdated?: (review: Review) => void;
  onReviewDeleted?: (reviewId: string) => void;
  showDoctorInfo?: boolean;
  showPatientActions?: boolean;
}

export function ReviewCard({
  review,
  onReviewUpdated,
  onReviewDeleted,
  showDoctorInfo = false,
  showPatientActions = false,
}: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnReview = user?.id === review.patientId;
  const canEditOrDelete = isOwnReview && review.isEditable && showPatientActions;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleReviewUpdated = (updatedReview: Review) => {
    setIsEditing(false);
    onReviewUpdated?.(updatedReview);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reviewsAPI.delete(review.id);
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      onReviewDeleted?.(review.id);
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPatientInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isEditing) {
    return (
      <PatientReviewForm
        appointmentId={review.appointmentId}
        doctorId={review.doctorId}
        doctorName={review.doctorName}
        existingReview={review}
        onReviewSubmitted={handleReviewUpdated}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getPatientInitials(review.patientName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{review.patientName}</h4>
                  {showDoctorInfo && (
                    <Badge variant="outline" className="text-xs">
                      {review.doctorName}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.dateCreated)}
                  </span>
                  {review.dateUpdated && (
                    <Badge variant="secondary" className="text-xs">
                      Edited
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {canEditOrDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
          {!review.isEditable && isOwnReview && showPatientActions && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">
                Review can no longer be edited (24-hour limit exceeded)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
