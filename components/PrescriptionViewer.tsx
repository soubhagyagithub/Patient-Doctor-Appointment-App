"use client"

import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PrescriptionPrint } from './PrescriptionPrint'
import { type Prescription } from '@/lib/api'
import { Download, Eye, Printer, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PrescriptionViewerProps {
  prescription: Prescription
  trigger?: React.ReactNode
  doctorInfo?: {
    name: string
    qualifications: string
    specialty: string
    phone: string
    clinicAddress: string
    registrationNumber: string
  }
}

export function PrescriptionViewer({ prescription, trigger, doctorInfo }: PrescriptionViewerProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Prescription - ${prescription.patientName}</title>
              <style>
                @media print {
                  body { margin: 0; }
                  .no-print { display: none !important; }
                }
                body { font-family: 'Times New Roman', serif; }
              </style>
            </head>
            <body>
              ${printRef.current.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleDownloadPDF = async () => {
    try {
      if (printRef.current) {
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (printWindow) {
          const prescriptionHTML = printRef.current.outerHTML
          
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Prescription - ${prescription.patientName}</title>
                <meta charset="utf-8">
                <style>
                  @page {
                    size: A4;
                    margin: 0.5in;
                  }
                  
                  * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    box-sizing: border-box;
                  }
                  
                  body { 
                    font-family: 'Times New Roman', serif;
                    margin: 0;
                    padding: 20px;
                    background-color: white;
                    color: black;
                    font-size: 14px;
                    line-height: 1.4;
                  }
                  
                  /* Preserve all colors and backgrounds */
                  .border-b-2 { border-bottom: 2px solid #2563eb !important; }
                  .border-blue-600 { border-color: #2563eb !important; }
                  .bg-gradient-to-br, .from-blue-600, .to-blue-800 { 
                    background: linear-gradient(to bottom right, #2563eb, #1e40af) !important; 
                  }
                  .rounded-full { border-radius: 50% !important; }
                  .shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1) !important; }
                  .text-white { color: white !important; }
                  .text-blue-800 { color: #1e40af !important; }
                  .text-blue-600 { color: #2563eb !important; }
                  .text-gray-600 { color: #4b5563 !important; }
                  .text-gray-800 { color: #1f2937 !important; }
                  .text-gray-500 { color: #6b7280 !important; }
                  .text-red-800 { color: #991b1b !important; }
                  .text-red-700 { color: #b91c1c !important; }
                  .bg-blue-50 { background-color: #eff6ff !important; }
                  .bg-gray-50 { background-color: #f9fafb !important; }
                  .bg-red-50 { background-color: #fef2f2 !important; }
                  .bg-yellow-50 { background-color: #fefce8 !important; }
                  .bg-gray-100 { background-color: #f3f4f6 !important; }
                  .border { border: 1px solid #d1d5db !important; }
                  .border-gray-300 { border-color: #d1d5db !important; }
                  .border-red-200 { border-color: #fecaca !important; }
                  .border-gray-400 { border-color: #9ca3af !important; }
                  .border-blue-500 { border-color: #3b82f6 !important; }
                  .border-l-4 { border-left: 4px solid #3b82f6 !important; }
                  .border-t { border-top: 1px solid #d1d5db !important; }
                  .rounded { border-radius: 4px !important; }
                  .font-bold { font-weight: bold !important; }
                  .font-semibold { font-weight: 600 !important; }
                  .text-lg { font-size: 18px !important; }
                  .text-xl { font-size: 20px !important; }
                  .text-2xl { font-size: 24px !important; }
                  .text-4xl { font-size: 36px !important; }
                  .text-sm { font-size: 14px !important; }
                  .text-xs { font-size: 12px !important; }
                  .mb-1 { margin-bottom: 4px !important; }
                  .mb-2 { margin-bottom: 8px !important; }
                  .mb-3 { margin-bottom: 12px !important; }
                  .mb-4 { margin-bottom: 16px !important; }
                  .mb-6 { margin-bottom: 24px !important; }
                  .mb-8 { margin-bottom: 32px !important; }
                  .mt-1 { margin-top: 4px !important; }
                  .mt-2 { margin-top: 8px !important; }
                  .mt-8 { margin-top: 32px !important; }
                  .mt-12 { margin-top: 48px !important; }
                  .p-4 { padding: 16px !important; }
                  .p-8 { padding: 32px !important; }
                  .pb-2 { padding-bottom: 8px !important; }
                  .pb-6 { padding-bottom: 24px !important; }
                  .pt-2 { padding-top: 8px !important; }
                  .pt-4 { padding-top: 16px !important; }
                  .pl-4 { padding-left: 16px !important; }
                  .py-2 { padding: 8px 0 !important; }
                  .space-x-4 > * + * { margin-left: 16px !important; }
                  .space-y-1 > * + * { margin-top: 4px !important; }
                  .space-y-4 > * + * { margin-top: 16px !important; }
                  .flex { display: flex !important; }
                  .items-center { align-items: center !important; }
                  .items-start { align-items: flex-start !important; }
                  .items-end { align-items: flex-end !important; }
                  .justify-between { justify-content: space-between !important; }
                  .justify-center { justify-content: center !important; }
                  .text-center { text-align: center !important; }
                  .text-right { text-align: right !important; }
                  .grid { display: grid !important; }
                  .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
                  .gap-4 { gap: 16px !important; }
                  .flex-1 { flex: 1 !important; }
                  .w-16 { width: 64px !important; }
                  .h-16 { height: 64px !important; }
                  .w-32 { width: 128px !important; }
                  
                  @media print {
                    body { margin: 0 !important; padding: 20px !important; }
                    .no-print { display: none !important; }
                  }
                </style>
              </head>
              <body>
                ${prescriptionHTML}
                <script>
                  window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  };
                </script>
              </body>
            </html>
          `)
          printWindow.document.close()
        }
      }
      
      toast({
        title: "Download Started",
        description: "Prescription PDF is ready for download",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Eye className="w-4 h-4 mr-2" />
      View Prescription
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Prescription for {prescription.patientName}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="no-print"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                className="no-print bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <PrescriptionPrint 
            ref={printRef}
            prescription={prescription}
            doctorInfo={doctorInfo}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Standalone prescription action buttons for use in appointment cards
export function PrescriptionActions({ prescription, doctorInfo }: { prescription: Prescription, doctorInfo?: any }) {
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleDownloadPDF = async () => {
    try {
      if (printRef.current) {
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (printWindow) {
          const prescriptionHTML = printRef.current.outerHTML
          
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Prescription - ${prescription.patientName}</title>
                <meta charset="utf-8">
                <style>
                  @page {
                    size: A4;
                    margin: 0.5in;
                  }
                  
                  * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    box-sizing: border-box;
                  }
                  
                  body { 
                    font-family: 'Times New Roman', serif;
                    margin: 0;
                    padding: 20px;
                    background-color: white;
                    color: black;
                    font-size: 14px;
                    line-height: 1.4;
                  }
                  
                  /* Preserve all colors and backgrounds */
                  .border-b-2 { border-bottom: 2px solid #2563eb !important; }
                  .border-blue-600 { border-color: #2563eb !important; }
                  .bg-gradient-to-br, .from-blue-600, .to-blue-800 { 
                    background: linear-gradient(to bottom right, #2563eb, #1e40af) !important; 
                  }
                  .rounded-full { border-radius: 50% !important; }
                  .shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1) !important; }
                  .text-white { color: white !important; }
                  .text-blue-800 { color: #1e40af !important; }
                  .text-blue-600 { color: #2563eb !important; }
                  .text-gray-600 { color: #4b5563 !important; }
                  .text-gray-800 { color: #1f2937 !important; }
                  .text-gray-500 { color: #6b7280 !important; }
                  .text-red-800 { color: #991b1b !important; }
                  .text-red-700 { color: #b91c1c !important; }
                  .bg-blue-50 { background-color: #eff6ff !important; }
                  .bg-gray-50 { background-color: #f9fafb !important; }
                  .bg-red-50 { background-color: #fef2f2 !important; }
                  .bg-yellow-50 { background-color: #fefce8 !important; }
                  .bg-gray-100 { background-color: #f3f4f6 !important; }
                  .border { border: 1px solid #d1d5db !important; }
                  .border-gray-300 { border-color: #d1d5db !important; }
                  .border-red-200 { border-color: #fecaca !important; }
                  .border-gray-400 { border-color: #9ca3af !important; }
                  .border-blue-500 { border-color: #3b82f6 !important; }
                  .border-l-4 { border-left: 4px solid #3b82f6 !important; }
                  .border-t { border-top: 1px solid #d1d5db !important; }
                  .rounded { border-radius: 4px !important; }
                  .font-bold { font-weight: bold !important; }
                  .font-semibold { font-weight: 600 !important; }
                  .text-lg { font-size: 18px !important; }
                  .text-xl { font-size: 20px !important; }
                  .text-2xl { font-size: 24px !important; }
                  .text-4xl { font-size: 36px !important; }
                  .text-sm { font-size: 14px !important; }
                  .text-xs { font-size: 12px !important; }
                  .mb-1 { margin-bottom: 4px !important; }
                  .mb-2 { margin-bottom: 8px !important; }
                  .mb-3 { margin-bottom: 12px !important; }
                  .mb-4 { margin-bottom: 16px !important; }
                  .mb-6 { margin-bottom: 24px !important; }
                  .mb-8 { margin-bottom: 32px !important; }
                  .mt-1 { margin-top: 4px !important; }
                  .mt-2 { margin-top: 8px !important; }
                  .mt-8 { margin-top: 32px !important; }
                  .mt-12 { margin-top: 48px !important; }
                  .p-4 { padding: 16px !important; }
                  .p-8 { padding: 32px !important; }
                  .pb-2 { padding-bottom: 8px !important; }
                  .pb-6 { padding-bottom: 24px !important; }
                  .pt-2 { padding-top: 8px !important; }
                  .pt-4 { padding-top: 16px !important; }
                  .pl-4 { padding-left: 16px !important; }
                  .py-2 { padding: 8px 0 !important; }
                  .space-x-4 > * + * { margin-left: 16px !important; }
                  .space-y-1 > * + * { margin-top: 4px !important; }
                  .space-y-4 > * + * { margin-top: 16px !important; }
                  .flex { display: flex !important; }
                  .items-center { align-items: center !important; }
                  .items-start { align-items: flex-start !important; }
                  .items-end { align-items: flex-end !important; }
                  .justify-between { justify-content: space-between !important; }
                  .justify-center { justify-content: center !important; }
                  .text-center { text-align: center !important; }
                  .text-right { text-align: right !important; }
                  .grid { display: grid !important; }
                  .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
                  .gap-4 { gap: 16px !important; }
                  .flex-1 { flex: 1 !important; }
                  .w-16 { width: 64px !important; }
                  .h-16 { height: 64px !important; }
                  .w-32 { width: 128px !important; }
                  
                  @media print {
                    body { margin: 0 !important; padding: 20px !important; }
                    .no-print { display: none !important; }
                  }
                </style>
              </head>
              <body>
                ${prescriptionHTML}
                <script>
                  window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  };
                </script>
              </body>
            </html>
          `)
          printWindow.document.close()
        }
      }
      
      toast({
        title: "Download Started",
        description: "Prescription PDF is ready for download",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="hidden">
        <PrescriptionPrint 
          ref={printRef}
          prescription={prescription}
          doctorInfo={doctorInfo}
        />
      </div>
      
      <div className="flex space-x-2">
        <PrescriptionViewer 
          prescription={prescription}
          doctorInfo={doctorInfo}
          trigger={
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          }
        />
        <Button
          size="sm"
          onClick={handleDownloadPDF}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </>
  )
}
