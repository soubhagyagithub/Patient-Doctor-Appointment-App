"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  User,
  Calendar,
  Home,
  Users,
  FileText,
  CalendarDays,
  Heart,
  Bell,
  Settings,
  Star
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { doctorsAPI } from "@/lib/api"

export function DoctorNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [doctorData, setDoctorData] = useState<any>(null)

  useEffect(() => {
    const loadDoctorData = async () => {
      if (user?.id) {
        try {
          const data = await doctorsAPI.getById(user.id)
          setDoctorData(data)
        } catch (error) {
          console.error("Failed to load doctor data:", error)
        }
      }
    }
    loadDoctorData()
  }, [user?.id])

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  if (!user || user.role !== "doctor") return null

  const navItems = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: Home },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/doctor/reviews", label: "Reviews", icon: Star },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/doctor/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-blue-500">Shedula</span>
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`px-4 py-2 ${
                      isActive(item.href)
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={doctorData?.image || "/placeholder.svg?height=32&width=32"}
                      alt={user.name || "Doctor"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                      {user.name?.split(" ").map(n => n[0]).join("") || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.specialty || "Specialist"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/doctor/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`text-xs ${
                      isActive(item.href)
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
