// Reviews API

// Helper functions (copied from api.ts)
const LOCAL_API = "http://localhost:3001";
const EXTERNAL_API = "https://doctor-appointment-api-1.onrender.com";

let workingApiBase: string | null = null;

const detectWorkingApiBase = async (): Promise<string> => {
  if (workingApiBase) {
    return workingApiBase;
  }

  const isProduction = typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1') &&
    !window.location.hostname.includes('0.0.0.0');

  if (isProduction) {
    workingApiBase = EXTERNAL_API;
    return EXTERNAL_API;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${LOCAL_API}/doctors`, {
      method: "HEAD",
      mode: "cors",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      workingApiBase = LOCAL_API;
      return LOCAL_API;
    }
  } catch (error) {
    // Fall through to external API
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${EXTERNAL_API}/doctors`, {
      method: "HEAD",
      mode: "cors",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      workingApiBase = EXTERNAL_API;
      return EXTERNAL_API;
    }
  } catch (error) {
    // Fall through to default
  }

  return EXTERNAL_API;
};

const handleApiError = (error: any, operation: string) => {
  console.error(`API Error during ${operation}:`, error);

  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw new Error(
      `Cannot connect to API server. Please check your internet connection or try again later.`
    );
  }

  if (error.name === 'AbortError') {
    throw new Error(`Request timeout: ${operation} took too long to respond.`);
  }

  throw error;
};

export interface Review {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  rating: number; // 1-5 stars
  reviewText: string;
  dateCreated: string;
  dateUpdated?: string | null;
  isEditable: boolean; // true if within 24 hours
}

// localStorage fallback functions
const getReviewsFromStorage = (): Review[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('healthcareReviews');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveReviewsToStorage = (reviews: Review[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('healthcareReviews', JSON.stringify(reviews));
  } catch {
    // localStorage not available
  }
};

export const reviewsAPI = {
  async create(review: Omit<Review, "id" | "dateCreated" | "isEditable">): Promise<Review> {
    try {
      const apiBase = await detectWorkingApiBase();

      // If using external API, use localStorage fallback
      if (apiBase === EXTERNAL_API) {
        const newReview: Review = {
          ...review,
          id: Date.now().toString(),
          dateCreated: new Date().toISOString(),
          dateUpdated: null,
          isEditable: true,
        };

        const existingReviews = getReviewsFromStorage();
        const updatedReviews = [...existingReviews, newReview];
        saveReviewsToStorage(updatedReviews);

        return newReview;
      }

      const newReview = {
        ...review,
        id: Date.now().toString(),
        dateCreated: new Date().toISOString(),
        dateUpdated: null,
        isEditable: true,
      };
      const response = await fetch(`${apiBase}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });
      if (!response.ok) {
        throw new Error(`Failed to create review: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating review:", error);
      throw error; // Re-throw for create operations since caller needs to handle
    }
  },

  async getByDoctorId(doctorId: string): Promise<Review[]> {
    try {
      const apiBase = await detectWorkingApiBase();

      // If using external API, use localStorage fallback
      if (apiBase === EXTERNAL_API) {
        const allReviews = getReviewsFromStorage();
        return allReviews
          .filter(review => review.doctorId === doctorId)
          .map(review => ({
            ...review,
            isEditable: this.isReviewEditable(review.dateCreated),
          }));
      }

      const response = await fetch(`${apiBase}/reviews?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
      }
      const reviews = await response.json();
      // Update isEditable status based on time since creation
      return reviews.map((review: Review) => ({
        ...review,
        isEditable: this.isReviewEditable(review.dateCreated),
      }));
    } catch (error) {
      console.warn("Error fetching doctor reviews:", error);
      return []; // Return empty array on error
    }
  },

  async getByPatientId(patientId: string): Promise<Review[]> {
    try {
      const apiBase = await detectWorkingApiBase();

      // If using external API, use localStorage fallback
      if (apiBase === EXTERNAL_API) {
        const allReviews = getReviewsFromStorage();
        return allReviews
          .filter(review => review.patientId === patientId)
          .map(review => ({
            ...review,
            isEditable: this.isReviewEditable(review.dateCreated),
          }));
      }

      const response = await fetch(`${apiBase}/reviews?patientId=${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const reviews = await response.json();
      // Update isEditable status based on time since creation
      return reviews.map((review: Review) => ({
        ...review,
        isEditable: this.isReviewEditable(review.dateCreated),
      }));
    } catch (error) {
      console.warn("Error fetching patient reviews:", error);
      return []; // Return empty array on error
    }
  },

  async getByAppointmentId(appointmentId: string): Promise<Review | null> {
    try {
      const apiBase = await detectWorkingApiBase();

      // If using external API, use localStorage fallback
      if (apiBase === EXTERNAL_API) {
        const allReviews = getReviewsFromStorage();
        const review = allReviews.find(review => review.appointmentId === appointmentId);
        return review ? {
          ...review,
          isEditable: this.isReviewEditable(review.dateCreated),
        } : null;
      }

      const response = await fetch(`${apiBase}/reviews?appointmentId=${appointmentId}`);
      if (!response.ok) {
        // If it's a 404 or similar, it means no review exists, return null
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch review: ${response.status} ${response.statusText}`);
      }
      const reviews = await response.json();
      if (reviews.length === 0) return null;

      const review = reviews[0];
      return {
        ...review,
        isEditable: this.isReviewEditable(review.dateCreated),
      };
    } catch (error) {
      // Log the error but don't crash the app - return null for no review found
      console.warn("Error fetching appointment review:", error);
      return null;
    }
  },

  async update(id: string, data: Partial<Review>): Promise<Review> {
    try {
      const apiBase = await detectWorkingApiBase();

      // If using external API, use localStorage fallback
      if (apiBase === EXTERNAL_API) {
        const allReviews = getReviewsFromStorage();
        const reviewIndex = allReviews.findIndex(review => review.id === id);

        if (reviewIndex === -1) {
          throw new Error("Review not found");
        }

        const updatedReview: Review = {
          ...allReviews[reviewIndex],
          ...data,
          dateUpdated: new Date().toISOString(),
          isEditable: this.isReviewEditable(data.dateCreated || allReviews[reviewIndex].dateCreated),
        };

        allReviews[reviewIndex] = updatedReview;
        saveReviewsToStorage(allReviews);

        return updatedReview;
      }

      const response = await fetch(`${apiBase}/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dateUpdated: new Date().toISOString(),
          isEditable: this.isReviewEditable(data.dateCreated || new Date().toISOString()),
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update review: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error updating review:", error);
      throw error; // Re-throw for update operations since caller needs to handle
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const apiBase = await detectWorkingApiBase();

      // If using external API, use localStorage fallback
      if (apiBase === EXTERNAL_API) {
        const allReviews = getReviewsFromStorage();
        const filteredReviews = allReviews.filter(review => review.id !== id);
        saveReviewsToStorage(filteredReviews);
        return;
      }

      const response = await fetch(`${apiBase}/reviews/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete review: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error; // Re-throw for delete operations since caller needs to handle
    }
  },

  // Utility function to check if a review is still editable (within 24 hours)
  isReviewEditable(dateCreated: string): boolean {
    const createdTime = new Date(dateCreated).getTime();
    const currentTime = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (currentTime - createdTime) < twentyFourHours;
  },

  // Get aggregated rating statistics for a doctor
  async getDoctorRatingStats(doctorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    try {
      const reviews = await this.getByDoctorId(doctorId);

      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating]++;
      });

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews,
        ratingDistribution,
      };
    } catch (error) {
      console.warn("Error calculating doctor rating stats:", error);
      // Return default stats on error
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  },
};
