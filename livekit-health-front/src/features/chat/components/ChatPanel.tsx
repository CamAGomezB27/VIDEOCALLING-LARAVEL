"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessageUI } from "../types";
import { ChatMessage } from "./ChatMessage";

interface Props {
  messages: ChatMessageUI[];
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => Promise<void>;
}

export function ChatPanel({ messages, isOpen, onClose, onSend }: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await onSend(input.trim());
      setInput("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`flex-shrink-0 bg-[#111820] border-l border-white/10
                     flex flex-col overflow-hidden transition-all duration-300
                     ${isOpen ? "w-72" : "w-0"}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5
                      border-b border-white/10 flex-shrink-0"
      >
        <span className="text-sm font-medium text-[#e8f0f7]">Chat</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                           text-[#5a7a96] hover:text-[#e8f0f7] hover:bg-[#1a2330]
                           transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-3
                      scrollbar-thin scrollbar-thumb-[#1a2330]"
      >
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-8
                          text-[#5a7a96] text-xs font-mono text-center"
          >
            <svg
              className="w-8 h-8 opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            El chat está vacío.
            <br />
            Sé el primero en escribir.
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-white/10 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
          maxLength={500}
          className="flex-1 bg-[#1a2330] border border-white/10 rounded-xl
                     px-3 py-2 text-[#e8f0f7] text-sm font-sans outline-none
                     focus:border-[#00d4aa]/40 transition-colors
                     placeholder:text-[#5a7a96]/60"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center
                     rounded-xl bg-[#00d4aa] text-[#04342c] hover:bg-[#00e8ba]
                     transition-colors disabled:opacity-40"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
