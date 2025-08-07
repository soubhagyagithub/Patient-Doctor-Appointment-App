"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Calendar, Plus, Edit, Trash2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SchedulePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [schedule, setSchedule] = useState({
    monday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      slotDuration: 30,
    },
    tuesday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      slotDuration: 30,
    },
    wednesday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      slotDuration: 30,
    },
    thursday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      slotDuration: 30,
    },
    friday: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      slotDuration: 30,
    },
    saturday: {
      enabled: false,
      startTime: "10:00",
      endTime: "14:00",
      breakStart: "",
      breakEnd: "",
      slotDuration: 30,
    },
    sunday: {
      enabled: false,
      startTime: "10:00",
      endTime: "14:00",
      breakStart: "",
      breakEnd: "",
      slotDuration: 30,
    },
  })

  const [blockedDates, setBlockedDates] = useState([])
  const [newBlockedDate, setNewBlockedDate] = useState("")
  const [blockReason, setBlockReason] = useState("")
  const [editingDay, setEditingDay] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  useEffect(() => {
    loadSchedule()
  }, [user])

  const loadSchedule = async () => {
    // Load saved schedule from localStorage or API
    const savedSchedule = localStorage.getItem(`schedule_${user?.id}`)
    const savedBlockedDates = localStorage.getItem(`blocked_dates_${user?.id}`)

    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule))
    }
    if (savedBlockedDates) {
      setBlockedDates(JSON.parse(savedBlockedDates))
    }
  }

  const saveSchedule = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage (replace with API call)
      localStorage.setItem(`schedule_${user?.id}`, JSON.stringify(schedule))
      localStorage.setItem(`blocked_dates_${user?.id}`, JSON.stringify(blockedDates))

      toast({
        title: "Success",
        description: "Schedule saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }))
  }

  const updateDaySchedule = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const generateTimeSlots = (daySchedule) => {
    if (!daySchedule.enabled) return []

    const slots = []
    const start = new Date(`2000-01-01T${daySchedule.startTime}:00`)
    const end = new Date(`2000-01-01T${daySchedule.endTime}:00`)
    const breakStart = daySchedule.breakStart ? new Date(`2000-01-01T${daySchedule.breakStart}:00`) : null
    const breakEnd = daySchedule.breakEnd ? new Date(`2000-01-01T${daySchedule.breakEnd}:00`) : null

    let current = new Date(start)

    while (current < end) {
      const slotEnd = new Date(current.getTime() + daySchedule.slotDuration * 60000)

      // Skip break time
      if (
        breakStart &&
        breakEnd &&
        ((current >= breakStart && current < breakEnd) || (slotEnd > breakStart && slotEnd <= breakEnd))
      ) {
        current = new Date(current.getTime() + daySchedule.slotDuration * 60000)
        continue
      }

      slots.push({
        start: current.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5),
      })

      current = slotEnd
    }

    return slots
  }

  const addBlockedDate = () => {
    if (!newBlockedDate) return

    const newBlock = {
      id: Date.now(),
      date: newBlockedDate,
      reason: blockReason || "Unavailable",
    }

    setBlockedDates((prev) => [...prev, newBlock])
    setNewBlockedDate("")
    setBlockReason("")

    toast({
      title: "Success",
      description: "Date blocked successfully!",
    })
  }

  const removeBlockedDate = (id) => {
    setBlockedDates((prev) => prev.filter((block) => block.id !== id))
    toast({
      title: "Success",
      description: "Blocked date removed!",
    })
  }

  const DayScheduleCard = ({ day, dayData }) => {
    const timeSlots = generateTimeSlots(dayData)

    return (
      <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Switch
                checked={dayData.enabled}
                onCheckedChange={() => toggleDay(day.key)}
                className="data-[state=checked]:bg-teal-500"
              />
              <Label className="text-white font-medium text-sm sm:text-base">{day.label}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className={
                  dayData.enabled
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }
              >
                {dayData.enabled ? "Available" : "Closed"}
              </Badge>
              {dayData.enabled && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700/50"
                      onClick={() => setEditingDay(day.key)}
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white">Edit {day.label} Schedule</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Configure working hours and break times
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300 text-sm">Start Time</Label>
                          <Input
                            type="time"
                            value={dayData.startTime}
                            onChange={(e) => updateDaySchedule(day.key, "startTime", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">End Time</Label>
                          <Input
                            type="time"
                            value={dayData.endTime}
                            onChange={(e) => updateDaySchedule(day.key, "endTime", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300 text-sm">Break Start</Label>
                          <Input
                            type="time"
                            value={dayData.breakStart}
                            onChange={(e) => updateDaySchedule(day.key, "breakStart", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Break End</Label>
                          <Input
                            type="time"
                            value={dayData.breakEnd}
                            onChange={(e) => updateDaySchedule(day.key, "breakEnd", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Slot Duration (minutes)</Label>
                        <Select
                          value={dayData.slotDuration.toString()}
                          onValueChange={(value) => updateDaySchedule(day.key, "slotDuration", Number.parseInt(value))}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        {dayData.enabled && (
          <CardContent>
            <div className="space-y-2">
              <div className="text-slate-400 text-xs sm:text-sm">
                {dayData.startTime} - {dayData.endTime}
                {dayData.breakStart && dayData.breakEnd && (
                  <span>
                    {" "}
                    (Break: {dayData.breakStart} - {dayData.breakEnd})
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-xs">
                {timeSlots.length} slots available ({dayData.slotDuration} min each)
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {timeSlots.slice(0, 6).map((slot, index) => (
                  <Badge key={index} variant="outline" className="border-teal-500/30 text-teal-300 text-xs">
                    {slot.start}
                  </Badge>
                ))}
                {timeSlots.length > 6 && (
                  <Badge variant="outline" className="border-slate-500/30 text-slate-400 text-xs">
                    +{timeSlots.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mr-3 sm:mr-4 border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Schedule Management
                </h1>
                <p className="text-slate-400 text-sm sm:text-lg mt-1 sm:mt-2">
                  Manage your availability and working hours
                </p>
              </div>
            </div>
            <Button
              onClick={saveSchedule}
              disabled={isSaving}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Schedule"}
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
            {/* Weekly Schedule */}
            <div className="xl:col-span-3">
              <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl mb-6 sm:mb-8">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-400" />
                    Weekly Schedule
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm sm:text-base">
                    Set your availability for each day of the week
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {days.map((day, index) => (
                  <div key={day.key} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in">
                    <DayScheduleCard day={day} dayData={schedule[day.key]} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Active Days</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {Object.values(schedule).filter((day) => day.enabled).length}/7
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Total Slots</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {Object.entries(schedule).reduce(
                        (total, [key, day]) => total + (day.enabled ? generateTimeSlots(day).length : 0),
                        0,
                      )}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Blocked Dates</span>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{blockedDates.length}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Block Dates */}
              <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-white">Block Dates</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Block specific dates when you're unavailable
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={newBlockedDate}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <Input
                      placeholder="Reason (optional)"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                    <Button
                      onClick={addBlockedDate}
                      disabled={!newBlockedDate}
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Block Date
                    </Button>
                  </div>

                  {blockedDates.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {blockedDates.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-sm"
                        >
                          <div>
                            <div className="text-white font-medium">{new Date(block.date).toLocaleDateString()}</div>
                            <div className="text-slate-400 text-xs">{block.reason}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeBlockedDate(block.id)}
                            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
