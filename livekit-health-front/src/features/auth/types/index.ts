import type { Doctor, Patient, Role } from "@/shared/types";

export type CurrentUser = (Doctor | Patient) & { role: Role };

export interface LoginCredentials {
  email: string;
  docNumber: string;
  role: Role;
}
