"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Video, Phone, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export function HeroSection() {
  const { theme } = useTheme()

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900"
  const descColor = theme === "dark" ? "text-gray-300" : "text-gray-600"

  return (
    <section className="hero-gradient py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className={`text-5xl md:text-7xl font-bold ${textColor} mb-6 leading-tight`}>
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>
          <p className={`text-xl md:text-2xl ${descColor} mb-8 max-w-3xl mx-auto leading-relaxed`}>
            Connect with qualified doctors instantly. Book appointments, get online consultations, and take control of
            your health journey.
          </p>
        </div>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Find Doctor Nearby */}
          <Card className="glass-card hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl font-bold">Find Doctor Nearby</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Discover qualified doctors in your area with ratings and reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/find-doctors">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white group-hover:text-blue-600 transition-all duration-300">
                  Explore Doctors
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Video Consultation */}
          <Card className="glass-card hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl font-bold">Video Consultation</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Get instant medical advice through secure video calls
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/consultations/video">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white group-hover:text-emerald-600 transition-all duration-300">
                  Start Video Call
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Call Consultation */}
          <Card className="glass-card hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl font-bold">Call Consultation</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Quick medical consultation over phone calls
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/consultations/call">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white group-hover:text-purple-600 transition-all duration-300">
                  Make a Call
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
