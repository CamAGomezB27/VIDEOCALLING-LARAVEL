import type { ChatMessageUI } from "../types";

export function ChatMessage({ msg }: { msg: ChatMessageUI }) {
  if (msg.isSystem) {
    return (
      <div className="text-center text-xs text-[#5a7a96] font-mono py-1">
        {msg.text}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1 ${msg.isMine ? "items-end" : "items-start"}`}
    >
      <span className="text-xs text-[#5a7a96] font-mono px-1">
        {msg.isMine ? "Tú" : msg.sender}
      </span>
      <div
        className={`max-w-[200px] px-3 py-2 rounded-2xl text-sm leading-relaxed
                       break-words
                       ${
                         msg.isMine
                           ? "bg-[#00d4aa]/15 text-[#e8f0f7] border border-[#00d4aa]/20 rounded-br-sm"
                           : "bg-[#1a2330] text-[#e8f0f7] border border-white/10 rounded-bl-sm"
                       }`}
      >
        {msg.text}
      </div>
      {msg.time && (
        <span className="text-xs text-[#5a7a96]/60 font-mono px-1">
          {msg.time}
        </span>
      )}
    </div>
  );
}
