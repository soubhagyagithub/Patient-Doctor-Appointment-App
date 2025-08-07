"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient since 2020",
    content:
      "The care I received at Medicare was exceptional. The doctors were knowledgeable, compassionate, and took the time to explain everything clearly. I couldn't have asked for better treatment.",
    image: "/placeholder.svg?height=60&width=60&text=SJ",
    bg: "from-rose-50 via-pink-50 to-rose-100 dark:from-rose-900 dark:via-pink-900 dark:to-rose-800",
    accent: "rose",
  },
  {
    name: "Michael Chen",
    role: "Patient since 2018",
    content:
      "Medicare's emergency department saved my life. The quick response and professional care I received during my heart attack was incredible. Forever grateful to the entire team.",
    image: "/placeholder.svg?height=60&width=60&text=MC",
    bg: "from-blue-50 via-sky-50 to-blue-100 dark:from-blue-900 dark:via-sky-900 dark:to-blue-800",
    accent: "blue",
  },
  {
    name: "Emily Rodriguez",
    role: "Patient since 2019",
    content:
      "As a mother of three, I appreciate Medicare's pediatric care. The doctors are wonderful with children, and the facilities are clean and welcoming. Highly recommend to all families.",
    image: "/placeholder.svg?height=60&width=60&text=ER",
    bg: "from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900 dark:via-green-900 dark:to-emerald-800",
    accent: "emerald",
  },
  {
    name: "David Thompson",
    role: "Patient since 2021",
    content:
      "The surgical team at Medicare performed my knee replacement with precision and care. The recovery process was smooth thanks to their excellent post-operative support and guidance.",
    image: "/placeholder.svg?height=60&width=60&text=DT",
    bg: "from-purple-50 via-violet-50 to-purple-100 dark:from-purple-900 dark:via-violet-900 dark:to-purple-800",
    accent: "purple",
  },
  {
    name: "Lisa Wang",
    role: "Patient since 2017",
    content:
      "Medicare's oncology department provided me with hope during my cancer treatment. The compassionate care and cutting-edge treatment options helped me beat cancer successfully.",
    image: "/placeholder.svg?height=60&width=60&text=LW",
    bg: "from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-900 dark:via-yellow-900 dark:to-amber-800",
    accent: "amber",
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
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
    <motion.div ref={ref} initial="initial" animate={isInView ? "animate" : "initial"} className={className}>
      {children}
    </motion.div>
  )
}

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setActiveIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 text-white dark:text-gray-100">
      <AnimatedSection className="w-full py-24 md:py-32">
        <section id="testimonials" className="w-full">
          <div className="w-full mx-auto px-6 md:px-12">
            <motion.div variants={fadeInUp} className="text-center mb-16 space-y-6 max-w-3xl mx-auto">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-purple-300 border-0 px-4 py-2 text-sm font-medium">
                ✨ Patient Stories
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                What Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Patients
                </span>{" "}
                Say
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Real experiences from patients who've trusted us with their health and well-being.
              </p>
            </motion.div>

            {/* Slider Container */}
            <div className="relative w-full max-w-6xl mx-auto">
              {/* Navigation Buttons */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="h-12 w-12 rounded-full bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="h-12 w-12 rounded-full bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Slider */}
              <div className="w-full overflow-hidden rounded-3xl bg-transparent">
                <div className="relative h-[600px] md:h-[500px]">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex items-center justify-center px-4 ${
                        index === activeIndex
                          ? "opacity-100 translate-x-0 scale-100"
                          : index < activeIndex
                            ? "opacity-0 -translate-x-full scale-95"
                            : "opacity-0 translate-x-full scale-95"
                      }`}
                    >
                      <Card
                        className={`w-full max-w-4xl bg-gradient-to-br ${testimonial.bg} shadow-2xl border-0 relative overflow-hidden ${
                          index === activeIndex ? "animate-pulse-subtle" : ""
                        }`}
                      >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                        <CardContent className="p-8 md:p-12 relative z-10">
                          <div className="text-center space-y-6">
                            {/* Decorative Top Elements */}
                            <div className="flex justify-center mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-gray-300"></div>
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                                <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                              </div>
                            </div>

                            {/* Quote Icon */}
                            <div className="flex justify-center">
                              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center relative">
                                <span className="text-3xl text-gray-600">"</span>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80"></div>
                              </div>
                            </div>

                            {/* Decorative Elements Above Stars */}
                            <div className="flex justify-center mb-2">
                              <div className="flex items-center space-x-1">
                                <div className="w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                                <div
                                  className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                                <div
                                  className="w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
                                  style={{ animationDelay: "0.4s" }}
                                ></div>
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center justify-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                              ))}
                            </div>

                            {/* Content */}
                            <blockquote className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium italic max-w-3xl mx-auto">
                              "{testimonial.content}"
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center justify-center space-x-4 pt-4">
                              <div className="relative">
                                <Image
                                  src={testimonial.image || "/placeholder.svg"}
                                  alt={testimonial.name}
                                  width={64}
                                  height={64}
                                  className="rounded-full object-cover border-4 border-white shadow-lg"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <div className="text-left">
                                <div className="text-xl font-bold text-gray-900">{testimonial.name}</div>
                                <div className="text-sm text-gray-600 font-medium">{testimonial.role}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-12 space-x-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`relative transition-all duration-300 ${
                    i === activeIndex
                      ? "w-12 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      : "w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded-full hover:scale-110"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  {i === activeIndex && (
                    <motion.div
                      className="absolute inset-0 bg-white/30 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="flex justify-center mt-8">
              <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: isAutoPlaying ? "100%" : "0%" }}
                  transition={{ duration: 6, ease: "linear", repeat: Number.POSITIVE_INFINITY }} // Changed from 5 to 6
                  key={activeIndex}
                />
              </div>
            </div>
           </div>
        </section>
      </AnimatedSection>
      <style jsx global>{`
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.01);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}