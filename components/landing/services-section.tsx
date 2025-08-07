"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Stethoscope,
  Activity,
  Users,
  Shield,
  Heart,
  UserCheck,
  ArrowRight,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
}

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const services = [
  {
    icon: Stethoscope,
    title: "General Medicine",
    description:
      "Comprehensive primary care including check-ups, preventive care, and treatment of common illnesses.",
    color: "blue",
  },
  {
    icon: Activity,
    title: "Cardiology",
    description:
      "Advanced heart care, diagnostics, treatments, and recovery support for all ages.",
    color: "green",
  },
  {
    icon: Users,
    title: "Pediatrics",
    description:
      "Expert child care with focus on growth, nutrition, and developmental health.",
    color: "purple",
  },
  {
    icon: Shield,
    title: "Emergency Care",
    description:
      "24/7 emergency support with expert teams and fast-track diagnosis.",
    color: "orange",
  },
  {
    icon: Heart,
    title: "Surgery",
    description:
      "Minimally invasive surgeries with modern facilities and skilled surgeons.",
    color: "red",
  },
  {
    icon: UserCheck,
    title: "Diagnostics",
    description:
      "Lab testing, imaging, and screenings with precision and efficiency.",
    color: "teal",
  },
]

const colorMap: Record<string, string> = {
  blue: "blue-600",
  green: "green-600",
  purple: "purple-600",
  orange: "orange-600",
  red: "red-600",
  teal: "teal-600",
}

const bgColorMap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-600",
  green: "bg-green-100 dark:bg-green-900 group-hover:bg-green-600",
  purple: "bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-600",
  orange: "bg-orange-100 dark:bg-orange-900 group-hover:bg-orange-600",
  red: "bg-red-100 dark:bg-red-900 group-hover:bg-red-600",
  teal: "bg-teal-100 dark:bg-teal-900 group-hover:bg-teal-600",
}

export default function ServicesSection() {
  return (
    <AnimatedSection className="py-20 md:py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden">
      <section id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200">
              Our Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed">
              From preventive care to specialized treatments, we offer a full
              range of medical services to meet your health needs — all in one place.
            </p>
          </motion.div>

          {/* Service Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-16"
          >
            {services.map((service, index) => {
              const Icon = service.icon
              const color = colorMap[service.color]
              const bg = bgColorMap[service.color]

              return (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="group relative overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/80 dark:bg-gray-800 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-2xl">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-all duration-300 shadow-sm ${bg}`}
                      >
                        <Icon
                          className={`h-6 w-6 text-${color} group-hover:text-white transition-colors duration-300`}
                        />
                      </div>
                      <h3
                        className={`text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-${color}`}
                      >
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                        {service.description}
                      </p>
                      <Button
                        size="sm"
                        className={`mt-auto font-semibold text-white bg-${color} hover:bg-${color.replace(
                          "600",
                          "700"
                        )} rounded-full px-4 py-2 transition duration-300`}
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>

                    {/* Glowing border animation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.3 }}
                      className={`absolute -inset-1 z-[-1] rounded-2xl bg-gradient-to-tr from-${service.color}-400 to-${service.color}-600 blur-2xl transition duration-500`}
                    />
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>
    </AnimatedSection>
  )
}
