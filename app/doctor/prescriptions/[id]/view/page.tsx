"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { PrescriptionPrint } from "@/components/PrescriptionPrint"
import { prescriptionsAPI, type Prescription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react'
import { useRef } from 'react'

export default function ViewPrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const prescriptionId = params.id as string

  useEffect(() => {
    if (prescriptionId) {
      loadPrescription()
    }
  }, [prescriptionId])

  const loadPrescription = async () => {
    setIsLoading(true)
    try {
      const data = await prescriptionsAPI.getById(prescriptionId)
      setPrescription(data)
    } catch (error) {
      console.error("Failed to load prescription:", error)
      toast({
        title: "Error",
        description: "Failed to load prescription. Please try again.",
        variant: "destructive",
      })
      router.push("/doctor/prescriptions")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        // Get all stylesheets and inline styles
        const allStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(el => {
          if (el.tagName === 'LINK') {
            return `<link rel="stylesheet" href="${el.href}">`
          }
          return el.outerHTML
        }).join('')

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Prescription - ${prescription?.patientName}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script src="https://cdn.tailwindcss.com"></script>
              ${allStyles}
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }

                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                @media print {
                  body {
                    margin: 0;
                    background: white !important;
                  }
                  .no-print { display: none !important; }
                  .prescription-container {
                    box-shadow: none !important;
                    margin: 0 !important;
                    width: 210mm !important;
                    min-height: 297mm !important;
                    max-width: none !important;
                  }
                }

                body {
                  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                  background: white;
                  margin: 0;
                  padding: 0;
                }

                /* Ensure all colors and backgrounds print */
                .bg-blue-600 { background-color: #2563eb !important; }
                .bg-blue-800 { background-color: #1e40af !important; }
                .bg-blue-100 { background-color: #dbeafe !important; }
                .bg-blue-50 { background-color: #eff6ff !important; }
                .bg-gray-50 { background-color: #f9fafb !important; }
                .bg-yellow-50 { background-color: #fefce8 !important; }
                .bg-red-50 { background-color: #fef2f2 !important; }
                .text-blue-600 { color: #2563eb !important; }
                .text-blue-800 { color: #1e40af !important; }
                .text-white { color: white !important; }
                .text-gray-600 { color: #4b5563 !important; }
                .text-gray-700 { color: #374151 !important; }
                .text-gray-800 { color: #1f2937 !important; }
                .text-yellow-800 { color: #92400e !important; }
                .text-red-800 { color: #991b1b !important; }
                .text-red-700 { color: #b91c1c !important; }
                .border-blue-600 { border-color: #2563eb !important; }
                .border-gray-300 { border-color: #d1d5db !important; }
                .border-gray-400 { border-color: #9ca3af !important; }
                .border-yellow-300 { border-color: #fcd34d !important; }
                .border-red-200 { border-color: #fecaca !important; }

                /* Table styles */
                table { border-collapse: collapse !important; }
                th, td { border: 1px solid #9ca3af !important; }

                /* Wave decoration */
                .wave-decoration svg {
                  fill: rgba(37, 99, 235, 0.1) !important;
                }
              </style>
            </head>
            <body>
              ${printRef.current.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()

        // Wait longer for Tailwind and styles to load
        setTimeout(() => {
          printWindow.print()
          setTimeout(() => printWindow.close(), 100)
        }, 1000)
      }
    }
  }

  const handleDownloadPDF = async () => {
    try {
      handlePrint()
      toast({
        title: "Download Started",
        description: "Use your browser's print dialog to save as PDF",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const doctorInfo = {
    name: prescription?.doctorName || "Dr. Sarah Johnson",
    qualifications: "MD, FACC",
    specialty: "Cardiology",
    phone: "+1-555-0101",
    clinicAddress: "Heart Care Center, 123 Medical Plaza, New York",
    registrationNumber: "MED12345"
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <DoctorNavbar />
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-slate-800 border-slate-700 text-white">
              <CardContent>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-400">Loading prescription...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!prescription) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <DoctorNavbar />
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-slate-800 border-slate-700 text-white">
              <CardContent>
                <h3 className="text-xl font-semibold text-white mb-2">Prescription not found</h3>
                <p className="text-slate-400">The prescription you're looking for doesn't exist.</p>
                <Button className="mt-4 bg-teal-500 hover:bg-teal-600" onClick={() => router.push("/doctor/prescriptions")}>
                  Back to Prescriptions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mr-4 border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Prescription for {prescription.patientName}
              </h1>
            </div>
            
            <div className="flex space-x-2 no-print">
              <Button
                variant="outline"
                onClick={() => router.push(`/doctor/prescriptions/${prescription.id}/edit`)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <PrescriptionPrint 
              ref={printRef}
              prescription={prescription}
              doctorInfo={doctorInfo}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
