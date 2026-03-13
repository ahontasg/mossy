import { useState } from "react";
import { motion } from "motion/react";
import { useAssistantStore } from "../../../stores/assistantStore";

interface NotesPanelProps {
  onClose: () => void;
}

export function NotesPanel({ onClose }: NotesPanelProps) {
  const notes = useAssistantStore((s) => s.notes);
  const addNote = useAssistantStore((s) => s.addNote);
  const deleteNote = useAssistantStore((s) => s.deleteNote);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addNote(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="rounded-xl px-3 py-3 w-[220px] max-h-[90%] flex flex-col"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-xs font-medium">Notes</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-[9px]">
              {notes.length}
            </span>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
            >
              &#x2715;
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto flex flex-col gap-1 pr-0.5 mb-2"
          style={{ maxHeight: "240px" }}
        >
          {notes.length === 0 && (
            <p className="text-white/30 text-[10px] text-center py-4">
              No notes yet. Add one below!
            </p>
          )}
          {notes.map((note) => {
            const date = new Date(note.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <div
                key={note.id}
                className="flex items-start gap-1 rounded-lg px-2 py-1.5 group"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-[10px] leading-tight break-words">
                    {note.content}
                  </p>
                  <p className="text-white/30 text-[8px] mt-0.5">
                    {timeStr}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-white/20 hover:text-red-400 text-[10px] leading-none transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                >
                  &#x2715;
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note..."
            className="flex-1 rounded-lg px-2 py-1 text-[10px] text-white/80 placeholder-white/30 outline-none"
            style={{ background: "rgba(255, 255, 255, 0.08)" }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="rounded-lg px-2 py-1 text-[10px] text-white/60 hover:text-white/90 transition-colors disabled:opacity-30"
            style={{ background: "rgba(255, 255, 255, 0.08)" }}
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}
