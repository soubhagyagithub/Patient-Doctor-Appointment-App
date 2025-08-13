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

    // Wave SVG component
    const WaveSVG = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
      <svg
        className={className}
        style={style}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,20 Q25,0 50,20 T100,20 L100,0 L0,0 Z"
          fill="url(#gradient)"
          opacity="0.1"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    )

    return (
      <>
        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                margin: 0;
                background: white !important;
              }
              .prescription-container {
                box-shadow: none !important;
                margin: 0 !important;
                width: 210mm !important;
                min-height: 297mm !important;
                max-width: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
            .wave-decoration {
              pointer-events: none;
              z-index: 0;
            }
          `}
        </style>
        <div
          ref={ref}
          className="prescription-container bg-white text-black font-sans relative overflow-hidden"
          style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            fontSize: '12px',
            lineHeight: '1.4',
            padding: '15mm',
            position: 'relative'
          }}
        >
          {/* Top Left Wave */}
          <WaveSVG
            className="wave-decoration absolute top-0 left-0"
            style={{
              width: '120px',
              height: '120px',
              transform: 'rotate(0deg)'
            }}
          />

          {/* Bottom Right Wave */}
          <WaveSVG
            className="wave-decoration absolute bottom-0 right-0"
            style={{
              width: '120px',
              height: '120px',
              transform: 'rotate(180deg)'
            }}
          />
        {/* Header */}
        <div
          className="text-center mb-6 pb-4 border-b-2 border-blue-600 relative z-10"
          style={{ borderBottomColor: '#2563eb', borderBottomWidth: '2px' }}
        >
          <div className="flex items-center justify-center mb-2">
            <div
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3"
              style={{
                backgroundColor: '#2563eb',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}
            >
              <span
                className="text-white font-bold text-lg"
                style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}
              >
                S
              </span>
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-blue-800"
                style={{ color: '#1e40af', fontSize: '24px', fontWeight: 'bold' }}
              >
                SHEDULA MEDICAL CENTER
              </h1>
              <p
                className="text-sm text-gray-600"
                style={{ color: '#4b5563', fontSize: '14px' }}
              >
                Advanced Healthcare & Medical Services
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
            <span>📍 123 Medical Plaza, Healthcare City - 12345</span>
            <span>📞 +1-555-0101 | 📧 info@shedula-medical.com</span>
          </div>
        </div>

        {/* Doctor Info */}
        <div
          className="mb-4 bg-gray-50 p-3 rounded border relative z-10"
          style={{
            backgroundColor: '#f9fafb',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2
                className="text-lg font-bold text-gray-800"
                style={{ color: '#1f2937', fontSize: '18px', fontWeight: 'bold' }}
              >
                {doctor.name}
              </h2>
              <p
                className="text-sm text-gray-600"
                style={{ color: '#4b5563', fontSize: '14px' }}
              >
                {doctor.qualifications}
              </p>
              <p
                className="text-sm text-blue-600"
                style={{ color: '#2563eb', fontSize: '14px' }}
              >
                {doctor.specialty}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-600">Reg. No: {doctor.registrationNumber}</p>
              <p className="text-gray-600">Date: {currentDate.toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6 border border-gray-300 rounded relative z-10">
          <div
            className="bg-blue-50 px-3 py-2 border-b"
            style={{
              backgroundColor: '#eff6ff',
              padding: '8px 12px',
              borderBottom: '1px solid #d1d5db'
            }}
          >
            <h3
              className="text-sm font-bold text-blue-800"
              style={{ color: '#1e40af', fontSize: '14px', fontWeight: 'bold' }}
            >
              PATIENT INFORMATION
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {prescription.patientName}</p>
                <p><strong>Patient ID:</strong> {prescription.patientId}</p>
              </div>
              <div>
                <p><strong>Age/Gender:</strong> 35 Years / Male</p>
                <p><strong>Date:</strong> {new Date(prescription.dateCreated).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Symbol */}
        <div className="text-center mb-4 relative z-10">
          <div className="inline-block">
            <div className="text-4xl font-bold text-blue-600 mb-1">℞</div>
            <p className="text-sm font-semibold text-gray-800">PRESCRIPTION</p>
          </div>
        </div>

        {/* Medications Table */}
        <div className="mb-6 relative z-10">
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr
                className="bg-blue-100"
                style={{ backgroundColor: '#dbeafe' }}
              >
                <th
                  className="border border-gray-400 p-2 text-left font-bold w-8"
                  style={{ border: '1px solid #9ca3af', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}
                >
                  S.No
                </th>
                <th
                  className="border border-gray-400 p-2 text-left font-bold"
                  style={{ border: '1px solid #9ca3af', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}
                >
                  Medicine Name
                </th>
                <th
                  className="border border-gray-400 p-2 text-left font-bold"
                  style={{ border: '1px solid #9ca3af', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}
                >
                  Dosage
                </th>
                <th
                  className="border border-gray-400 p-2 text-left font-bold"
                  style={{ border: '1px solid #9ca3af', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}
                >
                  Frequency
                </th>
                <th
                  className="border border-gray-400 p-2 text-left font-bold"
                  style={{ border: '1px solid #9ca3af', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}
                >
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((medicine, index) => (
                <tr
                  key={`medicine-${index}`}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}
                >
                  <td
                    className="border border-gray-400 p-2 text-center font-medium"
                    style={{ border: '1px solid #9ca3af', padding: '8px', textAlign: 'center' }}
                  >
                    {index + 1}
                  </td>
                  <td
                    className="border border-gray-400 p-2"
                    style={{ border: '1px solid #9ca3af', padding: '8px' }}
                  >
                    <div className="font-semibold" style={{ fontWeight: '600' }}>{medicine.name}</div>
                    {medicine.instructions && (
                      <div
                        className="text-xs text-gray-600 mt-1"
                        style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}
                      >
                        {medicine.instructions}
                      </div>
                    )}
                  </td>
                  <td
                    className="border border-gray-400 p-2 font-medium"
                    style={{ border: '1px solid #9ca3af', padding: '8px', fontWeight: '500' }}
                  >
                    {medicine.dosage}
                  </td>
                  <td
                    className="border border-gray-400 p-2"
                    style={{ border: '1px solid #9ca3af', padding: '8px' }}
                  >
                    {medicine.frequency || 'As directed'}
                  </td>
                  <td
                    className="border border-gray-400 p-2"
                    style={{ border: '1px solid #9ca3af', padding: '8px' }}
                  >
                    {medicine.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor's Notes */}
        {prescription.notes && (
          <div className="mb-4 border border-yellow-300 bg-yellow-50 rounded p-3 relative z-10">
            <h4 className="text-sm font-bold text-yellow-800 mb-1">Doctor's Notes:</h4>
            <p className="text-sm text-gray-700">{prescription.notes}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 bg-red-50 border border-red-200 rounded p-3 relative z-10">
          <h4 className="text-sm font-bold text-red-800 mb-2">Important Instructions:</h4>
          <div className="grid grid-cols-2 gap-3 text-xs text-red-700">
            <div>
              <p>• Take medicines as prescribed</p>
              <p>• Complete the full course</p>
            </div>
            <div>
              <p>• Store in cool, dry place</p>
              <p>• Keep away from children</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end pt-6 border-t border-gray-300 relative z-10">
          {/* Follow-up Info */}
          <div className="text-xs">
            <p className="font-bold text-gray-800 mb-1">Follow-up:</p>
            <p className="text-gray-600">Next visit: {new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</p>
            <p className="text-gray-600">Valid until: {new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</p>
          </div>

          {/* Doctor's Signature */}
          <div className="text-center">
            <div className="w-32 h-16 border-b border-gray-400 mb-2 flex items-end justify-center">
              <div className="text-lg font-bold text-blue-600 mb-1">{doctor.name.split(' ').map(n => n[0]).join('')}</div>
            </div>
            <p className="text-xs font-bold">{doctor.name}</p>
            <p className="text-xs text-gray-600">{doctor.qualifications}</p>
            <p className="text-xs text-gray-600">Reg. No: {doctor.registrationNumber}</p>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 border-t pt-2 relative z-10">
          <p>This is a computer generated prescription | Document ID: SC-{prescription.id.slice(-6).toUpperCase()} | Generated on: {currentDate.toLocaleString('en-GB')}</p>
          <p>📧 prescriptions@shedula-medical.com | 🌐 www.shedula-medical.com</p>
        </div>
        </div>
      </>
    )
  }
)

PrescriptionPrint.displayName = 'PrescriptionPrint'
