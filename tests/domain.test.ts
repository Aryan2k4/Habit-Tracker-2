import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dayKey,
  shiftDay,
  streaks,
  scheduled,
  completion,
  growth,
  type Habit,
} from "../lib/domain.ts";
const habit: Habit = {
  id: "h",
  name: "Read",
  goal: "g",
  milestone: "Start",
  days: "1,3,5",
  time: "09:00",
  created: "2026-11-20",
  archived: 0,
};
test("local day respects India midnight, not UTC", () => {
  assert.equal(
    dayKey(new Date("2026-11-24T19:00:00Z"), "Asia/Kolkata"),
    "2026-11-25",
  );
  assert.equal(
    dayKey(new Date("2026-11-24T19:00:00Z"), "America/New_York"),
    "2026-11-24",
  );
});
test("calendar arithmetic crosses month, leap year, and year boundaries", () => {
  assert.equal(shiftDay("2024-03-01", -1), "2024-02-29");
  assert.equal(shiftDay("2026-01-01", -1), "2025-12-31");
});
test("current streak survives an unfinished today and best survives breaks", () => {
  assert.deepEqual(
    streaks(
      ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-24"],
      "2026-11-25",
    ),
    { current: 1, best: 3 },
  );
  assert.deepEqual(streaks(["2026-11-22"], "2026-11-25"), {
    current: 0,
    best: 1,
  });
});
test("duplicate and future dates cannot inflate streaks", () => {
  assert.deepEqual(
    streaks(
      ["2026-11-24", "2026-11-24", "2026-11-25", "2026-11-26"],
      "2026-11-25",
    ),
    { current: 2, best: 2 },
  );
});
test("scheduled days respect creation and weekday", () => {
  assert.equal(scheduled(habit, "2026-11-18"), false);
  assert.equal(scheduled(habit, "2026-11-25"), true);
  assert.equal(scheduled(habit, "2026-11-24"), false);
});
test("completion excludes paused and unscheduled habits", () => {
  assert.deepEqual(
    completion(
      {
        habits: [habit, { ...habit, id: "paused", archived: 1 }],
        logs: [
          { habit: "h", date: "2026-11-25" },
          { habit: "h", date: "2026-11-25" },
        ],
      },
      "2026-11-25",
    ),
    { total: 1, done: 1 },
  );
});
test("plant stages have stable boundaries", () => {
  assert.equal(growth(0).label, "Seed");
  assert.equal(growth(1).stage, 1);
  assert.equal(growth(39).next, 40);
  assert.equal(growth(40).label, "Blooming");
  assert.equal(growth(75).next, null);
});
