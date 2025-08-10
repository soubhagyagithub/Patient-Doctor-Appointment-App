// Use external API endpoint
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://doctor-appointment-api-1.onrender.com";

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  qualifications: string;
  experience: string;
  clinicAddress: string;
  availability?: TimeSlot[];
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  doctorName: string;
  patientName: string;
  specialty: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  patientName: string;
  doctorName: string;
  medicines: Medicine[];
  notes?: string;
  dateCreated: string;
  dateUpdated?: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

// Check if JSON Server is running
const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/doctors`, {
      method: "HEAD",
      timeout: 5000 // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn("API Server not available:", error);
    return false;
  }
};

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

// Auth API
export const authAPI = {
  async login(email: string, password: string, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients";
      const response = await fetch(`${API_BASE}/${endpoint}`);

      if (!response.ok) {
        throw new Error(
          "Server not responding. Please make sure JSON Server is running on port 3001."
        );
      }

      const users = await response.json();
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      return { ...user, role };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },

  async signup(userData: any, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients";
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...userData, id: Date.now().toString() }),
      });

      if (!response.ok) {
        throw new Error(
          "Server not responding. Please make sure JSON Server is running on port 3001."
        );
      }

      const user = await response.json();
      return { ...user, role };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },
};



// Doctors API
export const doctorsAPI = {
  async getAll(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${API_BASE}/doctors`);
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      handleApiError(error, "fetching doctors");
    }
  },

  async getById(id: string): Promise<Doctor> {
    try {
      const response = await fetch(`${API_BASE}/doctors/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctor");
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

  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    try {
      const response = await fetch(`${API_BASE}/doctors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update doctor");
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
};

// Appointments API
export const appointmentsAPI = {
  async create(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...appointment, id: Date.now().toString() }),
      });
      if (!response.ok) {
        throw new Error("Failed to create appointment");
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

  async getByDoctorId(doctorId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(
        `${API_BASE}/appointments?doctorId=${doctorId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      handleApiError(error, "fetching appointments");
    }
  },

  async getByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(
        `${API_BASE}/appointments?patientId=${patientId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
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

  async updateStatus(
    id: string,
    status: Appointment["status"]
  ): Promise<Appointment> {
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update appointment");
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
  cancelAppointment: async (appointmentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Failed to cancel: ${response.statusText}`);
      } catch {
        throw new Error(`Failed to cancel: ${response.statusText} - ${errorText || 'No specific error message from server'}`);
      }
    }
  },

  async updateDateTime(
    id: string,
    date: string,
    time: string
  ): Promise<Appointment> {
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, time }),
      });
      if (!response.ok) {
        throw new Error("Failed to update appointment");
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

// Patients API
export const patientsAPI = {
  async getAll(): Promise<Patient[]> {
    try {
      const response = await fetch(`${API_BASE}/patients`);
      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      handleApiError(error, "fetching patients");
    }
  },

  async getById(id: string): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE}/patients/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patient");
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

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE}/patients/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update patient");
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
};

// Prescriptions API
export const prescriptionsAPI = {
  async create(prescription: Omit<Prescription, "id" | "dateCreated">): Promise<Prescription> {
    try {
      const newPrescription = {
        ...prescription,
        id: Date.now().toString(),
        dateCreated: new Date().toISOString(),
      };
      const response = await fetch(`${API_BASE}/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrescription),
      });
      if (!response.ok) {
        throw new Error("Failed to create prescription");
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

  async getByDoctorId(doctorId: string): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch prescriptions: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      handleApiError(error, "fetching prescriptions");
    }
  },

  async getByPatientId(patientId: string): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions?patientId=${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
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

  async update(id: string, data: Partial<Prescription>): Promise<Prescription> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, dateUpdated: new Date().toISOString() }),
      });
      if (!response.ok) {
        throw new Error("Failed to update prescription");
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

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete prescription");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Prescription> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescription");
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

  async getAll(): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
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

  async findExistingForPatient(doctorId: string, patientId: string): Promise<Prescription | null> {
    try {
      const response = await fetch(`${API_BASE}/prescriptions?doctorId=${doctorId}&patientId=${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }
      const prescriptions: Prescription[] = await response.json();

      // Return the most recent prescription for this patient from this doctor
      if (prescriptions.length > 0) {
        // Sort by date created and return the most recent one
        return prescriptions.sort((a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        )[0];
      }

      return null;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },

  async addMedicinesToExisting(prescriptionId: string, newMedicines: Medicine[]): Promise<Prescription> {
    try {
      // First get the existing prescription
      const existingPrescription = await this.getById(prescriptionId);

      // Merge existing medicines with new ones, avoiding duplicates
      const existingMedicineNames = existingPrescription.medicines.map(m => m.name.toLowerCase());
      const uniqueNewMedicines = newMedicines.filter(
        newMed => !existingMedicineNames.includes(newMed.name.toLowerCase())
      );

      const mergedMedicines = [...existingPrescription.medicines, ...uniqueNewMedicines];

      // Update the prescription with merged medicines
      return await this.update(prescriptionId, {
        medicines: mergedMedicines,
        dateUpdated: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to server. Please run 'npm run json-server' in a separate terminal."
        );
      }
      throw error;
    }
  },

  async createOrMerge(prescription: Omit<Prescription, "id" | "dateCreated">): Promise<{ prescription: Prescription; wasUpdated: boolean }> {
    try {
      // Check if there's an existing prescription for this patient from this doctor
      const existingPrescription = await this.findExistingForPatient(prescription.doctorId, prescription.patientId);

      if (existingPrescription) {
        // Merge with existing prescription
        const updatedPrescription = await this.addMedicinesToExisting(existingPrescription.id, prescription.medicines);
        return { prescription: updatedPrescription, wasUpdated: true };
      } else {
        // Create new prescription
        const newPrescription = await this.create(prescription);
        return { prescription: newPrescription, wasUpdated: false };
      }
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
