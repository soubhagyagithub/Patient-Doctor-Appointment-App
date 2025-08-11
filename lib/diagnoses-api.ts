// Use adaptive API detection
const LOCAL_API = "http://localhost:3001";
const EXTERNAL_API = "https://doctor-appointment-api-1.onrender.com";

// Global variable to cache the working API base
let workingApiBase: string | null = null;

// Function to detect which API server is available
const detectWorkingApiBase = async (): Promise<string> => {
  if (workingApiBase) {
    return workingApiBase;
  }

  // Check if we're in a production environment
  const isProduction = typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1') &&
    !window.location.hostname.includes('0.0.0.0');

  // In production, skip localhost and use external API directly
  if (isProduction) {
    workingApiBase = EXTERNAL_API;
    console.log("Production environment detected, using external API:", EXTERNAL_API);
    return EXTERNAL_API;
  }

  // In development, try local server first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(`${LOCAL_API}/doctors`, {
      method: "HEAD",
      mode: "cors",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      workingApiBase = LOCAL_API;
      console.log("Local JSON server detected:", LOCAL_API);
      return LOCAL_API;
    }
  } catch (error) {
    console.warn("Local server not available, using external API:", error);
  }

  // Fallback to external server
  workingApiBase = EXTERNAL_API;
  console.log("Using external API:", EXTERNAL_API);
  return EXTERNAL_API;
};

export interface Diagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  icdCode?: string;
  severity?: "Mild" | "Moderate" | "Severe";
  status: "Active" | "Resolved" | "Improving" | "Chronic";
  dateOfDiagnosis: string;
  notes?: string;
}

// Enhanced error handler
const handleApiError = (error: any, operation: string) => {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw new Error(
      `Cannot connect to API server. Please ensure the JSON server is running on ${API_BASE}. Run 'npm run json-server' in a separate terminal.`
    );
  }

  if (error.name === 'AbortError') {
    throw new Error(`Request timeout: ${operation} took too long to respond.`);
  }

  throw error;
};

// Diagnoses API
export const diagnosesAPI = {
  async getAll(): Promise<Diagnosis[]> {
    try {
      const response = await fetch(`${API_BASE}/diagnoses`);
      if (!response.ok) {
        throw new Error(`Failed to fetch diagnoses: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      handleApiError(error, "fetching diagnoses");
      return [];
    }
  },

  async getByPatientId(patientId: string): Promise<Diagnosis[]> {
    try {
      const apiBase = await detectWorkingApiBase();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${apiBase}/diagnoses?patientId=${patientId}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If we get a 404, the endpoint doesn't exist - return empty array
        if (response.status === 404) {
          console.warn("Diagnoses endpoint not found, returning empty array");
          return [];
        }
        console.warn(`Diagnoses API returned ${response.status}, returning empty array`);
        return [];
      }

      const data = await response.json();
      // Handle case where API returns empty object instead of array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Always return empty array for any error to prevent app crashes
      console.warn("Error fetching diagnoses, returning empty array:", error);
      return [];
    }
  },

  async getByDoctorId(doctorId: string): Promise<Diagnosis[]> {
    try {
      const response = await fetch(`${API_BASE}/diagnoses?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctor diagnoses");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },

  async create(diagnosis: Omit<Diagnosis, "id">): Promise<Diagnosis> {
    try {
      const newDiagnosis = {
        ...diagnosis,
        id: Date.now().toString(),
      };
      const response = await fetch(`${API_BASE}/diagnoses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDiagnosis),
      });
      if (!response.ok) {
        throw new Error("Failed to create diagnosis");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },

  async update(id: string, data: Partial<Diagnosis>): Promise<Diagnosis> {
    try {
      const response = await fetch(`${API_BASE}/diagnoses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update diagnosis");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },
}
