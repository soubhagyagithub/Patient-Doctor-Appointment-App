"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Brain, Baby, Eye, Bone, Stethoscope, Activity } from "lucide-react"

interface SpecialtySliderProps {
  title: string
  onSpecialtySelect: (specialty: string) => void
}

export function SpecialtySlider({ title, onSpecialtySelect }: SpecialtySliderProps) {
  const specialties = [
    {
      name: "Cardiology",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      description: "Heart & Cardiovascular",
    },
    {
      name: "Neurology",
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      description: "Brain & Nervous System",
    },
    {
      name: "Pediatrics",
      icon: Baby,
      color: "from-blue-500 to-cyan-500",
      description: "Children's Health",
    },
    {
      name: "Dermatology",
      icon: Eye,
      color: "from-green-500 to-emerald-500",
      description: "Skin & Beauty",
    },
    {
      name: "Orthopedics",
      icon: Bone,
      color: "from-orange-500 to-yellow-500",
      description: "Bones & Joints",
    },
    {
      name: "General Medicine",
      icon: Stethoscope,
      color: "from-teal-500 to-green-500",
      description: "Primary Care",
    },
    {
      name: "Psychiatry",
      icon: Activity,
      color: "from-pink-500 to-rose-500",
      description: "Mental Health",
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Choose from our wide range of medical specialties</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {specialties.map((specialty) => {
            const IconComponent = specialty.icon
            return (
              <Card
                key={specialty.name}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                onClick={() => onSpecialtySelect(specialty.name.toLowerCase())}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${specialty.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md dark:shadow-lg`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                    {specialty.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{specialty.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
