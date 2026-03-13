import type { ParsedIntent } from "../../../types";

const DURATION_UNITS: Record<string, number> = {
  s: 1_000,
  sec: 1_000,
  secs: 1_000,
  second: 1_000,
  seconds: 1_000,
  m: 60_000,
  min: 60_000,
  mins: 60_000,
  minute: 60_000,
  minutes: 60_000,
  h: 3_600_000,
  hr: 3_600_000,
  hrs: 3_600_000,
  hour: 3_600_000,
  hours: 3_600_000,
};

export function parseDuration(amount: number, unit: string): number {
  const ms = DURATION_UNITS[unit.toLowerCase()];
  return ms ? amount * ms : 0;
}

const TIMER_RE = /^set\s+(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(s|sec|secs?|seconds?|m|min|mins?|minutes?|h|hr|hrs?|hours?)/i;
const REMINDER_RE = /^remind\s+me\s+(?:in\s+)?(\d+)\s*(s|sec|secs?|seconds?|m|min|mins?|minutes?|h|hr|hrs?|hours?)\s+(?:to\s+)?(.+)/i;
const ADD_NOTE_RE = /^note:\s*(.+)/i;
const ADD_NOTE_ALT_RE = /^(?:save|add)\s+(?:a\s+)?note:?\s*(.+)/i;
const SHOW_NOTES_RE = /^(?:show|list|my)\s*notes/i;

export function parseIntent(text: string): ParsedIntent {
  const trimmed = text.trim();

  // Timer
  const timerMatch = trimmed.match(TIMER_RE);
  if (timerMatch) {
    const amount = parseInt(timerMatch[1], 10);
    const durationMs = parseDuration(amount, timerMatch[2]);
    if (durationMs > 0) {
      return { type: "set_timer", durationMs };
    }
  }

  // Reminder
  const reminderMatch = trimmed.match(REMINDER_RE);
  if (reminderMatch) {
    const amount = parseInt(reminderMatch[1], 10);
    const durationMs = parseDuration(amount, reminderMatch[2]);
    const text = reminderMatch[3].trim();
    if (durationMs > 0 && text) {
      return { type: "set_reminder", durationMs, text };
    }
  }

  // Add note
  const noteMatch = trimmed.match(ADD_NOTE_RE) || trimmed.match(ADD_NOTE_ALT_RE);
  if (noteMatch) {
    const noteText = noteMatch[1].trim();
    if (noteText) {
      return { type: "add_note", text: noteText };
    }
  }

  // Show notes
  if (SHOW_NOTES_RE.test(trimmed)) {
    return { type: "show_notes" };
  }

  return { type: "none" };
}
