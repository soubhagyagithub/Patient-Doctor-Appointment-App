"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Star, Loader2 } from "lucide-react";
import { reviewsAPI, type Review } from "@/lib/reviews-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PatientReviewFormProps {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  onReviewSubmitted?: (review: Review) => void;
  existingReview?: Review | null;
  onCancel?: () => void;
}

interface ReviewFormData {
  reviewText: string;
}

export function PatientReviewForm({
  appointmentId,
  doctorId,
  doctorName,
  onReviewSubmitted,
  existingReview,
  onCancel,
}: PatientReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    defaultValues: {
      reviewText: existingReview?.reviewText || "",
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let review: Review;

      if (existingReview) {
        // Update existing review
        review = await reviewsAPI.update(existingReview.id, {
          rating,
          reviewText: data.reviewText,
        });
        toast({
          title: "Success",
          description: "Your review has been updated successfully",
        });
      } else {
        // Create new review
        review = await reviewsAPI.create({
          appointmentId,
          doctorId,
          patientId: user.id,
          doctorName,
          patientName: user.name,
          rating,
          reviewText: data.reviewText,
        });
        toast({
          title: "Success",
          description: "Thank you for your review!",
        });
      }

      onReviewSubmitted?.(review);
      if (!existingReview) {
        reset();
        setRating(0);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleStarHover = (selectedRating: number) => {
    setHoveredRating(selectedRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select Rating";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          {existingReview ? "Edit Your Review" : "Rate Your Experience"}
        </CardTitle>
        <CardDescription>
          {existingReview
            ? `Update your review for ${doctorName}`
            : `Share your experience with ${doctorName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 rounded hover:scale-110 transition-transform"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-medium text-gray-600">
                {getRatingText(displayRating)}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="reviewText" className="text-sm font-medium">
              Your Review
            </Label>
            <Textarea
              id="reviewText"
              placeholder="Share your experience with this doctor. What did you like? How was the treatment?"
              className="min-h-32 resize-none"
              {...register("reviewText", {
                required: "Please write a review",
                minLength: {
                  value: 10,
                  message: "Review must be at least 10 characters long",
                },
                maxLength: {
                  value: 500,
                  message: "Review must be less than 500 characters",
                },
              })}
            />
            {errors.reviewText && (
              <p className="text-sm text-red-600">{errors.reviewText.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {existingReview ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>{existingReview ? "Update Review" : "Submit Review"}</>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
