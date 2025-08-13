// app/doctor/appointments/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react"; // Added useCallback
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DoctorNavbar } from "@/components/DoctorNavbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { appointmentsAPI, prescriptionsAPI, type Appointment } from "@/lib/api";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  CalendarDays,
  ListOrdered,
  CalendarClock,
  UserCheck,
  Ban,
  FileText,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnhancedAppointmentCalendar } from "@/components/EnhancedAppointmentCalendar";
import { EnhancedAppointmentCard } from "@/components/EnhancedAppointmentCard";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { ApiStatusChecker } from "@/components/ApiStatusChecker";

export default function DoctorAppointmentsPage() {
  const { user, role, isAuthenticated } = useAuth(); // Added role, isAuthenticated for robust checks
  const { toast } = useToast();
  const router = useRouter();
  console.log("Auth State:", { user, role, isAuthenticated });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming"); // State for active tab filtering
  const [isCalendarView, setIsCalendarView] = useState(false); // State to toggle between list and calendar view
  const [prescriptions, setPrescriptions] = useState<any[]>([]); // Store prescriptions for checking

  // Memoized function to load appointments
  const loadAppointments = useCallback(async () => {
    const idToFetch = user?.id;

    // Only proceed if authenticated and a doctor
    if (!isAuthenticated || !idToFetch || role !== "doctor") {
      setIsLoading(false);
      return;
    }

    try {
      const [appointmentsData, prescriptionsData] = await Promise.all([
        appointmentsAPI.getByDoctorId(idToFetch),
        prescriptionsAPI.getByDoctorId(idToFetch)
      ]);

      setAppointments(
        appointmentsData.sort(
          // Retaining your original ascending sort order (oldest first)
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      setPrescriptions(prescriptionsData);
      setHasError(false);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setHasError(true);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to load appointments. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, role, toast]); // Dependencies for useCallback

  useEffect(() => {
    // Only attempt to load appointments if authenticated, user exists, and is a doctor
    if (isAuthenticated && user && role === "doctor") {
      loadAppointments();
    } else if (!isAuthenticated) {
      // If not authenticated, stop loading and show appropriate message via ProtectedRoute
      setIsLoading(false);
    } else if (role !== "doctor") {
      // If authenticated but not a doctor, stop loading and show appropriate message via ProtectedRoute
      setIsLoading(false);
    }
  }, [user, isAuthenticated, role, loadAppointments]); // Dependencies for useEffect

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment["status"]
  ) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, status);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt))
      );
      toast({
        title: "Success",
        description: `Appointment ${status} successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

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
  // Helper function to determine if an appointment is upcoming (for tab filtering)
  const isUpcoming = (appointment: Appointment) => {
    const apptDateTime = new Date(`${appointment.date}T${appointment.time}`);
    return apptDateTime >= new Date();
  };

  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {};
    appointments.forEach((appointment) => {
      const date = appointment.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });
    return grouped;
  };

  // Filter appointments based on the active tab (Upcoming/Past)
  const filteredAppointments = appointments.filter((appt) => {
    if (activeTab === "upcoming") {
      return (
        isUpcoming(appt) &&
        appt.status !== "cancelled" &&
        appt.status !== "completed"
      );
    } else {
      return (
        !isUpcoming(appt) ||
        appt.status === "cancelled" ||
        appt.status === "completed"
      );
    }
  });

  const groupedAppointments = groupAppointmentsByDate(filteredAppointments); // Group filtered appointments

  // Check if prescription exists for an appointment
  const getPrescriptionForAppointment = (appointmentId: string) => {
    return prescriptions.find(p => p.appointmentId === appointmentId)
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      {/* CHANGED: Added dual-theme background */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {hasError && (
            <div className="mb-6">
              <ApiStatusChecker />
            </div>
          )}

          <div className="text-center mb-8">
            {/* CHANGED: Added dual-theme text colors */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Patient Schedule Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View, organize, and manage all your patient consultations, follow-ups, and medical appointments in one centralized dashboard
            </p>
          </div>
          {/* Section for Tab and View Toggle Buttons */}
          <div className="flex justify-between items-center mb-6">
            {/* Tab buttons for Upcoming and Past appointments */}
            <div className="flex space-x-2 rounded-md bg-muted p-1">
              <Button
                variant={activeTab === "upcoming" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("upcoming");
                  setIsCalendarView(false); // Switch to list view when changing tabs
                }}
                className="px-4 py-2 text-sm"
              >
                Upcoming
              </Button>
              <Button
                variant={activeTab === "past" ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab("past");
                  setIsCalendarView(false); // Switch to list view when changing tabs
                }}
                className="px-4 py-2 text-sm"
              >
                Past
              </Button>
            </div>

            {/* Button to toggle between Calendar and List view */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCalendarView(!isCalendarView)}
              aria-label={
                isCalendarView
                  ? "Switch to List View"
                  : "Switch to Calendar View"
              }
            >
              {isCalendarView ? (
                <ListOrdered className="h-5 w-5" />
              ) : (
                <CalendarDays className="h-5 w-5" />
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ) : appointments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Appointments
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You don't have any appointments scheduled yet.
                </p>
              </CardContent>
            </Card>
          ) : isCalendarView ? ( // <-- THIS IS THE CRUCIAL CHANGE
            // Render the FullCalendar component if in calendar view
            user && <EnhancedAppointmentCalendar doctorId={user.id} />
          ) : (
            // Render the list of appointments, grouped by date (your original structure)
            <div className="space-y-8">
              {Object.entries(groupedAppointments).length === 0 ? (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400 mt-8">
                  {activeTab === "upcoming"
                    ? "No upcoming appointments found for this tab."
                    : "No past appointments found for this tab."}
                </p>
              ) : (
                Object.entries(groupedAppointments).map(
                  ([date, dayAppointments]) => (
                    <div key={date}>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dayAppointments.map((appointment) => (
                          <EnhancedAppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            prescriptions={prescriptions}
                            onUpdate={(updatedAppointment) => {
                              setAppointments(prev =>
                                prev.map(apt =>
                                  apt.id === updatedAppointment.id ? updatedAppointment : apt
                                )
                              )
                            }}
                            onDelete={(appointmentId) => {
                              setAppointments(prev =>
                                prev.filter(apt => apt.id !== appointmentId)
                              )
                            }}
                            showActions={true}
                            showPatientInfo={true}
                          />
                        ))}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  );
}
