import { useAchievementStore } from "../../stores/achievementStore";

const WEEKS_TO_SHOW = 8;
const DAYS_PER_WEEK = 7;

function getCalendarDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const totalDays = WEEKS_TO_SHOW * DAYS_PER_WEEK;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

function getIntensity(count: number): string {
  if (count === 0) return "var(--color-surface-inset)";
  if (count <= 2) return "oklch(0.58 0.14 145 / 0.2)";
  if (count <= 5) return "oklch(0.58 0.14 145 / 0.35)";
  if (count <= 10) return "oklch(0.58 0.14 145 / 0.55)";
  return "oklch(0.58 0.14 145 / 0.75)";
}

export function CareCalendar() {
  const careHistory = useAchievementStore((s) => s.careHistory);
  const historyMap = new Map(careHistory.map((e) => [e.date, e.actions.length]));
  const dates = getCalendarDates();

  // Split into weeks (columns)
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += DAYS_PER_WEEK) {
    weeks.push(dates.slice(i, i + DAYS_PER_WEEK));
  }

  return (
    <div className="flex gap-[2px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map((date) => {
            const count = historyMap.get(date) ?? 0;
            return (
              <div
                key={date}
                className="rounded-[2px]"
                style={{
                  width: 8,
                  height: 8,
                  background: getIntensity(count),
                }}
                title={`${date}: ${count} actions`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
