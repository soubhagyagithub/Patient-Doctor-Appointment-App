"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Stethoscope, Heart } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
}

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden py-16"
    >
      {/* Decorative Blurs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300/30 dark:bg-pink-500/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-28"
        >
          {/* Left Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-full mb-6">
              Trusted Healthcare Provider
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Your Health is Our{" "}
              <span className="text-blue-600 dark:text-blue-400">Priority</span>
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              Get world-class care with our experienced doctors and advanced facilities. <br />
              Personalized and reliable medical service for every need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button
                onClick={() => window.location.href = "/auth"}
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:scale-105 transition-transform px-8 py-5 text-lg font-semibold shadow-lg group"
              >
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 px-8 py-5 text-lg font-semibold shadow"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              {[{
                label: "Happy Patients",
                value: "500+"
              }, {
                label: "Expert Doctors",
                value: "50+"
              }, {
                label: "Emergency Care",
                value: "24/7"
              }].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/80 dark:bg-gray-800 backdrop-blur-md rounded-xl px-6 py-3 shadow text-center"
                >
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="relative w-full max-w-[600px] mx-auto"
            >
              <Image
                src="https://plus.unsplash.com/premium_photo-1661492071612-98d26885614a?w=1200&auto=format&fit=crop&q=80"
                alt="Senior Doctor"
                width={1200}
                height={1600}
                className="rounded-3xl shadow-2xl object-cover border-4 border-white dark:border-gray-700 max-h-[600px] w-full h-auto"
              />

              {/* Doctor Label */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-3 rounded-lg shadow-lg">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Dr. Sarah Wilson</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Chief Medical Officer</p>
              </div>

              {/* Floating Icons */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl"
              >
                <Stethoscope className="h-6 w-6" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 bg-green-500 text-white p-4 rounded-full shadow-xl"
              >
                <Heart className="h-6 w-6" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
