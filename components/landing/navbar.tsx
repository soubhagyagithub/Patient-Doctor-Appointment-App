"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Menu, X, LogIn } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle" // ✅ Add this line

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Testimonials", href: "#testimonials" },
]

const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.3,
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      duration: 0.3,
    },
  },
}

const itemVariants = {
  closed: { opacity: 0, y: -20 },
  open: { opacity: 1, y: 0 },
}

function NavLink({ name, href, onClick }: { name: string; href: string; onClick?: () => void }) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
    onClick?.()
  }

  return (
    <Link
      href={href}
      onClick={handleScroll}
      className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-3 px-4 block w-full text-center md:text-left"
    >
      {name}
    </Link>
  )
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 shadow-sm"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8 max-w-screen-xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Medicare
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="hidden md:flex items-center space-x-8"
        >
          {navLinks.map((link) => (
            <NavLink key={link.name} {...link} />
          ))}
        </motion.nav>

        {/* Desktop Actions: Login + Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="hidden md:flex items-center space-x-4"
        >
          <Link href="/auth">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center">
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            </motion.div>
          </Link>
          {/* ✅ Desktop only ThemeToggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 border-t border-gray-100 dark:border-gray-800 shadow-md absolute top-20 left-0"
          >
            <nav className="flex flex-col items-center py-4 px-4">
              {navLinks.map((link) => (
                <motion.div key={link.name} variants={itemVariants} className="w-full">
                  <NavLink {...link} onClick={() => setMobileMenuOpen(false)} />
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="w-full px-4 mt-4">
                <Link href="/auth" className="w-full">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center">
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* ✅ Mobile-only ThemeToggle */}
              <motion.div variants={itemVariants} className="mt-4 md:hidden">
                <ThemeToggle />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
