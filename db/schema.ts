import {
  integer,
  sqliteTable,
  text,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
export const goals = sqliteTable(
  "goals",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    why: text("why").notNull().default(""),
    color: text("color").notNull().default("sage"),
    created: text("created").notNull(),
  },
  (t) => [index("goals_owner").on(t.owner)],
);
export const habits = sqliteTable(
  "habits",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    goal: text("goal")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    milestone: text("milestone").notNull(),
    name: text("name").notNull(),
    days: text("days").notNull(),
    time: text("time").notNull().default(""),
    created: text("created").notNull(),
    archived: integer("archived").notNull().default(0),
  },
  (t) => [index("habits_owner").on(t.owner)],
);
export const logs = sqliteTable(
  "logs",
  {
    owner: text("owner").notNull(),
    habit: text("habit")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
  },
  (t) => [primaryKey({ columns: [t.owner, t.habit, t.date] })],
);
export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    date: text("date").notNull(),
    priority: text("priority").notNull(),
    done: integer("done").notNull().default(0),
  },
  (t) => [index("tasks_owner").on(t.owner)],
);
export const journals = sqliteTable(
  "journals",
  {
    owner: text("owner").notNull(),
    date: text("date").notNull(),
    mood: integer("mood").notNull(),
    body: text("body").notNull(),
  },
  (t) => [primaryKey({ columns: [t.owner, t.date] })],
);
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    started: integer("started").notNull(),
    minutes: integer("minutes").notNull(),
    date: text("date").notNull(),
    finished: integer("finished").notNull().default(0),
  },
  (t) => [index("sessions_owner").on(t.owner)],
);
export const profiles = sqliteTable("profiles", {
  owner: text("owner").primaryKey(),
  name: text("name").notNull(),
  pot: text("pot").notNull().default("clay"),
  plant: text("plant").notNull().default("cosmos"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
});
export const circles = sqliteTable("circles", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  created: text("created").notNull(),
});
export const members = sqliteTable(
  "members",
  {
    circle: text("circle")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    owner: text("owner").notNull(),
  },
  (t) => [primaryKey({ columns: [t.circle, t.owner] })],
);
