"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkApiHealth } from "@/lib/api"

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testApiConnection = async () => {
    setIsLoading(true)
    try {
      // Test basic connectivity
      const healthCheck = await checkApiHealth()
      console.log("Health check result:", healthCheck)

      // Test specific endpoints
      const endpoints = [
        { name: "Doctors", url: "http://localhost:3001/doctors" },
        { name: "Appointments", url: "http://localhost:3001/appointments" },
        { name: "Prescriptions", url: "http://localhost:3001/prescriptions" },
        { name: "Diagnoses", url: "http://localhost:3001/diagnoses" }
      ]

      const endpointResults = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint.url)
            const data = await response.json()
            return {
              name: endpoint.name,
              status: response.status,
              success: response.ok,
              count: Array.isArray(data) ? data.length : "Not an array",
              error: null
            }
          } catch (error) {
            return {
              name: endpoint.name,
              status: 0,
              success: false,
              count: 0,
              error: error instanceof Error ? error.message : "Unknown error"
            }
          }
        })
      )

      setTestResults({
        healthCheck,
        endpoints: endpointResults.map(result => 
          result.status === "fulfilled" ? result.value : { error: result.reason }
        ),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error("Test failed:", error)
      setTestResults({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testApiConnection} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? "Testing..." : "Test API Connection"}
          </Button>

          {testResults && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Health Check Result:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(testResults.healthCheck, null, 2)}
                </pre>
              </div>

              {testResults.endpoints && (
                <div>
                  <h3 className="font-semibold">Endpoint Tests:</h3>
                  <div className="space-y-2">
                    {testResults.endpoints.map((endpoint: any, index: number) => (
                      <div key={index} className="bg-gray-100 p-2 rounded">
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-sm">
                          Status: {endpoint.success ? "✅ Success" : "❌ Failed"}
                          {endpoint.status && ` (${endpoint.status})`}
                        </div>
                        {endpoint.count !== undefined && (
                          <div className="text-sm">Records: {endpoint.count}</div>
                        )}
                        {endpoint.error && (
                          <div className="text-sm text-red-600">Error: {endpoint.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResults.error && (
                <div>
                  <h3 className="font-semibold text-red-600">Error:</h3>
                  <div className="bg-red-100 p-2 rounded text-sm">
                    {testResults.error}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Test performed at: {testResults.timestamp}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
