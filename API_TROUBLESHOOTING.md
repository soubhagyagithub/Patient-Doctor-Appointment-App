# API Connection Troubleshooting Guide

If you're seeing "Failed to fetch" errors, this means the application cannot connect to the backend API server.

## Current API Configuration

The application uses an **external API** hosted at:
**https://doctor-appointment-api-1.onrender.com**

## Quick Fix

1. **Check your internet connection**
2. **Wait 30-60 seconds** (external API may be starting up)
3. **Refresh your browser** or click the "Retry Connection" button

## What's Happening?

The application connects to:
- **Next.js Dev Server** (port 3000) - Serves the frontend
- **External API Server** (Render.com) - Provides the backend API

## Complete Setup

### Simple Start

1. **Start Next.js only:**
   ```bash
   npm run dev
   ```

No need to start a local API server as we're using the external service.

## Verifying Connection

You can test if the external API is working by visiting:
- https://doctor-appointment-api-1.onrender.com/doctors
- https://doctor-appointment-api-1.onrender.com/appointments
- https://doctor-appointment-api-1.onrender.com/prescriptions

## Common Issues

### API Server Starting Up
**Render.com** services can take 30-60 seconds to start if they were idle:
- Wait a minute and try again
- Click "Retry Connection" in the app

### Network Issues
If you can't connect:
- Check your internet connection
- Try accessing https://doctor-appointment-api-1.onrender.com/doctors directly
- Wait and retry as the service may be temporarily busy

### CORS Issues
If you see CORS errors:
- This should be handled by the API server
- Try refreshing the page

## Environment Variables

You can customize the API URL by setting:
```bash
NEXT_PUBLIC_API_BASE=https://doctor-appointment-api-1.onrender.com
```

Or use a local server for development:
```bash
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

## Still Having Issues?

1. Check that `db.json` exists in your project root
2. Ensure ports 3000 and 3001 are available
3. Try restarting both servers
4. Clear browser cache and reload

## Success Indicators

✅ **JSON Server**: Console shows "JSON Server is running"  
✅ **API Connection**: Green "API Connected" banner in the app  
✅ **Data Loading**: Appointments and prescriptions load without errors  
