"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PatientNavbar } from "@/components/PatientNavbar";
import { SimpleFooter } from "@/components/SimpleFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { appointmentsAPI, type Appointment } from "@/lib/api";
import { Calendar, Clock, User, Stethoscope } from "lucide-react"; // Calendar icon for no appointments state
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AppointmentActions } from "@/components/AppointmentActions";
import { useRouter } from "next/navigation"; // NEW: For the "Find a Doctor" button
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // NEW: For filtering tabs

// Define possible filter types
type AppointmentStatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "completed";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for API errors
  // State for the selected filter
  const [filter, setFilter] = useState<AppointmentStatusFilter>("all");

  const loadAppointments = async () => {
    if (!user?.id) { // Use optional chaining for safety
      // If user is not logged in, set error and stop loading
      setError("User not logged in. Please log in to view appointments.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const appointmentsData = await appointmentsAPI.getByPatientId(user.id);
      setAppointments(
        appointmentsData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Failed to load appointments. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load appointments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load appointments if user is available
    if (user) {
      loadAppointments();
    }
  }, [user]); // Depend on user object for re-fetching

  // Function to filter appointments based on selected status
  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") {
      return true; // Show all appointments
    }
    return appointment.status === filter;
  });

  // FIXED: Replaced with a theme-aware function for better readability in both modes.
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

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PatientNavbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            {/* KEPT SAME: My Appointments heading */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              My Appointments
            </h1>
            {/* KEPT SAME: Description below heading */}
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your upcoming and past appointments
            </p>
          </div>

          {/* NEW: Filter Tabs */}
          <div className="mb-6">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as AppointmentStatusFilter)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 md:grid-cols-5 h-auto">
                <TabsTrigger value="all" className="py-2 px-4">All</TabsTrigger>
                <TabsTrigger value="pending" className="py-2 px-4">Pending</TabsTrigger>
                <TabsTrigger value="confirmed" className="py-2 px-4">Confirmed</TabsTrigger>
                <TabsTrigger value="cancelled" className="py-2 px-4">Cancelled</TabsTrigger>
                <TabsTrigger value="completed" className="py-2 px-4">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {error && ( // Display API loading errors
            <div className="text-center text-red-500 dark:text-red-400 mb-4">{error}</div>
          )}

          {isLoading ? (
            <div className="text-center text-gray-500 dark:text-white py-12">
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? ( // Use filteredAppointments length
            <Card className="text-center py-12 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Calendar className="w-20 h-20 text-blue-500 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {filter === "all" ? "No Appointments Yet!" : `No ${filter} Appointments`}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm">
                  {filter === "all"
                    ? "It looks like you haven't booked any appointments. Start by finding a doctor that fits your needs."
                    : `There are no appointments with "${filter}" status.`}
                </p>
                {filter === "all" && ( // Only show "Find a Doctor" if no appointments at all and "All" filter is active
                  <Button
                    onClick={() => router.push("/find-doctors")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Find a Doctor
                  </Button>
                )}
                {filter !== "all" && ( // Show "Show All Appointments" if a filter is active
                  <Button
                    onClick={() => setFilter("all")}
                    variant="outline"
                    className="mt-4"
                  >
                    Show All Appointments
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => ( // Map over filteredAppointments
                <Card
                  key={appointment.id}
                  className="hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        {appointment.doctorName}
                      </CardTitle>
                      <Badge
                        className={`${getStatusBadgeClass(
                          appointment.status
                        )} capitalize`}
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
                        {new Date(appointment.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.time}
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4">
                    <AppointmentActions
                      appointmentId={appointment.id}
                      status={appointment.status}
                      doctorId={appointment.doctorId}
                      doctorName={appointment.doctorName}
                      onAppointmentAction={loadAppointments}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  );
}
