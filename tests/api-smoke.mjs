import assert from "node:assert/strict";
const origin = process.env.BLOOM_TEST_URL ?? "http://localhost:5180";
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
  throw new Error(
    "Integration checks only run against a local development server.",
  );
const headers = {
  "Content-Type": "application/json",
  Origin: origin,
  Cookie: "__sites_local_auth=1",
};
const read = async () => {
  const r = await fetch(origin + "/api/bloom", { headers });
  assert.equal(r.status, 200);
  return r.json();
};
const post = async (body, status = 200, extra = {}) => {
  const r = await fetch(origin + "/api/bloom", {
    method: "POST",
    headers: { ...headers, ...extra },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  assert.equal(r.status, status, raw);
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};
assert.equal((await fetch(origin + "/api/bloom")).status, 401);
await post(
  {
    action: "task.create",
    name: "Forbidden",
    date: "2026-11-26",
    priority: "normal",
  },
  403,
  { Origin: "https://untrusted.example" },
);
await post(
  { action: "task.create", name: " ", date: "2026-11-26", priority: "normal" },
  400,
);
const before = await read();
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: before.profile.timezone,
}).format(new Date());
const title = "Integration QA " + crypto.randomUUID();
let goalId;
try {
  await post({
    action: "goal.create",
    name: title,
    why: "Automated local verification",
    color: "sage",
    habits: [
      {
        name: "QA habit",
        milestone: "First step",
        days: [0, 1, 2, 3, 4, 5, 6],
        time: "09:00",
      },
    ],
  });
  let d = await read();
  const g = d.goals.find((g) => g.name === title);
  assert.ok(g);
  goalId = g.id;
  const h = d.habits.find((h) => h.goal === g.id);
  assert.ok(h);
  await post({ action: "habit.check", id: h.id, date: today, done: true });
  await post({ action: "habit.check", id: h.id, date: today, done: true });
  d = await read();
  assert.equal(
    d.logs.filter((l) => l.habit === h.id && l.date === today).length,
    1,
  );
  await post(
    { action: "habit.check", id: h.id, date: "2099-01-01", done: true },
    400,
  );
  await post(
    { action: "habit.check", id: crypto.randomUUID(), date: today, done: true },
    404,
  );
  await post({
    action: "habit.edit",
    id: h.id,
    name: "Updated QA habit",
    milestone: "Next step",
    days: [0, 1, 2, 3, 4, 5, 6],
    time: "10:30",
  });
  await post({ action: "habit.archive", id: h.id, archived: true });
  d = await read();
  assert.equal(d.habits.find((v) => v.id === h.id).archived, 1);
  await post({
    action: "task.create",
    name: title,
    date: today,
    priority: "high",
  });
  d = await read();
  const task = d.tasks.find((t) => t.name === title);
  assert.ok(task);
  await post({ action: "task.check", id: task.id, done: true });
  assert.equal((await read()).tasks.find((t) => t.id === task.id).done, 1);
  await post({ action: "task.delete", id: task.id });
  await post({ action: "focus.start", minutes: 1 });
  d = await read();
  const session = d.sessions.find((s) => !s.finished);
  assert.ok(session);
  await post({ action: "focus.finish", id: session.id }, 400);
  await post({ action: "focus.cancel", id: session.id });
  console.log(
    "PASS: authentication, origin validation, input validation, goal/habit persistence, idempotent check-ins, future-date rejection, habit editing/pausing, tasks, focus duration enforcement.",
  );
} finally {
  if (goalId) {
    await post({ action: "goal.delete", id: goalId });
    assert.ok(!(await read()).goals.some((g) => g.id === goalId));
  }
}
