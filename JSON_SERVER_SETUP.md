# JSON Server Setup for Local Development

## Quick Start

To enable full medical history functionality including diagnoses data, you need to run the local JSON server:

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start JSON Server
Open a new terminal window and run:
```bash
npm run json-server
```

This will start the JSON server on `http://localhost:3001` with the complete medical database including:
- Doctors
- Patients  
- Appointments (with vital signs and diagnoses)
- Prescriptions (with detailed medication info)
- Diagnoses (formal diagnosis records)

### 3. Verify Server is Running
Open `http://localhost:3001` in your browser to see the JSON server interface.

### 4. Test Endpoints
- `http://localhost:3001/doctors`
- `http://localhost:3001/patients`
- `http://localhost:3001/appointments`
- `http://localhost:3001/prescriptions`
- `http://localhost:3001/diagnoses`

## Environment Configuration

The app will automatically use the local JSON server if it's running on port 3001. If not, it falls back to the external API (which has limited data).

## Features Available with Full Database

✅ **With JSON Server Running:**
- Complete patient medical history
- Formal diagnoses with ICD codes
- Detailed appointment records with vital signs
- Comprehensive prescription tracking
- Statistical insights and treatment response rates

⚠️ **Without JSON Server:**
- Basic appointment and prescription history
- Limited statistical insights
- No formal diagnoses data

## Troubleshooting

If you see "No diagnoses data" in the medical history:
1. Make sure JSON server is running (`npm run json-server`)
2. Check that `http://localhost:3001/diagnoses` returns data
3. Restart the Next.js dev server if needed

The medical history page will work without the JSON server but with limited functionality.
