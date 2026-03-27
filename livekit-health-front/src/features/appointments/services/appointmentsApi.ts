import { api } from "@/shared/lib/api";
import type { Appointment, Doctor, Patient } from "@/shared/types";
import type { NewAppointment } from "../types";

export const appointmentsApi = {
  getAll: () => api.get<Appointment[]>("/appointments"),

  create: (data: NewAppointment) =>
    api.post<Appointment>("/appointments", data),

  getDoctors: () => api.get<Doctor[]>("/doctors"),

  getPatients: () => api.get<Patient[]>("/patients"),
};
