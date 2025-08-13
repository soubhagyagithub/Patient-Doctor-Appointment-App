# DocBook - Doctor Appointment Booking App

A full-stack web application for booking doctor appointments with role-based authentication for doctors and patients.

## Features

### For Patients
- Search and book appointments with doctors
- Filter doctors by specialty
- View appointment history
- Manage profile information

### For Doctors
- Dashboard with appointment statistics
- Manage professional profile
- View and manage patient appointments
- Confirm/cancel appointments

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Mock Backend**: JSON Server
- **Authentication**: Role-based with localStorage

## Quick Setup Guide

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Install JSON Server globally** (if not already installed):
   \`\`\`bash
   npm install -g json-server
   \`\`\`

3. **Start the mock backend first** (in one terminal):
   \`\`\`bash
   npm run json-server
   \`\`\`
   This should show: `Resources: http://localhost:3001/doctors, http://localhost:3001/patients, http://localhost:3001/appointments`

4. **Start the Next.js app** (in another terminal):
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open the app**: Go to http://localhost:3000

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the JSON Server (mock backend):
   \`\`\`bash
   npm run json-server
   \`\`\`

4. In a new terminal, start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Login Credentials

### Doctor Account
- Email: sarah.johnson@email.com
- Password: doctor123

### Patient Account
- Email: john@example.com
- Password: patient123

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── doctor/            # Doctor-specific pages
│   ├── profile/           # Patient profile
│   └── appointments/      # Patient appointments
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── Navbar.tsx        # Navigation component
│   └── ProtectedRoute.tsx # Route protection
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility functions
│   └── api.ts           # API functions
└── db.json              # Mock database
\`\`\`

## API Endpoints

The mock API runs on `http://localhost:3001` with the following endpoints:

- `GET /doctors` - Get all doctors
- `GET /patients` - Get all patients  
- `GET /appointments` - Get all appointments
- `POST /doctors` - Create doctor account
- `POST /patients` - Create patient account
- `POST /appointments` - Book appointment
- `PATCH /appointments/:id` - Update appointment status

## Features Implemented

✅ Role-based authentication (Doctor/Patient)  
✅ Responsive design with dark theme  
✅ Doctor search and filtering  
✅ Appointment booking system  
✅ Profile management  
✅ Dashboard with statistics  
✅ Appointment status management  
✅ Form validation  
✅ Toast notifications  

## Deployment

To deploy this application:

1. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   npm start
   \`\`\`

For the mock API, you'll need to deploy JSON Server separately or replace it with a real backend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
