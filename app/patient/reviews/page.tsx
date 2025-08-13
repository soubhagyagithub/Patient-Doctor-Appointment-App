"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PatientNavbar } from "@/components/PatientNavbar";
import { SimpleFooter } from "@/components/SimpleFooter";
import { ReviewCard } from "@/components/ReviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { reviewsAPI, type Review } from "@/lib/reviews-api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function PatientReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating">("newest");

  const loadReviews = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const reviewsData = await reviewsAPI.getByPatientId(user.id);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const handleReviewUpdated = (updatedReview: Review) => {
    setReviews(reviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
  };

  const sortedReviews = reviews.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      case "oldest":
        return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const sizeClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${sizeClass} ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PatientNavbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              My Reviews
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your reviews and share your healthcare experiences
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Loading reviews...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Stats Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* My Stats */}
                <Card>
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      My Ratings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {getAverageRating().toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {renderStars(Math.round(getAverageRating()), "lg")}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Average Rating
                      </p>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Reviews
                        </span>
                        <span className="font-semibold">{reviews.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Editable Reviews
                        </span>
                        <span className="font-semibold">
                          {reviews.filter(r => r.isEditable).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => router.push("/appointments")}
                      className="w-full"
                      variant="outline"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Appointments
                    </Button>
                    <Button
                      onClick={() => router.push("/find-doctors")}
                      className="w-full"
                      variant="outline"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Book New Appointment
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Reviews</CardTitle>
                        <CardDescription>
                          {sortedReviews.length} review{sortedReviews.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                        <TabsList className="grid w-fit grid-cols-3">
                          <TabsTrigger value="newest">Newest</TabsTrigger>
                          <TabsTrigger value="oldest">Oldest</TabsTrigger>
                          <TabsTrigger value="rating">Rating</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sortedReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No reviews yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Your reviews for completed appointments will appear here.
                        </p>
                        <Button
                          onClick={() => router.push("/appointments")}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          View Appointments
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedReviews.map((review) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            onReviewUpdated={handleReviewUpdated}
                            onReviewDeleted={handleReviewDeleted}
                            showDoctorInfo={true}
                            showPatientActions={true}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  );
}
