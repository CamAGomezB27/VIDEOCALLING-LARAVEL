"use client";

import type { CurrentUser } from "@/features/auth";
import { RemoteParticipant, Room, RoomEvent } from "livekit-client";
import { useCallback, useRef, useState } from "react";
import { chatApi } from "../services/chatApi";
import type { ChatMessagePayload, ChatMessageUI } from "../types";

export function useChat(user: CurrentUser | null, appointmentId: number) {
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
  const listenerRef = useRef<
    ((payload: Uint8Array, participant?: RemoteParticipant) => void) | null
  >(null);

  const setupListeners = useCallback(
    (r: Room) => {
      // 🔥 limpiar listener anterior
      if (listenerRef.current) {
        r.off(RoomEvent.DataReceived, listenerRef.current);
      }

      const listener = (
        payload: Uint8Array,
        _participant?: RemoteParticipant,
      ) => {
        try {
          const msg: ChatMessagePayload = JSON.parse(
            new TextDecoder().decode(payload),
          );

          // 🔥 filtrar SOLO chat/system
          if (msg.type !== "chat" && msg.type !== "system") return;

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
          // payload inválido
        }
      };

      listenerRef.current = listener;

      r.on(RoomEvent.DataReceived, listener);
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
        isMine: Number(m.sender_id) === Number(user.id),
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
    async (room: Room | null, text: string) => {
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
    [user, appointmentId, addMessage],
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
