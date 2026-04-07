import type { Role } from "@/shared/types";
export type { Role } from "@/shared/types";

// ── Respuesta del join ──────────────────────────────────────

export interface JoinRoomResponse {
  room_name: string;
  livekit_url: string;
  patient_token: string;
  doctor_token: string;
}

export interface RoomState {
  micEnabled: boolean;
  camEnabled: boolean;
  isRecording: boolean;
  seconds: number;
  participantCount: number;
}

// ── Estado general de la sala ───────────────────────────────
export type RoomPhase =
  | "pre-lobby" // configurando cam/mic antes de entrar
  | "waiting" // en sala de espera (reunión no activa o esperando admisión)
  | "active"; // dentro de la reunión

// ── Participante en sala de espera ──────────────────────────
export interface WaitingParticipant {
  identity: string;
  name: string;
  role: Role;
  joinedAt: number; // timestamp para ordenar por llegada
}

// ── Tipos de mensajes Data Channel ─────────────────────────
export type DataMessageType =
  | "meeting_started" // médico activa la reunión
  | "meeting_ended" // médico cierra la reunión
  | "knock" // alguien pide entrar
  | "admit" // médico admite a alguien
  | "reject" // médico rechaza a alguien
  | "waiting_message" // médico envía mensaje a sala de espera
  | "chat" // mensaje de chat
  | "system"; // mensaje de sistema

export interface DataMessage {
  type: DataMessageType;
  // knock
  name?: string;
  role?: Role;
  identity?: string;
  // admit / reject
  targetIdentity?: string;
  // waiting_message / reject
  message?: string;
  // chat
  text?: string;
  sender?: string;
  sender_id?: number;
  sender_role?: Role;
}

// ── Estado de speaking detection ────────────────────────────
export interface SpeakingState {
  [identity: string]: boolean;
}

// ── Config del pre-lobby ────────────────────────────────────
export interface PreLobbyConfig {
  micEnabled: boolean;
  camEnabled: boolean;
}
