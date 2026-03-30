import { api } from "@/shared/lib/api";
import type { ChatMessage } from "@/shared/types";

export const chatApi = {
  getHistory: (appointmentId: number) =>
    api.get<ChatMessage[]>(`/appointments/${appointmentId}/chat`),

  saveMessage: (
    appointmentId: number,
    data: {
      message: string;
      sender_id: number;
      sender_role: string;
    },
  ) => api.post(`/appointments/${appointmentId}/chat`, data),
};
