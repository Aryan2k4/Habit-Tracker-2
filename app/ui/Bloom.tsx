"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Leaf,
  Sun,
  Flower2,
  LayoutDashboard,
  Target,
  CalendarDays,
  Timer,
  BookOpen,
  Sparkles,
  Users,
  Settings,
  Plus,
  Check,
  Flame,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  Download,
  LogOut,
  Bell,
  Play,
  Square,
  RefreshCw,
  Heart,
  Wind,
  Search,
  X,
  Trophy,
  CheckCheck,
} from "lucide-react";
import Plant from "./Plant";
import Modal from "./Modal";
import {
  completion,
  dayKey,
  growth,
  insights,
  scheduled,
  shiftDay,
  streaks,
  type Snapshot,
  type Habit,
  type Goal,
} from "../../lib/domain";
type View =
  | "Today"
  | "Goals"
  | "Planner"
  | "Focus"
  | "Journal"
  | "Insights"
  | "Bloom AI"
  | "Challenges"
  | "Settings";
type Mutation = (payload: Record<string, unknown>) => Promise<boolean>;
const navigation = [
  { name: "Today", icon: LayoutDashboard },
  { name: "Goals", icon: Target },
  { name: "Planner", icon: CalendarDays },
  { name: "Focus", icon: Timer },
  { name: "Journal", icon: BookOpen },
  { name: "Insights", icon: Flower2 },
  { name: "Bloom AI", icon: Sparkles },
  { name: "Challenges", icon: Users },
] as const;
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const allDays = [0, 1, 2, 3, 4, 5, 6];
function download(name: string, body: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Leaf />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
function Label({ title, children }: { title: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{title}</span>
      {children}
    </label>
  );
}
function Week({ data, today }: { data: Snapshot; today: string }) {
  return (
    <div className="week-chart">
      {Array.from({ length: 7 }, (_, i) => {
        const d = shiftDay(today, i - 6),
          c = completion(data, d),
          pct = c.total ? (c.done / c.total) * 100 : 0;
        return (
          <div key={d} title={`${d}: ${c.done}/${c.total}`}>
            <div className="bar-track">
              <div
                className={i === 6 ? "bar current" : "bar"}
                style={{ height: `${pct}%` }}
              />
            </div>
            <small>
              {weekdays[new Date(d + "T12:00:00Z").getUTCDay()].slice(0, 1)}
            </small>
          </div>
        );
      })}
    </div>
  );
}
export default function Bloom({
  signedIn,
  signInUrl,
}: {
  signedIn: boolean;
  signInUrl: string;
}) {
  const [data, setData] = useState<Snapshot | null>(null),
    [view, setView] = useState<View>("Today"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [goalModal, setGoalModal] = useState(false),
    [editGoal, setEditGoal] = useState<Goal | null>(null),
    [habitModal, setHabitModal] = useState<{
      goal: string;
      habit?: Habit;
    } | null>(null),
    [confirm, setConfirm] = useState<{
      title: string;
      run: () => Promise<void>;
    } | null>(null),
    [water, setWater] = useState(false),
    [customize, setCustomize] = useState(false),
    [search, setSearch] = useState(""),
    [now, setNow] = useState(() => Date.now()),
    [notifications, setNotifications] = useState(false);
  const mutationLock = useRef(false),
    notificationsSent = useRef(new Set<string>());
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/bloom", { cache: "no-store" });
      const body = (await res.json()) as Snapshot & { error?: string };
      if (!res.ok) throw new Error(body.error);
      setData(body);
      setError("");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Bloom.");
      return false;
    }
  }, []);
  useEffect(() => {
    if (signedIn) void reload();
  }, [signedIn, reload]);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!water) return;
    const t = setTimeout(() => setWater(false), 2400);
    return () => clearTimeout(t);
  }, [water]);
  useEffect(() => {
    try {
      setNotifications(localStorage.getItem("bloom-reminders") === "on");
    } catch {}
  }, []);
  const today = dayKey(new Date(now), data?.profile.timezone ?? "Asia/Kolkata");
  useEffect(() => {
    if (
      !data ||
      !notifications ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: data.profile.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(now));
    for (const h of data.habits) {
      const key = h.id + today;
      if (
        !h.archived &&
        h.time === time &&
        scheduled(h, today) &&
        !data.logs.some((l) => l.habit === h.id && l.date === today) &&
        !notificationsSent.current.has(key)
      ) {
        notificationsSent.current.add(key);
        new Notification("A little time for growth", {
          body: h.name,
          icon: "/android-chrome-192x192.png",
          tag: key,
        });
      }
    }
  }, [now, data, notifications, today]);
  const mutate: Mutation = async (payload) => {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    try {
      const res = await fetch("/api/bloom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(result.error);
      const refreshed = await reload();
      if (refreshed) setToast("Saved to your garden");
      return refreshed;
    } catch (e) {
      setToast(
        e instanceof Error ? e.message : "Could not save. Please retry.",
      );
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };
  if (!signedIn)
    return (
      <div className="landing">
        <header>
          <a className="brand" href="/">
            <span>
              <Flower2 />
            </span>
            bloom<span className="brand-dot">.</span>
          </a>
          <a className="button secondary" href={signInUrl} target="_top">
            Sign in
          </a>
        </header>
        <main className="landing-hero">
          <div>
            <span className="eyebrow">
              <Leaf size={15} /> SMALL STEPS. REAL GROWTH.
            </span>
            <h1>
              Make room
              <br />
              for a little <em>growth.</em>
            </h1>
            <p>
              Your goals, everyday habits, and a garden that grows with you.
              Build a life you love, one small step at a time.
            </p>
            <a className="button" href={signInUrl} target="_top">
              Plant your first seed <Leaf size={18} />
            </a>
            <p className="fine">Your private space. Free to grow.</p>
          </div>
          <div className="landing-garden">
            <div className="garden-orbit" />
            <Plant stage={5} />
            <span className="floating-label">
              <Check size={16} /> Little habits. Beautiful progress.
            </span>
          </div>
        </main>
        <div className="landing-features">
          {[
            [
              "A purpose for every habit",
              "Connect small daily actions to the goals that matter.",
            ],
            [
              "Watch your effort bloom",
              "Your garden grows with every completed habit.",
            ],
            [
              "Find your own rhythm",
              "Plan, focus, reflect, and get thoughtful AI support.",
            ],
          ].map(([title, copy]) => (
            <article key={title}>
              <Leaf />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <div className="origin-photo">
          <img
            src="/android-chrome-512x512.png"
            alt="Bloom’s original photograph of a pink chrysanthemum"
          />
          <div>
            <span className="eyebrow">WHERE IT ALL BEGAN</span>
            <h3>A bloom worth keeping.</h3>
            <p>The original Bloom flower, still part of our growing story.</p>
          </div>
        </div>
        <footer>Built for everyday growth · Bloom by Aryan Goswami</footer>
      </div>
    );
  const progress = data ? completion(data, today) : { done: 0, total: 0 },
    streak = data
      ? streaks(
          data.logs.map((l) => l.date),
          today,
        )
      : { current: 0, best: 0 },
    grown = growth(data?.logs.length ?? 0);
  const habitRow = (h: Habit, date = today) => {
    if (!data) return null;
    const checked = data.logs.some((l) => l.habit === h.id && l.date === date),
      goal = data.goals.find((g) => g.id === h.goal);
    return (
      <div key={h.id} className={"habit-row " + (checked ? "completed" : "")}>
        <button
          className="check-button"
          aria-label={`${checked ? "Uncheck" : "Complete"} ${h.name}`}
          aria-pressed={checked}
          disabled={busy || date > today}
          onClick={async () => {
            if (
              (await mutate({
                action: "habit.check",
                id: h.id,
                date,
                done: !checked,
              })) &&
              !checked
            )
              setWater(true);
          }}
        >
          {checked && <Check size={17} />}
        </button>
        <span className={"habit-symbol " + (goal?.color ?? "sage")}>
          <Leaf size={19} />
        </span>
        <div className="habit-info">
          <strong>{h.name}</strong>
          <span>
            {goal?.name} <span className="separator">/</span> {h.milestone}
          </span>
        </div>
        {h.time && (
          <span className="habit-time">
            <Bell size={12} />
            {h.time}
          </span>
        )}
        <button
          className="icon-button"
          aria-label={`Edit ${h.name}`}
          onClick={() => setHabitModal({ goal: h.goal, habit: h })}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    );
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span>
            <Flower2 />
          </span>
          bloom<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">YOUR GROWING SPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              aria-label={name}
              className={view === name ? "nav-item active" : "nav-item"}
              onClick={() => {
                setView(name);
                setSearch("");
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Bloom AI" && <small>LOCAL</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <img
              src="/android-chrome-512x512.png"
              alt="Bloom’s original pink flower photograph"
              className="original-bloom-photo"
            />
            <Leaf size={21} />
            <p>
              Small steps.
              <br />
              <strong>Beautiful things.</strong>
            </p>
          </div>
          <button
            aria-label="Settings"
            className={"nav-item " + (view === "Settings" ? "active" : "")}
            onClick={() => setView("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <a
            aria-label="Sign out"
            className="nav-item"
            href="/signout-with-chatgpt?return_to=/"
            target="_top"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </a>
          <div className="profile-mini">
            <span className="avatar">
              {data?.profile.name.slice(0, 1).toUpperCase() ?? "B"}
            </span>
            <div>
              <strong>{data?.profile.name ?? "Your garden"}</strong>
              <small>Growing at your own pace</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            My space <span>/</span> <strong>{view}</strong>
          </div>
          <div className="top-actions">
            <span className="date-label">
              <CalendarDays size={16} />
              {new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: data?.profile.timezone ?? "Asia/Kolkata",
              }).format(new Date(now))}
            </span>
            <button
              className="icon-button"
              aria-label="Reminder settings"
              onClick={() => setView("Settings")}
            >
              <Bell size={19} />
            </button>
            <span className="avatar small">
              {data?.profile.name.slice(0, 1).toUpperCase() ?? "B"}
            </span>
          </div>
        </header>
        <main className="main-content" aria-busy={busy}>
          {error && (
            <div role="alert" className="error-banner">
              {error}
              <button onClick={() => void reload()}>
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}
          {!data && !error && (
            <div className="loading">
              <Flower2 className="spin" />
              <p>Preparing your garden…</p>
            </div>
          )}
          {data && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    <Sun size={15} />
                    {view === "Today"
                      ? "A FRESH CHANCE TO GROW"
                      : "GROW DAILY. BLOOM ENDLESSLY."}
                  </div>
                  <h1>
                    {view === "Today" ? (
                      <>
                        A little better, <em>every day.</em>
                      </>
                    ) : view === "Bloom AI" ? (
                      <>
                        A little guidance, <em>just for you.</em>
                      </>
                    ) : view === "Goals" ? (
                      <>
                        Big dreams. <em>Small steps.</em>
                      </>
                    ) : view === "Focus" ? (
                      <>
                        One thing, <em>at a time.</em>
                      </>
                    ) : view === "Journal" ? (
                      <>
                        Pause. Reflect. <em>Grow.</em>
                      </>
                    ) : view === "Planner" ? (
                      <>
                        Make space <em>for what matters.</em>
                      </>
                    ) : view === "Insights" ? (
                      <>
                        Look how far <em>you’ve grown.</em>
                      </>
                    ) : view === "Challenges" ? (
                      <>
                        Grow better, <em>together.</em>
                      </>
                    ) : (
                      <>
                        Make Bloom <em>your own.</em>
                      </>
                    )}
                  </h1>
                  <p>
                    {view === "Today"
                      ? `Welcome back, ${data.profile.name.split(" ")[0]}. Every small effort is a seed for tomorrow.`
                      : (
                          {
                            Goals:
                              "Give your daily habits a meaningful destination.",
                            Planner:
                              "Your habits and tasks, with a little breathing room.",
                            Focus:
                              "A quiet space for your next meaningful step.",
                            Journal:
                              "Notice the little things. They matter more than you think.",
                            Insights:
                              "An honest picture of your consistency over time.",
                            "Bloom AI":
                              "Private, on-device AI and a simple guided planner. No subscription needed.",
                            Challenges:
                              "Share consistency, keep your personal habits and reflections private.",
                            Settings:
                              "Your profile, garden, reminders, and data.",
                          } as Record<string, string>
                        )[view]}
                  </p>
                </div>
                {["Today", "Goals"].includes(view) && (
                  <button className="button" onClick={() => setGoalModal(true)}>
                    <Plus size={17} /> New goal
                  </button>
                )}
              </section>
              {view === "Today" && (
                <>
                  <div className="dashboard-grid">
                    <section className="garden-card">
                      <div className="garden-card-top">
                        <span className="pill">
                          <span className="live-dot" /> YOUR GARDEN
                        </span>
                        <button
                          className="text-button"
                          onClick={() => setCustomize(true)}
                        >
                          Customize <Pencil size={13} />
                        </button>
                      </div>
                      <div className="garden-layout">
                        <div className="garden-copy">
                          <h2>
                            A little care.
                            <br />A lot of <em>possibility.</em>
                          </h2>
                          <p>
                            {grown.stage === 0
                              ? "Your first seed is planted. Complete a habit and watch it come to life."
                              : "Your effort is taking root. Keep showing up, and let your garden do the growing."}
                          </p>
                          <div className="growth-stage">
                            <span className="stage-icon">
                              <Leaf size={20} />
                            </span>
                            <div>
                              <strong>{grown.label}</strong>
                              <small>
                                {grown.next
                                  ? `${grown.next - data.logs.length} check-ins to the next stage`
                                  : "Your garden is flourishing"}
                              </small>
                            </div>
                          </div>
                          <div className="growth-track">
                            <span
                              style={{
                                width: `${grown.next ? Math.min(100, (data.logs.length / grown.next) * 100) : 100}%`,
                              }}
                            />
                          </div>
                          <span className="fine">
                            Every completed habit helps your garden grow.
                          </span>
                        </div>
                        <div className="garden-scene">
                          <div className="garden-orbit" />
                          <Plant
                            stage={grown.stage}
                            pot={data.profile.pot}
                            plant={data.profile.plant}
                            water={water}
                          />
                          <button
                            className="garden-tag"
                            onClick={() => setWater(true)}
                          >
                            <Wind size={14} /> Take a breath
                          </button>
                        </div>
                      </div>
                      <div className="garden-card-bottom">
                        <Sun size={16} />
                        <span>
                          Progress, not perfection. You’re right where you need
                          to be.
                        </span>
                        <Heart size={15} />
                      </div>
                    </section>
                    <section className="today-card panel">
                      <div className="section-heading">
                        <h3>Today’s rhythm</h3>
                        <Sun size={19} />
                      </div>
                      <div
                        className="progress-circle"
                        style={{
                          background: `conic-gradient(var(--green) ${progress.total ? (progress.done / progress.total) * 360 : 0}deg, #edf0e8 0deg)`,
                        }}
                      >
                        <div>
                          <strong>
                            {progress.done}
                            <small>/{progress.total}</small>
                          </strong>
                          <span>habits complete</span>
                        </div>
                      </div>
                      <p className="rhythm-copy">
                        {progress.total && progress.done === progress.total
                          ? "A beautiful day of showing up."
                          : progress.done
                            ? "Your next small win is waiting."
                            : "A small start is still a start."}
                      </p>
                      <div className="rhythm-footer">
                        <span>
                          <Flame size={18} />
                          <strong>{streak.current}</strong> day streak
                        </span>
                        <span>
                          <Trophy size={17} />
                          {streak.best} best
                        </span>
                      </div>
                    </section>
                  </div>
                  <div className="below-grid">
                    <section className="panel habits-panel">
                      <div className="section-heading">
                        <div>
                          <h2>
                            Your daily habits{" "}
                            <span className="count">{progress.total}</span>
                          </h2>
                          <p>Small actions. Meaningful change.</p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => setView("Planner")}
                        >
                          View calendar <CalendarDays size={15} />
                        </button>
                      </div>
                      <div className="habit-toolbar">
                        <span className="tab-pill">Today</span>
                        <label className="search">
                          <Search size={15} />
                          <input
                            aria-label="Search habits"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find a habit…"
                          />
                        </label>
                      </div>
                      {data.habits
                        .filter(
                          (h) =>
                            !h.archived &&
                            scheduled(h, today) &&
                            h.name.toLowerCase().includes(search.toLowerCase()),
                        )
                        .map((h) => habitRow(h))}
                      {!data.habits.some(
                        (h) => !h.archived && scheduled(h, today),
                      ) && (
                        <Empty
                          title={
                            data.habits.length
                              ? "A little breathing room"
                              : "Your first small step"
                          }
                          action={
                            <button
                              className="button secondary"
                              onClick={() => setGoalModal(true)}
                            >
                              <Plus size={16} /> Plant a goal
                            </button>
                          }
                        >
                          {data.habits.length
                            ? "No habits scheduled for today. Enjoy your rest or plan something new."
                            : "Create a goal and choose a small habit to bring it closer."}
                        </Empty>
                      )}
                      <button
                        className="add-habit-line"
                        onClick={() =>
                          data.goals.length
                            ? setHabitModal({ goal: data.goals[0].id })
                            : setGoalModal(true)
                        }
                      >
                        <Plus size={17} /> Add a habit
                      </button>
                    </section>
                    <div className="right-stack">
                      <section className="panel">
                        <div className="section-heading">
                          <h3>This week</h3>
                          <span className="fine">Last 7 days</span>
                        </div>
                        <Week data={data} today={today} />
                        <p className="fine chart-note">
                          Every check-in is a little win.
                        </p>
                      </section>
                      <section className="coach-card">
                        <span className="coach-icon">
                          <Sparkles size={21} />
                        </span>
                        <h3>A moment of perspective</h3>
                        <p>{insights(data, today)}</p>
                        <button
                          className="text-button"
                          onClick={() => setView("Bloom AI")}
                        >
                          Meet your growth companion <Sparkles size={14} />
                        </button>
                      </section>
                    </div>
                  </div>
                </>
              )}
              {view === "Goals" && (
                <div className="goals-grid">
                  {data.goals.map((g) => {
                    const hs = data.habits.filter((h) => h.goal === g.id),
                      active = hs.filter((h) => !h.archived),
                      done = data.logs.filter((l) =>
                        hs.some((h) => h.id === l.habit),
                      ).length;
                    return (
                      <article
                        className={"panel goal-panel " + g.color}
                        key={g.id}
                      >
                        <div className="section-heading">
                          <span className="goal-icon">
                            <Target />
                          </span>
                          <div className="inline-actions">
                            <button
                              className="icon-button"
                              aria-label={`Edit goal ${g.name}`}
                              onClick={() => setEditGoal(g)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-button"
                              aria-label={`Delete goal ${g.name}`}
                              onClick={() =>
                                setConfirm({
                                  title: `Delete “${g.name}” and all its habits and history?`,
                                  run: async () => {
                                    await mutate({
                                      action: "goal.delete",
                                      id: g.id,
                                    });
                                  },
                                })
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h2>{g.name}</h2>
                        <p>{g.why || "One small action brings you closer."}</p>
                        <div className="goal-meta">
                          <span>{active.length} active habits</span>
                          <span>{done} check-ins</span>
                        </div>
                        {[...new Set(hs.map((h) => h.milestone))].map((m) => (
                          <div className="milestone" key={m}>
                            <h4>{m}</h4>
                            {hs
                              .filter((h) => h.milestone === m)
                              .map((h) => (
                                <button
                                  key={h.id}
                                  className={
                                    "milestone-habit " +
                                    (h.archived ? "archived" : "")
                                  }
                                  onClick={() =>
                                    setHabitModal({ goal: g.id, habit: h })
                                  }
                                >
                                  <Leaf size={14} />
                                  <span>
                                    {h.name}
                                    {h.archived ? " (paused)" : ""}
                                  </span>
                                  <Pencil size={12} />
                                </button>
                              ))}
                          </div>
                        ))}
                        <button
                          className="add-habit-line"
                          onClick={() => setHabitModal({ goal: g.id })}
                        >
                          <Plus size={16} /> Add habit
                        </button>
                      </article>
                    );
                  })}
                  <button
                    className="new-goal-card"
                    onClick={() => setGoalModal(true)}
                  >
                    <Plus size={28} />
                    <h3>Plant a new goal</h3>
                    <p>What would you like to grow?</p>
                  </button>
                </div>
              )}
              {view === "Planner" && (
                <Planner
                  data={data}
                  today={today}
                  mutate={mutate}
                  busy={busy}
                  habitRow={habitRow}
                />
              )}
              {view === "Focus" && (
                <Focus data={data} now={now} mutate={mutate} busy={busy} />
              )}
              {view === "Journal" && (
                <Journal
                  data={data}
                  today={today}
                  mutate={mutate}
                  busy={busy}
                />
              )}
              {view === "Insights" && <Insights data={data} today={today} />}
              {view === "Bloom AI" && (
                <AI
                  data={data}
                  today={today}
                  create={() => setGoalModal(true)}
                />
              )}
              {view === "Challenges" && (
                <Challenges data={data} mutate={mutate} busy={busy} />
              )}
              {view === "Settings" && (
                <SettingsPanel
                  data={data}
                  mutate={mutate}
                  busy={busy}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  customize={() => setCustomize(true)}
                  toast={setToast}
                />
              )}
              <footer className="app-footer">
                <Flower2 size={15} /> Grow daily. Bloom endlessly.
                <span>Made with intention · Bloom</span>
              </footer>
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Leaf size={17} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {goalModal && (
        <GoalForm
          busy={busy}
          mutate={mutate}
          close={() => setGoalModal(false)}
        />
      )}
      {editGoal && (
        <EditGoal
          goal={editGoal}
          mutate={mutate}
          busy={busy}
          close={() => setEditGoal(null)}
        />
      )}
      {habitModal && data && (
        <HabitForm
          data={data}
          value={habitModal}
          busy={busy}
          mutate={mutate}
          close={() => setHabitModal(null)}
        />
      )}
      {customize && data && (
        <GardenForm
          data={data}
          mutate={mutate}
          busy={busy}
          close={() => setCustomize(false)}
        />
      )}
      {confirm && (
        <Modal title="A fresh start?" close={() => setConfirm(null)}>
          <p>{confirm.title}</p>
          <p className="fine">
            This cannot be undone. You can export your data in Settings first.
          </p>
          <div className="form-actions">
            <button
              className="button secondary"
              onClick={() => setConfirm(null)}
            >
              Keep it
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={async () => {
                await confirm.run();
                setConfirm(null);
              }}
            >
              Delete goal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function GoalForm({
  mutate,
  busy,
  close,
}: {
  mutate: Mutation;
  busy: boolean;
  close: () => void;
}) {
  const [name, setName] = useState(""),
    [why, setWhy] = useState(""),
    [color, setColor] = useState("sage"),
    [habits, setHabits] = useState([
      { name: "", milestone: "Getting started", days: allDays, time: "" },
    ]);
  return (
    <Modal title="Plant a new goal" close={close}>
      <p className="muted">
        Start with something meaningful, then make the first step small.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (await mutate({ action: "goal.create", name, why, color, habits }))
            close();
        }}
      >
        <Label title="What would you like to achieve?">
          <input
            autoFocus
            required
            maxLength={160}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Build a healthier routine"
          />
        </Label>
        <Label title="Why does it matter to you?">
          <textarea
            maxLength={1000}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="A little reminder for the days motivation feels far away"
          />
        </Label>
        <Label title="Goal color">
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            {["sage", "rose", "lavender", "gold"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Label>
        <h3>Your small steps</h3>
        {habits.map((h, i) => (
          <div className="form-habit" key={i}>
            <Label title={`Habit ${i + 1}`}>
              <input
                required
                maxLength={160}
                value={h.name}
                onChange={(e) =>
                  setHabits(
                    habits.map((v, j) =>
                      i === j ? { ...v, name: e.target.value } : v,
                    ),
                  )
                }
                placeholder="e.g. Walk outside for 10 minutes"
              />
            </Label>
            <Label title="Milestone / sub-goal">
              <input
                required
                maxLength={160}
                value={h.milestone}
                onChange={(e) =>
                  setHabits(
                    habits.map((v, j) =>
                      i === j ? { ...v, milestone: e.target.value } : v,
                    ),
                  )
                }
              />
            </Label>
            <DayPicker
              selected={h.days}
              change={(days) =>
                setHabits(habits.map((v, j) => (i === j ? { ...v, days } : v)))
              }
            />
            {habits.length > 1 && (
              <button
                type="button"
                className="text-button"
                onClick={() => setHabits(habits.filter((_, j) => i !== j))}
              >
                Remove step
              </button>
            )}
          </div>
        ))}
        {habits.length < 10 && (
          <button
            type="button"
            className="text-button"
            onClick={() =>
              setHabits([
                ...habits,
                {
                  name: "",
                  milestone: "Getting started",
                  days: allDays,
                  time: "",
                },
              ])
            }
          >
            <Plus size={16} />
            Add a step
          </button>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={close}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            {busy ? "Planting…" : "Plant this goal"}
            <Leaf size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function DayPicker({
  selected,
  change,
}: {
  selected: number[];
  change: (days: number[]) => void;
}) {
  return (
    <div className="day-picker" role="group" aria-label="Scheduled days">
      {weekdays.map((d, i) => (
        <button
          key={d}
          type="button"
          className={selected.includes(i) ? "selected" : ""}
          aria-pressed={selected.includes(i)}
          onClick={() => {
            if (selected.includes(i)) {
              if (selected.length > 1) change(selected.filter((v) => v !== i));
            } else change([...selected, i]);
          }}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
function EditGoal({
  goal,
  mutate,
  busy,
  close,
}: {
  goal: Goal;
  mutate: Mutation;
  busy: boolean;
  close: () => void;
}) {
  return (
    <Modal title="Give your goal some care" close={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate({
              action: "goal.edit",
              id: goal.id,
              name: f.get("name"),
              why: f.get("why"),
            })
          )
            close();
        }}
      >
        <Label title="Goal">
          <input
            name="name"
            required
            defaultValue={goal.name}
            maxLength={160}
          />
        </Label>
        <Label title="Why it matters">
          <textarea name="why" defaultValue={goal.why} maxLength={1000} />
        </Label>
        <button className="button" disabled={busy}>
          Save changes
        </button>
      </form>
    </Modal>
  );
}
function HabitForm({
  data,
  value,
  mutate,
  busy,
  close,
}: {
  data: Snapshot;
  value: { goal: string; habit?: Habit };
  mutate: Mutation;
  busy: boolean;
  close: () => void;
}) {
  const h = value.habit;
  const [days, setDays] = useState(h ? h.days.split(",").map(Number) : allDays);
  return (
    <Modal title={h ? "Care for this habit" : "A new daily step"} close={close}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate({
              action: h ? "habit.edit" : "habit.create",
              ...(h ? { id: h.id } : { goal: f.get("goal") }),
              name: f.get("name"),
              milestone: f.get("milestone"),
              time: f.get("time"),
              days,
            })
          )
            close();
        }}
      >
        {!h && (
          <Label title="Goal">
            <select name="goal" defaultValue={value.goal}>
              {data.goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Label>
        )}
        <Label title="Habit">
          <input
            autoFocus
            name="name"
            required
            maxLength={160}
            defaultValue={h?.name}
            placeholder="A small, specific action"
          />
        </Label>
        <Label title="Milestone / sub-goal">
          <input
            name="milestone"
            required
            maxLength={160}
            defaultValue={h?.milestone ?? "Getting started"}
          />
        </Label>
        <Label title="Reminder time (optional)">
          <input name="time" type="time" defaultValue={h?.time} />
        </Label>
        <p className="fine">
          Reminders appear while Bloom is open and notifications are enabled.
          Export to your calendar for reminders when it’s closed.
        </p>
        <DayPicker selected={days} change={setDays} />
        {h && (
          <p className="fine">
            Schedule changes affect how past completion percentages are
            calculated. Existing check-ins are kept.
          </p>
        )}
        <div className="form-actions">
          {h && (
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={async () => {
                if (
                  await mutate({
                    action: "habit.archive",
                    id: h.id,
                    archived: !h.archived,
                  })
                )
                  close();
              }}
            >
              {h.archived ? "Resume habit" : "Pause habit"}
            </button>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save habit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function GardenForm({
  data,
  mutate,
  busy,
  close,
}: {
  data: Snapshot;
  mutate: Mutation;
  busy: boolean;
  close: () => void;
}) {
  const [pot, setPot] = useState(data.profile.pot),
    [plant, setPlant] = useState(data.profile.plant);
  return (
    <Modal title="A garden that feels like you" close={close}>
      <div className="plant-preview">
        <Plant
          stage={Math.max(4, growth(data.logs.length).stage)}
          pot={pot}
          plant={plant}
        />
      </div>
      <p className="fine">
        Preview shown in bloom. Your garden’s actual stage follows your
        check-ins.
      </p>
      <Label title="Your pot">
        <select value={pot} onChange={(e) => setPot(e.target.value)}>
          <option value="clay">Warm terracotta</option>
          <option value="cream">Soft cream</option>
          <option value="sage">Sage ceramic</option>
        </select>
      </Label>
      <Label title="Your flower">
        <select value={plant} onChange={(e) => setPlant(e.target.value)}>
          <option value="cosmos">Blush cosmos</option>
          <option value="daisy">Cream daisy</option>
          <option value="lavender">Lavender petals</option>
        </select>
      </Label>
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          if (
            await mutate({
              action: "profile.save",
              ...data.profile,
              pot,
              plant,
            })
          )
            close();
        }}
      >
        Make it mine
      </button>
    </Modal>
  );
}
function Planner({
  data,
  today,
  mutate,
  busy,
  habitRow,
}: {
  data: Snapshot;
  today: string;
  mutate: Mutation;
  busy: boolean;
  habitRow: (h: Habit, date: string) => ReactNode;
}) {
  const [selected, setSelected] = useState(today),
    [month, setMonth] = useState(today.slice(0, 7));
  const start = month + "-01",
    offset = new Date(start + "T12:00:00Z").getUTCDay(),
    length = new Date(
      Number(month.slice(0, 4)),
      Number(month.slice(5)),
      0,
    ).getDate();
  return (
    <div className="planner-grid">
      <section className="panel calendar-panel">
        <div className="section-heading">
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => setMonth(shiftDay(start, -1).slice(0, 7))}
          >
            <ChevronLeft />
          </button>
          <h2>
            {new Date(start + "T12:00:00Z").toLocaleDateString("en", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </h2>
          <button
            className="icon-button"
            aria-label="Next month"
            onClick={() => setMonth(shiftDay(start, 32).slice(0, 7))}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="calendar-grid">
          {weekdays.map((d) => (
            <strong key={d}>{d}</strong>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={"blank" + i} />
          ))}
          {Array.from({ length }, (_, i) => {
            const d = month + "-" + String(i + 1).padStart(2, "0"),
              c = completion(data, d);
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={
                  (selected === d ? "selected " : "") +
                  (d === today ? "is-today " : "")
                }
                aria-label={`${d}, ${c.done} completed habits`}
              >
                <span>{i + 1}</span>
                <small>
                  {c.done > 0
                    ? "•"
                    : data.tasks.some((t) => t.date === d && !t.done)
                      ? "·"
                      : ""}
                </small>
              </button>
            );
          })}
        </div>
        <p className="fine">Select a day to review habits or plan tasks.</p>
        <button
          className="text-button"
          onClick={() => {
            setSelected(today);
            setMonth(today.slice(0, 7));
          }}
        >
          Back to today
        </button>
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>{selected === today ? "Today" : selected}</h2>
          <span className="pill">
            {completion(data, selected).done} check-ins
          </span>
        </div>
        <h3 className="subheading">Scheduled habits</h3>
        {data.habits
          .filter((h) => !h.archived && scheduled(h, selected))
          .map((h) => habitRow(h, selected))}
        {!data.habits.some((h) => !h.archived && scheduled(h, selected)) && (
          <p className="muted">No habits scheduled for this day.</p>
        )}
        <h3 className="subheading">Things to do</h3>
        {data.tasks
          .filter((t) => t.date === selected)
          .map((t) => (
            <div
              className={"task-row " + (t.done ? "completed" : "")}
              key={t.id}
            >
              <button
                className="check-button"
                disabled={busy}
                aria-label={`${t.done ? "Uncheck" : "Complete"} task ${t.name}`}
                onClick={() =>
                  void mutate({ action: "task.check", id: t.id, done: !t.done })
                }
              >
                {!!t.done && <Check size={16} />}
              </button>
              <span>{t.name}</span>
              <small className={"priority " + t.priority}>{t.priority}</small>
              <button
                className="icon-button"
                disabled={busy}
                aria-label={`Delete task ${t.name}`}
                onClick={() => void mutate({ action: "task.delete", id: t.id })}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        <form
          className="task-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              f = new FormData(form);
            if (
              await mutate({
                action: "task.create",
                name: f.get("name"),
                date: selected,
                priority: f.get("priority"),
              })
            )
              form.reset();
          }}
        >
          <input
            name="name"
            required
            maxLength={160}
            placeholder="Add a task for this day…"
            aria-label="Task name"
          />
          <select
            name="priority"
            aria-label="Task priority"
            defaultValue="normal"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
          <button className="button" disabled={busy} aria-label="Add task">
            <Plus size={17} />
          </button>
        </form>
      </section>
    </div>
  );
}
function Focus({
  data,
  now,
  mutate,
  busy,
}: {
  data: Snapshot;
  now: number;
  mutate: Mutation;
  busy: boolean;
}) {
  const [minutes, setMinutes] = useState(25);
  const session = data.sessions.find((s) => !s.finished);
  const remaining = session
    ? Math.max(
        0,
        Math.ceil((session.started + session.minutes * 60000 - now) / 1000),
      )
    : minutes * 60;
  return (
    <div className="focus-layout">
      <section className="panel focus-panel">
        <span className="eyebrow">
          <Leaf size={15} /> A QUIET MOMENT FOR YOU
        </span>
        <h2>Let your attention take root.</h2>
        <div className="timer-display">
          {String(Math.floor(remaining / 60)).padStart(2, "0")}
          <span>:</span>
          {String(remaining % 60).padStart(2, "0")}
        </div>
        <p>
          {session
            ? remaining
              ? "One step. One breath. One thing at a time."
              : "Well done. Save this session to your journey."
            : "Choose a duration, settle in, and begin."}
        </p>
        {!session && (
          <div className="duration-options">
            {[15, 25, 45, 60].map((n) => (
              <button
                key={n}
                className={minutes === n ? "selected" : ""}
                onClick={() => setMinutes(n)}
              >
                {n} min
              </button>
            ))}
          </div>
        )}
        <div className="timer-actions">
          {session ? (
            <>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  void mutate({ action: "focus.cancel", id: session.id })
                }
              >
                <Square size={16} /> End without saving
              </button>
              {remaining === 0 && (
                <button
                  className="button"
                  disabled={busy}
                  onClick={() =>
                    void mutate({ action: "focus.finish", id: session.id })
                  }
                >
                  <Check size={17} />
                  Save session
                </button>
              )}
            </>
          ) : (
            <button
              className="button"
              disabled={busy}
              onClick={() => void mutate({ action: "focus.start", minutes })}
            >
              <Play size={17} /> Begin focus
            </button>
          )}
        </div>
        <div className="focus-decoration">
          <Plant stage={2} pot={data.profile.pot} />
        </div>
      </section>
      <section className="panel">
        <h2>Your focused moments</h2>
        <div className="large-stat">
          {data.sessions
            .filter((s) => s.finished)
            .reduce((n, s) => n + s.minutes, 0)}
          <small> minutes of intention</small>
        </div>
        {data.sessions
          .filter((s) => s.finished)
          .slice(0, 12)
          .map((s) => (
            <div className="history-row" key={s.id}>
              <Timer size={18} />
              <strong>{s.minutes} minutes</strong>
              <span>{s.date}</span>
            </div>
          ))}
        {!data.sessions.some((s) => s.finished) && (
          <p className="muted">Your completed sessions will grow here.</p>
        )}
        <p className="fine">
          The timer keeps its place when you refresh. Save a completed session
          to record it.
        </p>
      </section>
    </div>
  );
}
function Journal({
  data,
  today,
  mutate,
  busy,
}: {
  data: Snapshot;
  today: string;
  mutate: Mutation;
  busy: boolean;
}) {
  const [date, setDate] = useState(today),
    [mood, setMood] = useState(3),
    [body, setBody] = useState("");
  useEffect(() => {
    const j = data.journals.find((j) => j.date === date);
    setMood(j?.mood ?? 3);
    setBody(j?.body ?? "");
  }, [date, data.journals]);
  return (
    <div className="journal-grid">
      <section className="panel">
        <div className="section-heading">
          <h2>A note to yourself</h2>
          <input
            type="date"
            aria-label="Reflection date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <p>How are you arriving today?</p>
        <div className="mood-picker">
          {["Difficult", "Low", "Okay", "Good", "Wonderful"].map((label, i) => (
            <button
              key={label}
              className={mood === i + 1 ? "selected" : ""}
              aria-pressed={mood === i + 1}
              onClick={() => setMood(i + 1)}
            >
              <span>{["☁", "☂", "◒", "☀", "✿"][i]}</span>
              {label}
            </button>
          ))}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await mutate({ action: "journal.save", date, mood, body });
          }}
        >
          <Label title="What’s on your mind?">
            <textarea
              className="journal-text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={10000}
              placeholder="What went well? What felt hard? What is one thing you’re grateful for?"
            />
          </Label>
          <div className="form-actions">
            <span className="fine">Only you can read your reflections.</span>
            <button className="button" disabled={busy || !date}>
              Save reflection
            </button>
          </div>
        </form>
      </section>
      <section className="panel">
        <h2>Pages of your journey</h2>
        {data.journals.map((j) => (
          <button
            className="journal-entry"
            key={j.date}
            onClick={() => setDate(j.date)}
          >
            <span>{["☁", "☂", "◒", "☀", "✿"][j.mood - 1]}</span>
            <div>
              <strong>{j.date}</strong>
              <p>{j.body || "A quiet check-in."}</p>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
        {!data.journals.length && (
          <Empty title="A story only you can write">
            Your reflections will appear here.
          </Empty>
        )}
      </section>
    </div>
  );
}
function Insights({ data, today }: { data: Snapshot; today: string }) {
  const st = streaks(
    data.logs.map((l) => l.date),
    today,
  );
  return (
    <>
      <div className="stat-grid">
        {[
          [data.logs.length, "Habit check-ins"],
          [st.current, "Current activity streak"],
          [st.best, "Longest activity streak"],
          [data.journals.length, "Moments of reflection"],
        ].map(([value, label]) => (
          <section className="panel stat" key={String(label)}>
            <Leaf size={20} />
            <strong>{value}</strong>
            <span>{label}</span>
          </section>
        ))}
      </div>
      <div className="below-grid">
        <section className="panel">
          <h2>Your last 12 weeks</h2>
          <p className="muted">
            Each square is a day. Deeper green means more scheduled habits
            completed.
          </p>
          <div className="heatmap">
            {Array.from({ length: 84 }, (_, i) => {
              const d = shiftDay(today, i - 83),
                c = completion(data, d);
              return (
                <div
                  key={d}
                  title={`${d}: ${c.done}/${c.total}`}
                  style={{
                    background: c.done
                      ? `rgba(76,119,82,${0.25 + 0.75 * (c.total ? c.done / c.total : 1)})`
                      : "#edf0e8",
                  }}
                />
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            {[0.15, 0.4, 0.7, 1].map((n) => (
              <i key={n} style={{ background: `rgba(76,119,82,${n})` }} />
            ))}
            <span>More</span>
          </div>
          <h3 className="subheading">A little perspective</h3>
          <p>{insights(data, today)}</p>
          <p className="fine">
            Activity streaks count consecutive calendar days with at least one
            check-in. Paused habits are excluded from completion percentages;
            schedule edits recalculate historical percentages.
          </p>
        </section>
        <section className="panel">
          <h2>Weekly rhythm</h2>
          <Week data={data} today={today} />
          <h3 className="subheading">Milestones to celebrate</h3>
          {[
            [1, "First seed"],
            [8, "Taking root"],
            [20, "Growing stronger"],
            [40, "In full bloom"],
            [75, "Flourishing"],
          ].map(([n, label]) => (
            <div
              className={
                "achievement " + (data.logs.length >= Number(n) ? "earned" : "")
              }
              key={n}
            >
              <Trophy size={19} />
              <span>{label}</span>
              <small>{n} check-ins</small>
              {data.logs.length >= Number(n) && <Check size={15} />}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
function AI({
  data,
  today,
  create,
}: {
  data: Snapshot;
  today: string;
  create: () => void;
}) {
  const [loading, setLoading] = useState(false),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState(""),
    [prompt, setPrompt] = useState(""),
    [answer, setAnswer] = useState("");
  const [goal, setGoal] = useState(""),
    [plan, setPlan] = useState(false);
  useEffect(() => () => { void import('../../lib/ai').then(ai => ai.stopAI()); }, []);
  return (
    <div className="ai-grid">
      <section className="panel ai-panel">
        <span className="coach-icon">
          <Sparkles />
        </span>
        <h2>Your private growth companion</h2>
        <p>
          Think through a goal, simplify a routine, or reflect on your week. AI
          runs on your device; your prompts aren’t sent to an AI service.
        </p>
        <div className="ai-notice">
          <strong>
            {ready ? "Local AI is ready" : "Optional model download"}
          </strong>
          <p>
            Requires a WebGPU-capable browser and a model download of several
            hundred MB. It may take a few minutes and uses your device’s memory.
            The guided planner beside it works without a download.
          </p>
          {!ready && (
            <button
              className="button secondary"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const ai = await import("../../lib/ai");
                  await ai.loadAI(setStatus);
                  setReady(true);
                  setStatus("Ready. What would you like to work on?");
                } catch (e) {
                  setStatus(
                    e instanceof Error
                      ? e.message
                      : "AI could not load. Try the guided planner.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Loading model…" : "Enable free local AI"}
              <Download size={15} />
            </button>
          )}
          {(loading || ready) && <button className="text-button" onClick={async()=>{const ai=await import('../../lib/ai');ai.stopAI();setReady(false);setLoading(false);setStatus('Local AI stopped. Your garden is still ready to use.');}}><Square size={14}/>Stop local AI</button>}
        </div>
        {status && (
          <p className="fine" role="status">
            {status}
          </p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const ai = await import("../../lib/ai");
              setAnswer(
                await ai.askAI(
                  `User question: ${prompt}\nActual aggregate progress (no private journal text): ${insights(data, today)}`,
                ),
              );
            } catch (e) {
              setReady(false);
              setStatus(e instanceof Error ? e.message : "Unable to generate.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Label title="What would you like help with?">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={1500}
              placeholder="I want to read more, but I struggle to find time…"
            />
          </Label>
          <div className="prompt-chips">
            {[
              "Help me make my routine easier",
              "Reflect on my week",
              "Suggest a two-minute starting habit",
            ].map((s) => (
              <button type="button" key={s} onClick={() => setPrompt(s)}>
                {s}
              </button>
            ))}
          </div>
          <button
            className="button"
            disabled={!ready || loading || !prompt.trim()}
          >
            <Sparkles size={16} />
            {loading ? "Thinking…" : "Ask Bloom"}
          </button>
        </form>
        {answer && (
          <div className="ai-answer">
            <span className="eyebrow">BLOOM’S SUGGESTION</span>
            <p>{answer}</p>
            <p className="fine">
              AI can be mistaken. Choose what fits your life.
            </p>
            <button className="text-button" onClick={create}>
              Create a goal from your idea <Plus size={15} />
            </button>
          </div>
        )}
      </section>
      <section className="panel">
        <span className="pill">ALWAYS AVAILABLE</span>
        <h2 className="subheading">The small-step planner</h2>
        <p className="muted">
          A guided framework, not AI. Turn a meaningful goal into a manageable
          routine.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPlan(true);
          }}
        >
          <Label title="My goal is…">
            <input
              required
              maxLength={160}
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                setPlan(false);
              }}
              placeholder="Learn to draw"
            />
          </Label>
          <button className="button secondary">Build a starting plan</button>
        </form>
        {plan && (
          <div className="guided-plan">
            <h3>{goal}</h3>
            <ol>
              <li>
                <strong>Make the start tiny.</strong> Choose one action you can
                do in two minutes toward this goal.
              </li>
              <li>
                <strong>Give it a home.</strong> Pick three realistic days and
                attach it to an existing routine.
              </li>
              <li>
                <strong>Remove one obstacle.</strong> Prepare what you need the
                night before.
              </li>
              <li>
                <strong>Review after seven days.</strong> Keep what worked. Make
                the difficult part smaller.
              </li>
            </ol>
            <button className="button" onClick={create}>
              Turn this into a goal <Leaf size={15} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
function Challenges({
  data,
  mutate,
  busy,
}: {
  data: Snapshot;
  mutate: Mutation;
  busy: boolean;
}) {
  return (
    <>
      <div className="challenge-intro panel">
        <Users size={28} />
        <div>
          <h2>A little shared encouragement</h2>
          <p>
            Invite friends with a private code. Members see display names and
            active-day totals since the challenge began. Your habits, goals, and
            journal stay private.
          </p>
          <p className="fine">
            Friends must also have access to this hosted site. Site access is
            managed separately from invitation codes.
          </p>
        </div>
      </div>
      <div className="two-col">
        <section className="panel">
          <h3>Start a challenge</h3>
          <form
            className="inline-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              if (
                await mutate({
                  action: "circle.create",
                  name: new FormData(form).get("name"),
                })
              )
                form.reset();
            }}
          >
            <input
              name="name"
              required
              maxLength={160}
              placeholder="e.g. Our November growth"
              aria-label="Challenge name"
            />
            <button className="button" disabled={busy}>
              Create
            </button>
          </form>
        </section>
        <section className="panel">
          <h3>Join your friends</h3>
          <form
            className="inline-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              if (
                await mutate({
                  action: "circle.join",
                  code: new FormData(form).get("code"),
                })
              )
                form.reset();
            }}
          >
            <input
              name="code"
              required
              maxLength={12}
              minLength={12}
              placeholder="12-character invite code"
              aria-label="Invitation code"
            />
            <button className="button secondary" disabled={busy}>
              Join
            </button>
          </form>
        </section>
      </div>
      <div className="goals-grid">
        {data.circles.map((c) => (
          <section className="panel" key={c.id}>
            <div className="section-heading">
              <h2>{c.name}</h2>
              <Users size={20} />
            </div>
            <p className="invite-code">
              Invite code: <code>{c.code}</code>
            </p>
            {c.ranking.map((m, i) => (
              <div className="history-row" key={i}>
                <span className="avatar small">
                  {m.name.slice(0, 1).toUpperCase()}
                </span>
                <strong>{m.name}</strong>
                <span>{m.days} active days</span>
              </div>
            ))}
            <button
              className="text-button"
              disabled={busy}
              onClick={() => void mutate({ action: "circle.leave", id: c.id })}
            >
              Leave challenge
            </button>
          </section>
        ))}
      </div>
    </>
  );
}
function SettingsPanel({
  data,
  mutate,
  busy,
  notifications,
  setNotifications,
  customize,
  toast,
}: {
  data: Snapshot;
  mutate: Mutation;
  busy: boolean;
  notifications: boolean;
  setNotifications: (b: boolean) => void;
  customize: () => void;
  toast: (s: string) => void;
}) {
  const exportCalendar = () => {
    const esc = (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    const now = dayKey(new Date(), data.profile.timezone);
    const rows = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bloom//Habit Calendar//EN",
    ];
    for (const h of data.habits.filter((h) => !h.archived)) {
      let first = now;
      for (let i = 0; i < 7 && !scheduled(h, first); i++)
        first = shiftDay(first, 1);
      rows.push(
        "BEGIN:VEVENT",
        `UID:${h.id}@bloom`,
        `DTSTAMP:${new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}Z/, "Z")}`,
        `DTSTART;TZID=${data.profile.timezone}:${first.replaceAll("-", "")}T${(h.time || "09:00").replace(":", "")}00`,
        `DURATION:PT15M`,
        `RRULE:FREQ=WEEKLY;BYDAY=${h.days
          .split(",")
          .map((d) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][Number(d)])
          .join(",")}`,
        `SUMMARY:${esc(h.name)}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT5M",
        "ACTION:DISPLAY",
        `DESCRIPTION:${esc(h.name)}`,
        "END:VALARM",
        "END:VEVENT",
      );
    }
    rows.push("END:VCALENDAR");
    download("bloom-habits.ics", rows.join("\r\n"), "text/calendar");
  };
  return (
    <div className="two-col">
      <section className="panel">
        <h2>Your profile</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            await mutate({
              action: "profile.save",
              ...data.profile,
              name: f.get("name"),
              timezone: f.get("timezone"),
            });
          }}
        >
          <Label title="Display name">
            <input
              name="name"
              required
              maxLength={160}
              defaultValue={data.profile.name}
            />
          </Label>
          <Label title="Time zone">
            <select name="timezone" defaultValue={data.profile.timezone}>
              {Array.from(
                new Set([
                  data.profile.timezone,
                  ...Intl.supportedValuesOf("timeZone"),
                ]),
              ).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Label>
          <p className="fine">
            Habits, streaks, and reminders follow this time zone.
          </p>
          <button className="button" disabled={busy}>
            Save profile
          </button>
        </form>
        <hr />
        <h3>Your personal garden</h3>
        <p className="muted">Choose a pot and a flower that feel like you.</p>
        <button className="button secondary" onClick={customize}>
          <Flower2 size={17} />
          Customize garden
        </button>
      </section>
      <div className="right-stack">
        <section className="panel">
          <h2>Gentle reminders</h2>
          <p className="muted">
            Get a notification at each habit’s scheduled time while Bloom is
            open. For closed-app reminders, import your schedule into your
            calendar.
          </p>
          <button
            className="button secondary"
            onClick={async () => {
              if (notifications) {
                setNotifications(false);
                localStorage.setItem("bloom-reminders", "off");
                return;
              }
              if (!("Notification" in window)) {
                toast(
                  "This browser does not support notifications. Use calendar export instead.",
                );
                return;
              }
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                setNotifications(true);
                localStorage.setItem("bloom-reminders", "on");
              } else
                toast(
                  "Notifications are not enabled. You can change this in browser settings.",
                );
            }}
          >
            <Bell size={17} />
            {notifications
              ? "Disable browser reminders"
              : "Enable browser reminders"}
          </button>
          <button
            className="text-button export-calendar"
            onClick={exportCalendar}
          >
            <CalendarDays size={16} />
            Export recurring calendar reminders
          </button>
        </section>
        <section className="panel">
          <h2>Your data belongs to you</h2>
          <p className="muted">
            Download your goals, check-ins, tasks, reflections, and focus
            history as JSON.
          </p>
          <button
            className="button secondary"
            onClick={() =>
              download(
                "bloom-export.json",
                JSON.stringify(
                  { version: 1, exportedAt: new Date().toISOString(), ...data },
                  null,
                  2,
                ),
              )
            }
          >
            <Download size={16} />
            Export my data
          </button>
        </section>
      </div>
    </div>
  );
}
