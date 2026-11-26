export type Goal = {
  id: string;
  name: string;
  why: string;
  color: string;
  created: string;
};
export type Habit = {
  id: string;
  goal: string;
  milestone: string;
  name: string;
  days: string;
  time: string;
  created: string;
  archived: number;
};
export type Log = { habit: string; date: string };
export type Task = {
  id: string;
  name: string;
  date: string;
  priority: string;
  done: number;
};
export type Journal = { date: string; mood: number; body: string };
export type FocusSession = {
  id: string;
  started: number;
  minutes: number;
  date: string;
  finished: number;
};
export type Profile = {
  name: string;
  pot: string;
  plant: string;
  timezone: string;
};
export type Circle = {
  id: string;
  name: string;
  code: string;
  ranking: { name: string; days: number }[];
};
export type Snapshot = {
  goals: Goal[];
  habits: Habit[];
  logs: Log[];
  tasks: Task[];
  journals: Journal[];
  sessions: FocusSession[];
  profile: Profile;
  circles: Circle[];
};
export function dayKey(date = new Date(), timezone = "Asia/Kolkata"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function shiftDay(day: string, delta: number): string {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
export function scheduled(habit: Habit, date: string): boolean {
  return (
    habit.created <= date &&
    habit.days
      .split(",")
      .includes(String(new Date(date + "T12:00:00Z").getUTCDay()))
  );
}
export function streaks(
  dates: string[],
  today: string,
): { current: number; best: number } {
  const unique = [...new Set(dates.filter((d) => d <= today))].sort();
  let best = 0,
    run = 0,
    prev = "";
  for (const date of unique) {
    run = prev && shiftDay(prev, 1) === date ? run + 1 : 1;
    best = Math.max(best, run);
    prev = date;
  }
  const set = new Set(unique);
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  return { current, best };
}
export function completion(
  data: Pick<Snapshot, "habits" | "logs">,
  date: string,
) {
  const due = data.habits.filter((h) => !h.archived && scheduled(h, date));
  return {
    total: due.length,
    done: due.filter((h) =>
      data.logs.some((l) => l.habit === h.id && l.date === date),
    ).length,
  };
}
export function growth(count: number) {
  const thresholds = [0, 1, 8, 20, 40, 75];
  const names = [
    "Seed",
    "Sprout",
    "Seedling",
    "Growing",
    "Blooming",
    "Flourishing",
  ];
  let stage = 0;
  thresholds.forEach((n, i) => {
    if (count >= n) stage = i;
  });
  return { stage, label: names[stage], next: thresholds[stage + 1] ?? null };
}
export function insights(data: Snapshot, today: string): string {
  const week = Array.from({ length: 7 }, (_, i) =>
    completion(data, shiftDay(today, -i)),
  );
  const total = week.reduce((s, d) => s + d.total, 0),
    done = week.reduce((s, d) => s + d.done, 0);
  const st = streaks(
    data.logs.map((l) => l.date),
    today,
  );
  return total
    ? `You completed ${done} of ${total} scheduled habits in the last seven days (${Math.round((done / total) * 100)}%). Your current activity streak is ${st.current} days. ${done / total < 0.5 ? "Try making one habit small enough to finish in two minutes." : "Keep your routine manageable; consistency grows through repetition."}`
    : "Start with one small habit linked to a goal you care about. Choose a realistic schedule, then check in after a week.";
}
