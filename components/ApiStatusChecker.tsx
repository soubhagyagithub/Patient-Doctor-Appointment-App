"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://doctor-appointment-api-1.onrender.com"

export function ApiStatusChecker() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [isRetrying, setIsRetrying] = useState(false)

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctors`, { 
        method: "HEAD",
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      setApiStatus(response.ok ? 'online' : 'offline')
    } catch (error) {
      setApiStatus('offline')
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    await checkApiStatus()
    setIsRetrying(false)
  }

  useEffect(() => {
    checkApiStatus()
    
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (apiStatus === 'checking') {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking API Connection...</AlertTitle>
        <AlertDescription>
          Verifying connection to the backend services.
        </AlertDescription>
      </Alert>
    )
  }

  if (apiStatus === 'offline') {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Server Unavailable</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Cannot connect to the backend API at <code className="text-sm bg-red-100 px-1 rounded">{API_BASE}</code></p>
          <div className="space-y-2">
            <p className="text-sm"><strong>Possible causes:</strong></p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-2">
              <li>The API server may be temporarily unavailable</li>
              <li>Your internet connection may be unstable</li>
              <li>The API service may be starting up (this can take 30-60 seconds)</li>
              <li>There may be a temporary service outage</li>
            </ul>
          </div>
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">API Connected</AlertTitle>
      <AlertDescription className="text-green-700">
        Successfully connected to backend services at {API_BASE}
      </AlertDescription>
    </Alert>
  )
}
