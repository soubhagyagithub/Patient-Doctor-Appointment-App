# Medical History Setup Instructions

## Quick Start for Full Medical History Feature

To enable the complete medical history functionality including diagnoses data, follow these steps:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start JSON Server (Required for Medical History)
Open a **new terminal window** and run:
```bash
npm run json-server
```

This will start the local API server on `http://localhost:3001` with complete medical data including:
- ✅ Patient appointments with vital signs
- ✅ Detailed prescriptions with medication info  
- ✅ Formal diagnoses with ICD codes
- ✅ Complete medical timelines

### Step 3: Start Next.js Development Server
In your **main terminal window**, run:
```bash
npm run dev
```

The app will automatically detect and use the local JSON server for full functionality.

## Verification

1. Visit `http://localhost:3000/api-test` to test API connectivity
2. Check that both servers are running:
   - Next.js App: `http://localhost:3000` 
   - JSON Server: `http://localhost:3001`

## Features Available

### ✅ With JSON Server Running:
- Complete patient medical history with chronological timeline
- Formal diagnoses with ICD codes and severity levels
- Detailed appointment records with vital signs
- Prescription tracking with linked diagnoses
- Advanced statistics and treatment response rates
- Rich medical record visualization

### ⚠️ Without JSON Server:
- Basic functionality using external API
- Limited appointment and prescription data
- No formal diagnoses records
- Reduced statistical insights

## Troubleshooting

**Error: "Cannot connect to API server"**
1. Ensure JSON server is running with `npm run json-server`
2. Check that port 3001 is not being used by another process
3. Visit the API test page at `http://localhost:3000/api-test`

**JSON Server Not Starting**
1. Ensure `json-server` package is installed: `npm install`
2. Check that `db.json` file exists in the project root
3. Try restarting: Stop with `Ctrl+C` and run `npm run json-server` again

## Patient Data Available

The system includes comprehensive medical data for:

**John Doe (Patient ID: 1)**
- 6 formal diagnoses (Type 2 Diabetes, Hypertension, etc.)
- 6 prescriptions linked to diagnoses
- Multiple appointments with vital signs
- Complete medical timeline from 2024-2025

**Emily Johnson (Patient ID: 2)** 
- 2 diagnoses (Anxiety, Acne)
- 2 prescriptions
- Dermatology and psychiatry appointments

Access medical history via: **Doctor Dashboard → Patients → [Patient Name] → Medical History**
