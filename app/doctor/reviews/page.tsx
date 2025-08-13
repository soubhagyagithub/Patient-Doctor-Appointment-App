"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DoctorNavbar } from "@/components/DoctorNavbar";
import { SimpleFooter } from "@/components/SimpleFooter";
import { ReviewCard } from "@/components/ReviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Star, Users, TrendingUp, Filter } from "lucide-react";
import { reviewsAPI, type Review } from "@/lib/reviews-api";
import { useToast } from "@/hooks/use-toast";

export default function DoctorReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating">("newest");

  const loadReviews = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewsAPI.getByDoctorId(user.id),
        reviewsAPI.getDoctorRatingStats(user.id),
      ]);

      setReviews(reviewsData);
      setRatingStats(statsData);
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

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (filterRating === null) return true;
      return review.rating === filterRating;
    })
    .sort((a, b) => {
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

  const getRatingPercentage = (rating: number) => {
    if (ratingStats.totalReviews === 0) return 0;
    return (ratingStats.ratingDistribution[rating] / ratingStats.totalReviews) * 100;
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Patient Reviews
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              See what your patients are saying about their experiences
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Loading reviews...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Statistics Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Overall Rating */}
                <Card>
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Overall Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {ratingStats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {renderStars(Math.round(ratingStats.averageRating), "lg")}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rating Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <Progress
                          value={getRatingPercentage(rating)}
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                          {ratingStats.ratingDistribution[rating]}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Reviews
                      </span>
                      <span className="font-semibold">{ratingStats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        5-Star Reviews
                      </span>
                      <span className="font-semibold">
                        {ratingStats.ratingDistribution[5]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Average Rating
                      </span>
                      <span className="font-semibold">
                        {ratingStats.averageRating.toFixed(1)}/5.0
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Patient Reviews</CardTitle>
                        <CardDescription>
                          {filteredAndSortedReviews.length} review{filteredAndSortedReviews.length !== 1 ? "s" : ""}
                          {filterRating && ` with ${filterRating} star${filterRating !== 1 ? "s" : ""}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                          <TabsList className="grid w-fit grid-cols-3">
                            <TabsTrigger value="newest">Newest</TabsTrigger>
                            <TabsTrigger value="oldest">Oldest</TabsTrigger>
                            <TabsTrigger value="rating">Rating</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                    
                    {/* Filter by Rating */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={filterRating === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterRating(null)}
                      >
                        All
                      </Button>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <Button
                          key={rating}
                          variant={filterRating === rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterRating(rating)}
                          className="flex items-center gap-1"
                        >
                          {rating}
                          <Star className="h-3 w-3 fill-current" />
                        </Button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredAndSortedReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {filterRating ? `No ${filterRating}-star reviews` : "No reviews yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {filterRating 
                            ? "Try adjusting your filter to see more reviews."
                            : "Reviews from your patients will appear here once they submit them."
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAndSortedReviews.map((review) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            showPatientActions={false}
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
