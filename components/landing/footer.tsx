"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Heart, Phone, Mail, MapPin,
  Facebook, Twitter, Instagram, Linkedin,
  CheckCircle, ArrowUp,
} from "lucide-react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Section with in-view detection
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div ref={ref} initial="initial" animate={isInView ? "animate" : "initial"} className={className}>
      {children}
    </motion.div>
  )
}

// Scroll-to-top floating button
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggle = () => setIsVisible(window.scrollY > 300)
    window.addEventListener("scroll", toggle)
    return () => window.removeEventListener("scroll", toggle)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button
        size="icon"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </motion.div>
  )
}

export default function Footer() {
  return (
    <AnimatedSection>
      <footer className="bg-gradient-to-br from-[#e0f7fa] via-[#f3e5f5] to-[#ede7f6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-[#333c57] dark:text-gray-300 relative overflow-hidden">
        <div className="container px-4 md:px-6 py-14 max-w-screen-xl mx-auto">
          <motion.div variants={staggerContainer} className="grid gap-10 lg:grid-cols-3">
            {/* Brand Section */}
            <motion.div variants={fadeInUp} className="space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Medicare
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-400 max-w-xs">
                Your trusted partner in health, delivering compassionate care with modern excellence.
              </p>
              <div className="flex space-x-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-full transition-all"
                  >
                    <Icon className="h-5 w-5 text-gray-300 hover:text-white" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Links */}
            <motion.div variants={fadeInUp} className="grid gap-8 sm:grid-cols-2 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h3 className="text-purple-600 dark:text-purple-400 text-base font-semibold mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  {["Home", "About", "Services", "Testimonials", "Careers"].map((item, i) => (
                    <li key={i}>
                      <Link href="#" className="hover:text-blue-500 dark:hover:text-blue-400 flex items-center group">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-blue-400 opacity-0 group-hover:opacity-100" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-purple-600 dark:text-purple-400 text-base font-semibold mb-3">Services</h3>
                <ul className="space-y-2">
                  {["General", "Cardiology", "Pediatrics", "Surgery"].map((item, i) => (
                    <li key={i}>
                      <Link href="#" className="hover:text-blue-500 dark:hover:text-blue-400 flex items-center group">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-400 opacity-0 group-hover:opacity-100" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={fadeInUp} className="space-y-5 text-sm text-gray-600 dark:text-gray-400">
              <h3 className="text-purple-600 dark:text-purple-400 text-base font-semibold mb-3">Contact</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                <p>123 Health St, Medical City</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400" />
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-purple-400" />
                <p>info@medicare.com</p>
              </div>
              <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full">
                <Phone className="mr-2 h-4 w-4" />
                Emergency: Call Now
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer Bottom */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400"
          >
            <p className="text-center md:text-left mb-4 md:mb-0">
              © {new Date().getFullYear()} Medicare. All rights reserved.
            </p>
            <div className="flex space-x-4">
              {["Privacy", "Terms", "Cookies"].map((item, i) => (
                <Link key={i} href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </AnimatedSection>
  )
}