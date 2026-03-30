import type { Role } from "@/shared/types";

export interface ChatMessagePayload {
  type: "chat" | "system";
  text: string;
  sender: string;
  sender_id?: number;
  sender_role?: Role;
}

export interface ChatMessageUI {
  id: string;
  text: string;
  sender: string;
  isMine: boolean;
  time: string;
  isSystem?: boolean;
}
