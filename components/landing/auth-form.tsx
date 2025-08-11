"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Heart, User, Mail, Phone, Lock, Stethoscope, Eye, EyeOff } from "lucide-react"

interface AuthFormProps {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  isDoctor: boolean
  setIsDoctor: (value: boolean) => void
  formData: any
  handleInputChange: (field: string, value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  isMobile?: boolean
}

export default function AuthForm({
  isLogin,
  setIsLogin,
  isDoctor,
  setIsDoctor,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  isMobile = false,
}: AuthFormProps) {
  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8 animate-fadeInUp">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            Shed<span className="text-blue-500">ula</span>
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50 mb-2">
          {isLogin ? "Welcome Back!" : "Join Shedula"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isLogin ? "Sign in to continue your health journey" : "Start your healthcare journey today"}
        </p>
      </div>

      {/* Main Card */}
      <Card className="shadow-2xl animate-fadeInUp animation-delay-200">
        <CardContent className="p-6 sm:p-8">
          {/* Role Toggle */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-8 p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            <div
              className={`flex items-center space-x-2 transition-all duration-300 ${
                !isDoctor ? "text-blue-500 scale-110" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <User className="w-5 h-5" />
              <Label
                htmlFor={`role-switch-${isMobile ? "mobile" : "desktop"}`}
                className="font-semibold cursor-pointer"
              >
                Patient
              </Label>
            </div>
            <Switch
              id={`role-switch-${isMobile ? "mobile" : "desktop"}`}
              checked={isDoctor}
              onCheckedChange={setIsDoctor}
              className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-600"
            />
            <div
              className={`flex items-center space-x-2 transition-all duration-300 ${
                isDoctor ? "text-purple-500 scale-110" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <Label
                htmlFor={`role-switch-${isMobile ? "mobile" : "desktop"}`}
                className="font-semibold cursor-pointer"
              >
                Doctor
              </Label>
            </div>
          </div>

          {/* Auth Toggle Buttons */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="animate-slideInLeft">
                <Label htmlFor={`name-${isMobile ? "mobile" : "desktop"}`}>Full Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id={`name-${isMobile ? "mobile" : "desktop"}`}
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-12 h-14 rounded-xl"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="animate-slideInLeft animation-delay-100">
              <Label htmlFor={`email-${isMobile ? "mobile" : "desktop"}`}>Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id={`email-${isMobile ? "mobile" : "desktop"}`}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-12 h-14 rounded-xl"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="animate-slideInLeft animation-delay-200">
                <Label htmlFor={`phone-${isMobile ? "mobile" : "desktop"}`}>Phone Number</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id={`phone-${isMobile ? "mobile" : "desktop"}`}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-12 h-14 rounded-xl"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            )}

            <div className="animate-slideInLeft animation-delay-300">
              <Label htmlFor={`password-${isMobile ? "mobile" : "desktop"}`}>Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id={`password-${isMobile ? "mobile" : "desktop"}`}
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-12 pr-12 h-14 rounded-xl"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isDoctor
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              } shadow-2xl animate-slideInUp animation-delay-500 text-white`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                `${isLogin ? "Sign In" : "Create Account"} as ${isDoctor ? "Doctor" : "Patient"}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
