import { useState } from "react";
import { useAssistantStore } from "../../../stores/assistantStore";
import { PanelCard } from "../../../components/PanelCard";
import { IconNotes } from "../../../components/icons";

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
    <PanelCard
      title="Notes"
      subtitle={`${notes.length}`}
      onClose={onClose}
      icon={<IconNotes size={16} />}
    >
      <div className="flex flex-col gap-1 mb-2">
        {notes.length === 0 && (
          <p className="text-center py-4" style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>
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
              style={{ background: "var(--color-surface-raised)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="leading-tight break-words" style={{ color: "var(--color-text-primary)", fontSize: "var(--text-xs)" }}>
                  {note.content}
                </p>
                <p className="mt-0.5" style={{ color: "var(--color-text-tertiary)", fontSize: "8px" }}>
                  {timeStr}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="hover:text-red-400 text-[10px] leading-none transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-text-tertiary)" }}
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
          className="flex-1 rounded-lg px-2 py-1 outline-none"
          style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)", fontSize: "var(--text-xs)" }}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="rounded-lg px-2 py-1 transition-colors disabled:opacity-30"
          style={{ background: "var(--color-surface-inset)", color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}
        >
          +
        </button>
      </div>
    </PanelCard>
  );
}
