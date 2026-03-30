"use client";

import type { CurrentUser } from "@/features/auth";
import type { Room } from "livekit-client";
import { RoomEvent } from "livekit-client";
import { useCallback, useRef, useState } from "react";
import { chatApi } from "../services/chatApi";
import type { ChatMessagePayload, ChatMessageUI } from "../types";

export function useChat(
  room: Room | null,
  user: CurrentUser | null,
  appointmentId: number,
) {
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [unreadCount, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);

  // Mantener ref sincronizado para usarlo dentro del evento
  const setOpen = useCallback((val: boolean) => {
    isOpenRef.current = val;
    setIsOpen(val);
    if (val) setUnread(0);
  }, []);

  const addMessage = useCallback((msg: ChatMessageUI) => {
    setMessages((prev) => [...prev]);
    setMessages((prev) => [...prev, msg]);
    if (!isOpenRef.current) {
      setUnread((prev) => prev + 1);
    }
  }, []);

  const addSystemMsg = useCallback(
    (text: string) => {
      addMessage({
        id: crypto.randomUUID(),
        text,
        sender: "",
        isMine: false,
        time: "",
        isSystem: true,
      });
    },
    [addMessage],
  );

  // Registrar listener de DataReceived en el room
  const setupListeners = useCallback(
    (r: Room) => {
      r.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const msg: ChatMessagePayload = JSON.parse(
            new TextDecoder().decode(payload),
          );
          if (msg.type === "chat") {
            addMessage({
              id: crypto.randomUUID(),
              text: msg.text,
              sender: msg.sender,
              isMine: false,
              time: new Date().toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          } else if (msg.type === "system") {
            addSystemMsg(msg.text);
          }
        } catch {
          /* payload no válido */
        }
      });
    },
    [addMessage, addSystemMsg],
  );

  // Cargar historial desde Laravel
  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const history = await chatApi.getHistory(appointmentId);
      const mapped: ChatMessageUI[] = history.map((m) => ({
        id: String(m.id),
        text: m.message,
        sender: m.sender_name,
        isMine: m.sender_id === user.id,
        time: new Date(m.created_at).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(mapped);
    } catch {
      /* historial no crítico */
    }
  }, [appointmentId, user]);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (text: string) => {
      if (!room || !user || !text.trim()) return;

      const payload: ChatMessagePayload = {
        type: "chat",
        text: text.trim(),
        sender: user.name,
        sender_id: user.id,
        sender_role: user.role,
      };

      // 1. Persistir en Laravel
      await chatApi.saveMessage(appointmentId, {
        message: text.trim(),
        sender_id: user.id,
        sender_role: user.role,
      });

      // 2. Enviar por LiveKit Data Channel
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(payload)),
        { reliable: true },
      );

      // 3. Mostrar propio mensaje
      addMessage({
        id: crypto.randomUUID(),
        text: text.trim(),
        sender: user.name,
        isMine: true,
        time: new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    [room, user, appointmentId, addMessage],
  );

  return {
    messages,
    unreadCount,
    isOpen,
    setOpen,
    sendMessage,
    loadHistory,
    setupListeners,
    addSystemMsg,
  };
}
