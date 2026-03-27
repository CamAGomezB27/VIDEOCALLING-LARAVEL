export type Role = "patient" | "doctor";

export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  license_number: string;
  phone: string | null;
  active: boolean;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  document_number: string;
  phone: string | null;
  birth_date: string | null;
  notes: string | null;
}

export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  scheduled_at: string;
  duration: number;
  status: AppointmentStatus;
  livekit_room_name: string | null;
  egress_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  doctor?: Doctor;
  patient?: Patient;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_role: Role;
  message: string;
  created_at: string;
}
