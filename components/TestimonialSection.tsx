"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Patient",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Shedula made it so easy to find a great doctor. The video consultation was smooth and professional. Highly recommend!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Patient",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Quick appointment booking and excellent service. The doctors are very knowledgeable and caring.",
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Patient",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "The online consultation feature is a game-changer. Got medical advice from home during my busy schedule.",
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Patient",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Excellent platform with qualified doctors. The appointment system is very user-friendly and efficient.",
  },
]

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Patients Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real experiences from real patients who trust Shedula for their healthcare needs
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <Quote className="w-12 h-12 text-blue-500 mx-auto mb-6" />
                      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300 dark:bg-gray-600"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
