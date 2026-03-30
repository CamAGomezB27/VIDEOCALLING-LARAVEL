import { api } from "@/shared/lib/api";
import type { JoinRoomResponse } from "../types";

export const livekitApi = {
  join: (appointmentId: number) =>
    api.get<JoinRoomResponse>(`/appointments/${appointmentId}/join`),

  startRecording: (appointmentId: number) =>
    api.post(`/appointments/${appointmentId}/recording/start`),

  stopRecording: (appointmentId: number) =>
    api.post(`/appointments/${appointmentId}/recording/stop`),

  endMeeting: (appointmentId: number) =>
    api.post(`/appointments/${appointmentId}/end`),
};
