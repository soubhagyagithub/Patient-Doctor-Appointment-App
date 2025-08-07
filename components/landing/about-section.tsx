"use client"

import { Badge } from "@/components/ui/badge"
import {
  Shield,
  UserCheck,
  Clock,
  Award,
  HeartPulse,
  Star,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

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

export default function AboutSection() {
  return (
    <AnimatedSection className="relative py-20 md:py-32 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 -right-16 w-96 h-96 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl z-0" />

      <section id="about" className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="bg-gradient-to-r from-green-200 to-green-400 text-green-800 hover:scale-105 shadow-md px-5 py-2 text-base font-semibold mb-4 transition-transform duration-300 ease-in-out rounded-full dark:from-green-700 dark:to-green-600 dark:text-white">
              About MediCare
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Leading Healthcare Excellence for Over {" "}
              <span className="text-blue-600 dark:text-blue-400">20 Years</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 md:text-xl leading-relaxed mb-10">
              MediCare is dedicated to providing innovative, patient-centered healthcare with compassion and expertise.
              Our commitment to excellence and modern medical practices has made us a trusted name for thousands of families.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 justify-center mt-14">
            {[{
              Icon: Shield,
              color: "bg-blue-500",
              title: "Advanced Technology",
              desc: "State-of-the-art equipment and digital records",
            }, {
              Icon: UserCheck,
              color: "bg-green-500",
              title: "Expert Team",
              desc: "Qualified, caring doctors and staff",
            }, {
              Icon: Clock,
              color: "bg-purple-500",
              title: "24/7 Support",
              desc: "Emergency care and patient help anytime",
            }, {
              Icon: Award,
              color: "bg-orange-500",
              title: "Accredited & Trusted",
              desc: "Internationally recognized standards",
            }].map(({ Icon, color, title, desc }, index) => {
              const ref = useRef(null)
              const inView = useInView(ref, { once: true, margin: "-100px" })

              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial={{ opacity: 0, y: 60 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center bg-white/90 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 backdrop-blur-xl rounded-2xl px-6 py-10 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`p-3 rounded-full text-white mb-4 shadow-lg ${color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 text-center">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{desc}</p>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 mt-20"
          >
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
              <HeartPulse className="h-7 w-7 text-pink-600" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                5000+ Happy Patients
              </span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
              <Star className="h-7 w-7 text-yellow-400" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                4.9/5 Patient Rating
              </span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
              <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                20+ Years Experience
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </AnimatedSection>
  )
}
