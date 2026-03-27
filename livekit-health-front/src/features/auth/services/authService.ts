import { api } from "@/shared/lib/api";
import type { Doctor, Patient, Role } from "@/shared/types";
import type { CurrentUser } from "../types";

export async function verifyIdentity(
  email: string,
  docNumber: string,
  role: Role,
): Promise<CurrentUser> {
  if (role === "patient") {
    const list = await api.get<Patient[]>("/patients");

    const found = list.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.document_number === docNumber,
    );

    if (!found) {
      throw new Error(
        "Credenciales incorrectas. Verifica tu correo y documento.",
      );
    }

    return { ...found, role };
  }

  // doctor
  const list = await api.get<Doctor[]>("/doctors");

  const found = list.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.license_number === docNumber,
  );

  if (!found) {
    throw new Error(
      "Credenciales incorrectas. Verifica tu correo y documento.",
    );
  }

  return { ...found, role };
}
