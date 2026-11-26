import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { z } from "zod";
import { dayKey, scheduled } from "../../../lib/domain";
export const dynamic = "force-dynamic";
const name = z.string().trim().min(1).max(160),
  id = z.string().uuid();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
  );
const days = z.array(z.number().int().min(0).max(6)).min(1).max(7);
const time = z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/);
const habitInput = z.object({ name, milestone: name, days, time });
const action = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("goal.create"),
    name,
    why: z.string().max(1000),
    color: z.enum(["sage", "rose", "lavender", "gold"]),
    habits: z.array(habitInput).min(1).max(20),
  }),
  z.object({
    action: z.literal("goal.edit"),
    id,
    name,
    why: z.string().max(1000),
  }),
  z.object({ action: z.literal("goal.delete"), id }),
  z.object({ action: z.literal("habit.create"), goal: id }).merge(habitInput),
  z.object({ action: z.literal("habit.edit"), id }).merge(habitInput),
  z.object({ action: z.literal("habit.archive"), id, archived: z.boolean() }),
  z.object({ action: z.literal("habit.check"), id, date, done: z.boolean() }),
  z.object({
    action: z.literal("task.create"),
    name,
    date,
    priority: z.enum(["low", "normal", "high"]),
  }),
  z.object({ action: z.literal("task.check"), id, done: z.boolean() }),
  z.object({ action: z.literal("task.delete"), id }),
  z.object({
    action: z.literal("journal.save"),
    date,
    mood: z.number().int().min(1).max(5),
    body: z.string().max(10000),
  }),
  z.object({
    action: z.literal("focus.start"),
    minutes: z.number().int().min(1).max(120),
  }),
  z.object({ action: z.literal("focus.finish"), id }),
  z.object({ action: z.literal("focus.cancel"), id }),
  z.object({
    action: z.literal("profile.save"),
    name,
    pot: z.enum(["clay", "cream", "sage"]),
    plant: z.enum(["cosmos", "daisy", "lavender"]),
    timezone: z
      .string()
      .max(80)
      .refine((t) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: t });
          return true;
        } catch {
          return false;
        }
      }),
  }),
  z.object({ action: z.literal("circle.create"), name }),
  z.object({
    action: z.literal("circle.join"),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-F0-9]{12}$/),
  }),
  z.object({ action: z.literal("circle.leave"), id }),
]);
function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Please sign in to your garden." }, 401);
  const db = env.DB;
  if (!db) return json({ error: "Database is unavailable." }, 503);
  const u = user.userId;
  try {
    const queries = [
      "SELECT id,name,why,color,created FROM goals WHERE owner=? ORDER BY created,id",
      "SELECT id,goal,milestone,name,days,time,created,archived FROM habits WHERE owner=? ORDER BY created,id",
      "SELECT habit,date FROM logs WHERE owner=?",
      "SELECT id,name,date,priority,done FROM tasks WHERE owner=? ORDER BY date,id",
      "SELECT date,mood,body FROM journals WHERE owner=? ORDER BY date DESC",
      "SELECT id,started,minutes,date,finished FROM sessions WHERE owner=? ORDER BY started DESC",
      "SELECT name,pot,plant,timezone FROM profiles WHERE owner=?",
      "SELECT c.id,c.name,c.code FROM circles c JOIN members m ON c.id=m.circle WHERE m.owner=?",
    ];
    const results = await db.batch(queries.map((q) => db.prepare(q).bind(u)));
    const circles = await Promise.all(
      (results[7].results as { id: string; name: string; code: string }[]).map(
        async (c) => ({
          ...c,
          ranking: (
            await db
              .prepare(
                "SELECT COALESCE(p.name,'Gardener') AS name,COUNT(DISTINCT l.date) AS days FROM members m LEFT JOIN profiles p ON p.owner=m.owner LEFT JOIN logs l ON l.owner=m.owner AND l.date>= (SELECT created FROM circles WHERE id=m.circle) WHERE m.circle=? GROUP BY m.owner,p.name ORDER BY days DESC LIMIT 50",
              )
              .bind(c.id)
              .all()
          ).results,
        }),
      ),
    );
    return json({
      goals: results[0].results,
      habits: results[1].results,
      logs: results[2].results,
      tasks: results[3].results,
      journals: results[4].results,
      sessions: results[5].results,
      profile: results[6].results[0] ?? {
        name: user.fullName ?? user.email.split("@")[0],
        pot: "clay",
        plant: "cosmos",
        timezone: "Asia/Kolkata",
      },
      circles,
    });
  } catch (e) {
    console.error("Bloom read failed", e);
    return json(
      { error: "Your garden could not be loaded. Please retry." },
      500,
    );
  }
}
export async function POST(req: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Please sign in." }, 401);
  if (req.headers.get("origin") !== new URL(req.url).origin)
    return json({ error: "Invalid request origin." }, 403);
  if (Number(req.headers.get("content-length") ?? 0) > 40000)
    return json({ error: "Request too large." }, 413);
  const db = env.DB;
  if (!db) return json({ error: "Database is unavailable." }, 503);
  try {
    const body = await req.text();
    if (body.length > 40000) return json({ error: "Request too large." }, 413);
    const parsed = action.safeParse(JSON.parse(body));
    if (!parsed.success)
      return json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        400,
      );
    const a = parsed.data,
      u = user.userId;
    const profile = await db
      .prepare("SELECT timezone FROM profiles WHERE owner=?")
      .bind(u)
      .first<{ timezone: string }>();
    const today = dayKey(new Date(), profile?.timezone ?? "Asia/Kolkata");
    const q = (sql: string, ...args: (string | number)[]) =>
      db.prepare(sql).bind(...args);
    const own = async (table: "goals" | "habits" | "sessions", key: string) =>
      db
        .prepare(`SELECT * FROM ${table} WHERE id=? AND owner=?`)
        .bind(key, u)
        .first();
    switch (a.action) {
      case "goal.create": {
        const key = crypto.randomUUID();
        await db.batch([
          q(
            "INSERT INTO goals(id,owner,name,why,color,created) VALUES(?,?,?,?,?,?)",
            key,
            u,
            a.name,
            a.why,
            a.color,
            today,
          ),
          ...a.habits.map((h) =>
            q(
              "INSERT INTO habits(id,owner,goal,milestone,name,days,time,created) VALUES(?,?,?,?,?,?,?,?)",
              crypto.randomUUID(),
              u,
              key,
              h.milestone,
              h.name,
              [...new Set(h.days)].join(","),
              h.time,
              today,
            ),
          ),
        ]);
        break;
      }
      case "goal.edit":
        await q(
          "UPDATE goals SET name=?,why=? WHERE id=? AND owner=?",
          a.name,
          a.why,
          a.id,
          u,
        ).run();
        break;
      case "goal.delete":
        await q("DELETE FROM goals WHERE id=? AND owner=?", a.id, u).run();
        break;
      case "habit.create":
        if (!(await own("goals", a.goal)))
          return json({ error: "Goal not found." }, 404);
        await q(
          "INSERT INTO habits(id,owner,goal,milestone,name,days,time,created) VALUES(?,?,?,?,?,?,?,?)",
          crypto.randomUUID(),
          u,
          a.goal,
          a.milestone,
          a.name,
          a.days.join(","),
          a.time,
          today,
        ).run();
        break;
      case "habit.edit":
        await q(
          "UPDATE habits SET name=?,milestone=?,days=?,time=? WHERE id=? AND owner=?",
          a.name,
          a.milestone,
          a.days.join(","),
          a.time,
          a.id,
          u,
        ).run();
        break;
      case "habit.archive":
        await q(
          "UPDATE habits SET archived=? WHERE id=? AND owner=?",
          a.archived ? 1 : 0,
          a.id,
          u,
        ).run();
        break;
      case "habit.check": {
        const h = await own("habits", a.id);
        if (!h) return json({ error: "Habit not found." }, 404);
        if (a.date > today || a.date < String(h.created))
          return json(
            { error: "Choose a date between habit creation and today." },
            400,
          );
        if (
          a.done &&
          !scheduled(h as unknown as Parameters<typeof scheduled>[0], a.date)
        )
          return json(
            { error: "This habit is not scheduled for that day." },
            400,
          );
        await (
          a.done
            ? q(
                "INSERT OR IGNORE INTO logs(owner,habit,date) VALUES(?,?,?)",
                u,
                a.id,
                a.date,
              )
            : q(
                "DELETE FROM logs WHERE owner=? AND habit=? AND date=?",
                u,
                a.id,
                a.date,
              )
        ).run();
        break;
      }
      case "task.create":
        await q(
          "INSERT INTO tasks(id,owner,name,date,priority) VALUES(?,?,?,?,?)",
          crypto.randomUUID(),
          u,
          a.name,
          a.date,
          a.priority,
        ).run();
        break;
      case "task.check":
        await q(
          "UPDATE tasks SET done=? WHERE id=? AND owner=?",
          a.done ? 1 : 0,
          a.id,
          u,
        ).run();
        break;
      case "task.delete":
        await q("DELETE FROM tasks WHERE id=? AND owner=?", a.id, u).run();
        break;
      case "journal.save":
        if (a.date > today)
          return json(
            { error: "Reflections cannot be dated in the future." },
            400,
          );
        await q(
          "INSERT INTO journals(owner,date,mood,body) VALUES(?,?,?,?) ON CONFLICT(owner,date) DO UPDATE SET mood=excluded.mood,body=excluded.body",
          u,
          a.date,
          a.mood,
          a.body,
        ).run();
        break;
      case "focus.start": {
        const key = crypto.randomUUID();
        await db.batch([
          q("DELETE FROM sessions WHERE owner=? AND finished=0", u),
          q(
            "INSERT INTO sessions(id,owner,started,minutes,date) VALUES(?,?,?,?,?)",
            key,
            u,
            Date.now(),
            a.minutes,
            today,
          ),
        ]);
        break;
      }
      case "focus.finish": {
        const s = await own("sessions", a.id);
        if (!s) return json({ error: "Session not found." }, 404);
        if (Date.now() < Number(s.started) + Number(s.minutes) * 60000)
          return json(
            { error: "The focus session has not finished yet." },
            400,
          );
        await q(
          "UPDATE sessions SET finished=1 WHERE id=? AND owner=?",
          a.id,
          u,
        ).run();
        break;
      }
      case "focus.cancel":
        await q(
          "DELETE FROM sessions WHERE id=? AND owner=? AND finished=0",
          a.id,
          u,
        ).run();
        break;
      case "profile.save":
        await q(
          "INSERT INTO profiles(owner,name,pot,plant,timezone) VALUES(?,?,?,?,?) ON CONFLICT(owner) DO UPDATE SET name=excluded.name,pot=excluded.pot,plant=excluded.plant,timezone=excluded.timezone",
          u,
          a.name,
          a.pot,
          a.plant,
          a.timezone,
        ).run();
        break;
      case "circle.create": {
        const key = crypto.randomUUID(),
          code = crypto
            .randomUUID()
            .replaceAll("-", "")
            .slice(0, 12)
            .toUpperCase();
        await db.batch([
          q(
            "INSERT INTO circles(id,owner,name,code,created) VALUES(?,?,?,?,?)",
            key,
            u,
            a.name,
            code,
            today,
          ),
          q("INSERT INTO members(circle,owner) VALUES(?,?)", key, u),
        ]);
        break;
      }
      case "circle.join": {
        const c = await db
          .prepare("SELECT id FROM circles WHERE code=?")
          .bind(a.code)
          .first<{ id: string }>();
        if (!c)
          return json(
            { error: "No challenge matches that invitation code." },
            404,
          );
        await q(
          "INSERT OR IGNORE INTO members(circle,owner) VALUES(?,?)",
          c.id,
          u,
        ).run();
        break;
      }
      case "circle.leave":
        await q(
          "DELETE FROM members WHERE circle=? AND owner=?",
          a.id,
          u,
        ).run();
        break;
    }
    return json({ ok: true });
  } catch (e) {
    if (e instanceof SyntaxError) return json({ error: "Invalid JSON." }, 400);
    console.error("Bloom save failed", e);
    return json(
      { error: "Could not save your change. Please try again." },
      500,
    );
  }
}
