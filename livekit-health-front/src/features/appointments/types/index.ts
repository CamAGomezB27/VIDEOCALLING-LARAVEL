export interface NewAppointment {
  doctor_id: number;
  patient_id: number;
  scheduled_at: string;
  duration: number;
  notes?: string | null;
}
