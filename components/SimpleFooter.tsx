"use client"

import { Heart } from "lucide-react"

export function SimpleFooter() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Doc<span className="text-blue-500">Book</span>
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
            © 2025 Shedula. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
