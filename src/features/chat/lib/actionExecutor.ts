import type { ParsedIntent } from "../../../types";
import { useAssistantStore } from "../../../stores/assistantStore";

export interface ActionResult {
  executed: boolean;
  response?: string;
}

function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""}`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hour${hrs !== 1 ? "s" : ""}`;
}

export function executeIntent(intent: ParsedIntent): ActionResult {
  const store = useAssistantStore.getState();

  switch (intent.type) {
    case "set_timer": {
      const ok = store.addReminder("Timer complete!", Date.now() + (intent.durationMs ?? 0));
      if (!ok) {
        return { executed: true, response: "You already have 10 reminders... maybe finish some first?" };
      }
      return { executed: true, response: `*sets a timer* Got it! I'll let you know in ${formatDuration(intent.durationMs ?? 0)}.` };
    }

    case "set_reminder": {
      const ok = store.addReminder(intent.text ?? "", Date.now() + (intent.durationMs ?? 0));
      if (!ok) {
        return { executed: true, response: "You already have 10 reminders... maybe finish some first?" };
      }
      return { executed: true, response: `*ties a knot in a leaf* I'll remind you about: ${intent.text} in ${formatDuration(intent.durationMs ?? 0)}.` };
    }

    case "add_note": {
      store.addNote(intent.text ?? "");
      return { executed: true, response: "*scribbles on a leaf* Noted!" };
    }

    case "show_notes": {
      const { notes } = store;
      if (notes.length === 0) {
        return { executed: true, response: "No notes yet!" };
      }
      const recent = notes.slice(0, 5);
      const lines = recent.map((n, i) => `${i + 1}. ${n.content}`).join("\n");
      const suffix = notes.length > 5 ? `\n...and ${notes.length - 5} more` : "";
      return { executed: true, response: `*flips through leaves*\n${lines}${suffix}` };
    }

    case "none":
      return { executed: false };

    default:
      return { executed: false };
  }
}
