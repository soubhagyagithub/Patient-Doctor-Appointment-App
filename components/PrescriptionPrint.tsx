"use client"

import React, { forwardRef } from 'react'
import { type Prescription } from '@/lib/api'

interface PrescriptionPrintProps {
  prescription: Prescription
  doctorInfo?: {
    name: string
    qualifications: string
    specialty: string
    phone: string
    clinicAddress: string
    registrationNumber: string
  }
}

export const PrescriptionPrint = forwardRef<HTMLDivElement, PrescriptionPrintProps>(
  ({ prescription, doctorInfo }, ref) => {
    const currentDate = new Date()
    
    // Default doctor info if not provided
    const doctor = doctorInfo || {
      name: prescription.doctorName,
      qualifications: "MD, MBBS",
      specialty: "General Medicine",
      phone: "+1-555-0101",
      clinicAddress: "123 Medical Plaza, Healthcare City",
      registrationNumber: "MED12345"
    }

    return (
      <div
        ref={ref}
        className="bg-white text-black font-sans"
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          fontSize: '12px',
          lineHeight: '1.4',
          padding: '20px'
        }}
      >
        {/* Hospital Header with Logo */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Hospital Logo */}
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L3 7l9 5 9-5-9-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12l9 5 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>

              {/* Hospital Details */}
              <div>
                <h1 className="text-xl font-bold text-blue-800 mb-1">Shedula Medical Center</h1>
                <p className="text-sm font-medium text-gray-700">Advanced Healthcare & Medical Services</p>
                <p className="text-xs text-gray-600">Estd. 1985 | NABH Accredited | ISO 9001:2015 Certified</p>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>📍 123 Medical Plaza, Healthcare City, State - 12345</p>
                  <p>📞 Emergency: +1-555-EMERGENCY | OPD: +1-555-0101</p>
                  <p>🌐 www.shedula-medical.com | ✉️ info@shedula-medical.com</p>
                </div>
              </div>
            </div>

            {/* Date and Registration */}
            <div className="text-right">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm font-bold text-blue-800">Date: {currentDate.toLocaleDateString('en-GB')}</p>
                <p className="text-xs text-gray-600">Time: {currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-xs text-gray-600 mt-1">Reg. No: {doctor.registrationNumber}</p>
              </div>
            </div>
          </div>

          {/* Doctor Information Bar */}
          <div className="mt-4 bg-gray-50 p-3 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800">{doctor.name}</h2>
                <p className="text-sm text-gray-600">{doctor.qualifications} | {doctor.specialty}</p>
              </div>
              <div className="text-right text-xs text-gray-600">
                <p>Medical License: {doctor.registrationNumber}</p>
                <p>Chamber: Room 205, Block A</p>
              </div>
            </div>
          </div>
        </div>


        {/* Patient Information */}
        <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2 text-green-600">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PATIENT DETAILS
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Name:</strong> {prescription.patientName}</p>
              <p><strong>Age/Sex:</strong> 35 Years / Male</p>
              <p><strong>Patient ID:</strong> {prescription.patientId}</p>
            </div>
            <div>
              <p><strong>Contact:</strong> +1-555-PATIENT</p>
              <p><strong>Address:</strong> 123 Patient Street, City</p>
              <p><strong>Insurance:</strong> Shedula Gold Plan</p>
            </div>
          </div>
        </div>

        {/* Enhanced Rx Symbol */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-2">
            <div className="text-3xl font-bold text-white">℞</div>
          </div>
          <p className="text-sm font-bold text-gray-800">PRESCRIPTION</p>
          <p className="text-xs text-gray-600">Please follow dosage instructions carefully</p>
        </div>

        {/* Enhanced Medicine Table */}
        <div className="mb-6">
          <div className="bg-orange-50 border border-orange-200 p-4 rounded">
            <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2 text-orange-600">
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              PRESCRIBED MEDICATIONS
            </h3>
            <table className="w-full border-collapse border border-black text-sm bg-white">
              <thead>
                <tr>
                  <th className="border border-black p-3 text-left bg-blue-100 font-bold">Medicine Name & Instructions</th>
                  <th className="border border-black p-3 text-left bg-blue-100 font-bold">Dosage & Frequency</th>
                  <th className="border border-black p-3 text-left bg-blue-100 font-bold">Duration</th>
                  <th className="border border-black p-3 text-left bg-blue-100 font-bold">Timing</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines.map((medicine, index) => (
                  <tr key={`medicine-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-black p-3">
                      <div className="font-semibold text-gray-900">{index + 1}. {medicine.name}</div>
                      {medicine.instructions && (
                        <div className="text-xs text-blue-600 mt-1 italic">📝 {medicine.instructions}</div>
                      )}
                    </td>
                    <td className="border border-black p-3">
                      <div className="font-medium">{medicine.dosage}</div>
                      <div className="text-xs text-gray-600">As prescribed</div>
                    </td>
                    <td className="border border-black p-3">
                      <div className="font-medium">{medicine.duration}</div>
                      <div className="text-xs text-gray-600">Complete course</div>
                    </td>
                    <td className="border border-black p-3">
                      <div className="text-sm">Before/After meal</div>
                      <div className="text-xs text-gray-600">As directed</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Notes & Instructions */}
        <div className="mb-6">
          {prescription.notes && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-3">
              <h4 className="text-sm font-bold text-yellow-800 mb-1">📋 Doctor's Notes:</h4>
              <p className="text-sm text-gray-700">{prescription.notes}</p>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <h4 className="text-sm font-bold text-red-800 mb-2">⚠️ Important Instructions:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• Take medicines exactly as prescribed</li>
              <li>• Complete the full course even if you feel better</li>
              <li>• Contact doctor immediately if any adverse reactions occur</li>
              <li>• Store medicines in cool, dry place away from children</li>
            </ul>
          </div>
        </div>


        {/* Enhanced Footer with Digital Signature */}
        <div className="mt-6 border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between items-end">
            {/* Left side - Follow up and verification */}
            <div className="flex-1">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <h4 className="text-xs font-bold text-blue-800 mb-2">📅 FOLLOW UP INFORMATION</h4>
                <p className="text-xs text-blue-700">Next Visit: {new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</p>
                <p className="text-xs text-blue-700">Emergency Contact: +1-555-EMERGENCY</p>
                <p className="text-xs text-blue-700">Valid until: {new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            {/* Right side - Digital signature */}
            <div className="ml-6 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg p-4">
                <div className="w-40 h-24 bg-white border-2 border-dashed border-blue-400 rounded flex flex-col items-center justify-center mb-3">
                  <svg width="32" height="20" viewBox="0 0 100 40" className="text-blue-600 mb-1">
                    <path d="M10,30 Q20,10 30,30 T50,30 Q60,10 70,30 T90,30" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <text x="50" y="25" textAnchor="middle" className="text-xs font-bold" fill="currentColor">{doctor.name.split(' ').map(n => n[0]).join('')}</text>
                  </svg>
                  <p className="text-xs text-blue-600 font-medium">Digital Signature</p>
                  <p className="text-xs text-blue-500">{currentDate.toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-xs border-t border-blue-300 pt-2">
                  <p className="font-bold text-blue-800">{doctor.name}</p>
                  <p className="text-blue-700">{doctor.qualifications}</p>
                  <p className="text-blue-700">{doctor.specialty}</p>
                  <p className="text-blue-600">License: {doctor.registrationNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom verification strip */}
          <div className="mt-4 bg-gray-100 border border-gray-300 p-2 rounded text-center">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <div>
                <p className="font-medium">Shedula Medical Center</p>
                <p>📍 123 Medical Plaza, Healthcare City | 📞 +1-555-0101</p>
              </div>
              <div className="text-center">
                <p>Generated: {currentDate.toLocaleString('en-GB')}</p>
                <p>Document ID: MC-{prescription.id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p>🌐 www.shedula-medical.com</p>
                <p>📧 prescriptions@shedula-medical.com</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }
)

PrescriptionPrint.displayName = 'PrescriptionPrint'
