"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { SimpleFooter } from "@/components/SimpleFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, Mail, Stethoscope, GraduationCap, MapPin, Clock } from "lucide-react"

export default function DoctorProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialty: user?.specialty || "",
    qualifications: user?.qualifications || "",
    experience: user?.experience || "",
    clinicAddress: user?.clinicAddress || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would be an API call
      await updateUser(formData)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      {/* CHANGED: Added dual-theme background */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DoctorNavbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            {/* CHANGED: Added dual-theme text */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Doctor Profile</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your professional information</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="w-6 h-6 mr-2" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your basic details</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="w-6 h-6 mr-2" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your medical credentials and practice details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="specialty">Specialty</Label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                        {isEditing ? (
                          <Select
                            value={formData.specialty}
                            onValueChange={(value) => handleInputChange("specialty", value)}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cardiology">Cardiology</SelectItem>
                              <SelectItem value="dermatology">Dermatology</SelectItem>
                              <SelectItem value="neurology">Neurology</SelectItem>
                              <SelectItem value="orthopedics">Orthopedics</SelectItem>
                              <SelectItem value="pediatrics">Pediatrics</SelectItem>
                              <SelectItem value="psychiatry">Psychiatry</SelectItem>
                              {/* FIXED: Consistent value for General Medicine */}
                              <SelectItem value="general medicine">General Medicine</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input value={formData.specialty} disabled className="pl-10 capitalize" />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience">Experience</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="experience"
                          type="text"
                          value={formData.experience}
                          onChange={(e) => handleInputChange("experience", e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="e.g., 5 years"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="qualifications"
                        type="text"
                        value={formData.qualifications}
                        onChange={(e) => handleInputChange("qualifications", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="e.g., MD, MBBS, Specialist"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="clinicAddress">Clinic Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                      <Textarea
                        id="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 min-h-[80px]"
                        placeholder="Enter your clinic address"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </form>
        </div>
        <SimpleFooter />
      </div>
    </ProtectedRoute>
  )
}
