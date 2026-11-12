import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/apiClient";
import {
  eventApi,
  eventTypes,
  supportsTeams,
  eventStatusLabel,
  participationLabel,
  type CampusEvent,
  type Team,
  type Workspace,
  type TeamMessage,
} from "../services/eventsService";
import { realtimeService } from "../services/realtime";

const input =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900";
const button =
  "inline-flex min-h-10 items-center justify-center rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50";
const secondary =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700";
const panel =
  "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const workspacePanel =
  "min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M14 3h7v7M10 14 21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
    </svg>
  );
}
const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not specified";
const split = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-700">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}
function Tags({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="break-words rounded-lg bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800"
        >
          {v}
        </span>
      ))}
    </div>
  );
}
function EventCard({ event }: { event: CampusEvent }) {
  const { user } = useAuth();
  const featured =
    event.featured &&
    !event.archived &&
    new Date(event.start_date).getTime() > Date.now() &&
    event.effective_status !== "completed";
  return (
    <article className={`${panel} flex flex-col gap-3`}>
      <div className="flex flex-wrap justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-teal-700">
          {event.event_type}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.effective_status === "registration_open" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
        >
          {eventStatusLabel(event.effective_status)}
        </span>
      </div>
      {featured && (
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Featured Opportunity
        </p>
      )}
      {user?.role === "admin" && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {event.is_demo && (
            <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-800">
              Demo record
            </span>
          )}
          {event.archived && <span>Archived</span>}
        </div>
      )}
      <h2 className="break-words text-xl font-bold">{event.title}</h2>
      <p className="text-sm text-slate-600">
        {date(event.start_date)}
        <br />
        {event.location} · {event.organizer}
      </p>
      <Tags values={event.tags} />
      <p className="text-xs text-slate-500">
        {participationLabel(event.participation_type)}
        {supportsTeams(event) && event.max_team_size
          ? ` · Up to ${event.max_team_size} per team`
          : ""}
        {event.interested ? " · Interested" : ""}
        {event.my_team_id ? " · Team member" : ""}
      </p>
      <Link
        className={`${secondary} mt-auto`}
        to={`/opportunities/${event.id}`}
      >
        View opportunity
      </Link>
    </article>
  );
}

function EventForm({
  event,
  onSave,
  onCancel,
}: {
  event?: CampusEvent;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [participation, setParticipation] = useState(
    event?.participation_type ?? "both",
  );
  const local = (v: string | null) =>
    v
      ? new Date(
          new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16)
      : "";
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(f);
    body.tags = split(f.get("tags"));
    body.featured = f.get("featured") === "on";
    body.archived = f.get("archived") === "on";
    body.is_demo = f.get("is_demo") === "on";
    for (const key of ["start_date", "end_date", "registration_deadline"])
      body[key] = f.get(key)
        ? new Date(String(f.get(key))).toISOString()
        : null;
    try {
      await eventApi(event ? `/${event.id}` : "", event ? "put" : "post", body);
      onSave();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={`${panel} space-y-4`}>
      <h2 className="text-xl font-bold">
        {event ? "Edit opportunity" : "Publish an opportunity"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["title", "organizer", "location"] as const).map((key) => (
          <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
            <input
              className={input}
              name={key}
              defaultValue={event?.[key]}
              required
              maxLength={key === "location" ? 200 : 180}
            />
          </Field>
        ))}
        <Field label="Event type">
          <select
            className={input}
            name="event_type"
            defaultValue={event?.event_type}
            onChange={(e) =>
              setParticipation(
                ["Hackathon", "Competition", "Innovation Challenge"].includes(
                  e.target.value,
                )
                  ? "team"
                  : "individual",
              )
            }
          >
            {eventTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Start date">
          <input
            className={input}
            name="start_date"
            type="datetime-local"
            required
            defaultValue={local(event?.start_date ?? null)}
          />
        </Field>
        <Field label="End date">
          <input
            className={input}
            name="end_date"
            type="datetime-local"
            defaultValue={local(event?.end_date ?? null)}
          />
        </Field>
        <Field label="Registration deadline">
          <input
            className={input}
            name="registration_deadline"
            type="datetime-local"
            defaultValue={local(event?.registration_deadline ?? null)}
          />
        </Field>
        <Field label="Participation">
          <select
            className={input}
            name="participation_type"
            value={participation}
            onChange={(e) => setParticipation(e.target.value)}
          >
            {["individual", "team", "both"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        {participation !== "individual" && (
          <Field label="Maximum team size">
            <input
              className={input}
              name="max_team_size"
              type="number"
              min={2}
              max={50}
              defaultValue={event?.max_team_size ?? ""}
            />
          </Field>
        )}
        <Field label="Status">
          <select
            className={input}
            name="status"
            defaultValue={event?.status ?? "registration_open"}
          >
            {["upcoming", "registration_open", "closed", "completed"].map(
              (v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, " ")}
                </option>
              ),
            )}
          </select>
        </Field>
        <Field label="External registration link">
          <input
            className={input}
            name="external_link"
            type="url"
            defaultValue={event?.external_link ?? ""}
          />
        </Field>
        <Field label="Tags (comma separated)">
          <input
            className={input}
            name="tags"
            defaultValue={event?.tags.join(", ")}
          />
        </Field>
      </div>
      <Field label="Overview">
        <textarea
          className={input}
          name="description"
          required
          maxLength={10000}
          rows={4}
          defaultValue={event?.description}
        />
      </Field>
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        {[
          ["featured", "Featured opportunity", event?.featured],
          ["archived", "Archived (hidden from discovery)", event?.archived],
          ["is_demo", "Demo / sample opportunity", event?.is_demo],
        ].map(([name, label, value]) => (
          <label key={String(name)} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={String(name)}
              defaultChecked={!!value}
            />
            {label}
          </label>
        ))}
      </div>
      <Field
        label={
          participation === "individual"
            ? "Useful skills / interests"
            : "Team requirements / useful skills"
        }
      >
        <textarea
          className={input}
          name="requirements"
          maxLength={2000}
          defaultValue={event?.requirements}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} className={button}>
          Save opportunity
        </button>
        <button className={secondary} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { id, teamId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState("upcoming");
  const [teamOnly, setTeamOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const load = useCallback(async () => {
    setError("");
    setLoadFailed(false);
    try {
      const list = await eventApi<CampusEvent[]>();
      setEvents(list);
      if (user?.role === "student") {
        setSkills(
          (await eventApi<{ name: string }[]>("/my-skills")).map((s) => s.name),
        );
        const counts =
          await eventApi<{ team_id: string; unread: number }[]>("/unread");
        setUnread(Object.fromEntries(counts.map((c) => [c.team_id, c.unread])));
      }
      if (id) setTeams(await eventApi<Team[]>(`/${id}/teams`));
      if (teamId) {
        setWorkspace(await eventApi<Workspace>(`/teams/${teamId}`));
        setMessages(await eventApi<TeamMessage[]>(`/teams/${teamId}/messages`));
        await eventApi(`/teams/${teamId}/read`, "post");
      }
    } catch (err) {
      setLoadFailed(true);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, teamId, user?.role]);
  useEffect(() => {
    setWorkspace(null);
    setMessages([]);
    setLoading(true);
    setEditing(false);
    setCreating(false);
    void load();
  }, [load]);
  useEffect(() => {
    if (!teamId) return;
    const join = () => realtimeService.emit("event-team:join", { teamId });
    join();
    const offConnect = realtimeService.on("connect", join);
    const off = realtimeService.on<TeamMessage>(
      "event-team:message",
      (message) => {
        if (message.team_id !== teamId) return;
        setMessages((previous) =>
          previous.some((m) => m.id === message.id)
            ? previous
            : [...previous, message],
        );
        if (document.visibilityState === "visible")
          void eventApi(`/teams/${teamId}/read`, "post").catch(() => {});
      },
    );
    return () => {
      off();
      offConnect();
      realtimeService.emit("event-team:leave", { teamId });
    };
  }, [teamId]);
  const act = async (operation: () => Promise<unknown>, message = "Saved") => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await operation();
      setNotice(message);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const filteredEvents = events
    .filter(
      (e) =>
        (!search ||
          `${e.title} ${e.organizer} ${e.tags.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!type || e.event_type === type) &&
        (!status || e.effective_status === status) &&
        (!teamOnly || supportsTeams(e)) &&
        (!e.archived || (user?.role === "admin" && showArchived)) &&
        (period === "all" ||
          (period === "past") === (e.effective_status === "completed")),
    )
    .sort(
      (a, b) =>
        Number(!!b.featured && new Date(b.start_date).getTime() > Date.now()) -
        Number(!!a.featured && new Date(a.start_date).getTime() > Date.now()),
    );
  const event = events.find((e) => e.id === id);
  const closed =
    event &&
    (event.effective_status === "completed" ||
      event.effective_status === "closed" ||
      (event.registration_deadline &&
        new Date(event.registration_deadline).getTime() < Date.now()));
  const skillPicker = (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-bold">My relevant skills</legend>
      {skills.length ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(s)}
                onChange={(e) =>
                  setSelected((old) =>
                    e.target.checked ? [...old, s] : old.filter((v) => v !== s),
                  )
                }
              />
              {s}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Add skills to{" "}
          <Link className="text-teal-700 underline" to="/skill-map">
            SkillMap
          </Link>{" "}
          to improve team matching.
        </p>
      )}
    </fieldset>
  );
  async function createTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await act(async () => {
      const team = await eventApi<Team>(`/${id}/teams`, "post", {
        ...Object.fromEntries(f),
        needed_skills: split(f.get("needed_skills")),
        contribution_skills: selected,
      });
      navigate(`/opportunities/${id}/teams/${team.id}`);
      setCreating(false);
    }, "Team created");
  }
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const value = String(new FormData(form).get("message") ?? "");
    await act(async () => {
      await eventApi(`/teams/${teamId}/messages`, "post", { message: value });
      form.reset();
    }, "");
  }
  return (
    <div
      className={`min-w-0 ${teamId ? "space-y-4" : "space-y-6"} [overflow-wrap:anywhere]`}
    >
      {!teamId && (
        <header className="rounded-2xl bg-gradient-to-br from-slate-950 to-teal-900 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-200">
            Campus · Collaborate & grow
          </p>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Hackathons & Events
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Discover opportunities, build teams, and turn your skills into real
            collaboration.
          </p>
          {id && (
            <Link
              className="mt-4 inline-block text-sm font-semibold text-teal-200"
              to="/opportunities"
            >
              All opportunities
            </Link>
          )}
        </header>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}{" "}
          <button className="ml-2 underline" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <p role="status">Loading opportunities…</p>
      ) : loadFailed ? null : (
        <>
          {user?.role === "admin" && !teamId && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  [
                    "Upcoming events",
                    events.filter(
                      (e) =>
                        new Date(e.start_date).getTime() > Date.now() &&
                        e.effective_status !== "completed",
                    ).length,
                  ],
                  [
                    "Open team searches",
                    events.reduce((n, e) => n + e.recruiting_count, 0),
                  ],
                  [
                    "Teams formed",
                    events.reduce((n, e) => n + e.team_count, 0),
                  ],
                  [
                    "Interested students",
                    events.reduce((n, e) => n + e.interested_count, 0),
                  ],
                ].map(([label, value]) => (
                  <div className={panel} key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <button className={button} onClick={() => setEditing(true)}>
                {id ? "Edit opportunity" : "Create event"}
              </button>
            </>
          )}
          {editing && (
            <EventForm
              event={event}
              onCancel={() => setEditing(false)}
              onSave={() => {
                setEditing(false);
                void load();
              }}
            />
          )}
          {!id && (
            <>
              <section
                aria-label="Filter opportunities"
                className={`${panel} grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}
              >
                <Field label="Search opportunities">
                  <input
                    className={input}
                    placeholder="Title, organizer or tag"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Field>
                <Field label="Event type">
                  <select
                    className={input}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">All types</option>
                    {eventTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="When">
                  <select
                    className={input}
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="all">All dates</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    className={input}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">All statuses</option>
                    {[
                      "upcoming",
                      "registration_open",
                      "closed",
                      "completed",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={teamOnly}
                    onChange={(e) => setTeamOnly(e.target.checked)}
                  />
                  Team opportunities
                </label>
                {user?.role === "admin" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                    />
                    Show archived
                  </label>
                )}
              </section>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
              {!filteredEvents.length && !!events.length && (
                <p className={`${panel} text-sm text-slate-500`}>
                  No opportunities match these filters. Try another search or
                  date range.
                </p>
              )}
              {!events.length && (
                <div className={`${panel} py-12 text-center`}>
                  <h2 className="font-bold">
                    No opportunities have been published yet.
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Published campus activities will appear here.
                  </p>
                </div>
              )}
            </>
          )}
          {id && !event && !error && (
            <div className={panel}>
              Event unavailable.{" "}
              <Link to="/opportunities">Explore opportunities</Link>
            </div>
          )}
          {event && !teamId && (
            <>
              <section className={`${panel} space-y-5`}>
                <Tags
                  values={[
                    event.event_type,
                    eventStatusLabel(event.effective_status),
                    ...event.tags,
                  ]}
                />
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-sm text-slate-500">
                  Organized by {event.organizer}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {event.description}
                </p>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    ["Starts", date(event.start_date)],
                    ["Ends", date(event.end_date)],
                    [
                      "Registration deadline",
                      date(event.registration_deadline),
                    ],
                    ["Location", event.location],
                    [
                      "Participation",
                      participationLabel(event.participation_type),
                    ],
                    ...(supportsTeams(event)
                      ? [
                          [
                            "Team size",
                            event.max_team_size
                              ? `Up to ${event.max_team_size}`
                              : "Not specified",
                          ],
                        ]
                      : []),
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="mt-1 font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
                {event.requirements && (
                  <div>
                    <h3 className="font-bold">
                      {supportsTeams(event)
                        ? "Team requirements & useful skills"
                        : "Useful skills"}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {event.requirements}
                    </p>
                  </div>
                )}
                {event.external_link && (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <a
                      className="font-bold text-teal-700 underline"
                      href={event.external_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      External registration
                    </a>
                    <p className="mt-1 text-slate-600">
                      Register with the organizer separately. CampusCare manages
                      discovery and team collaboration.
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {user?.role === "student" && (
                    <>
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() =>
                          void act(
                            () =>
                              eventApi(`/${id}/interest`, "put", {
                                active: !event.interested,
                              }),
                            event.interested
                              ? "Interest withdrawn"
                              : "Interest saved",
                          )
                        }
                      >
                        {event.interested
                          ? "Withdraw interest"
                          : "I’m interested"}
                      </button>
                      {supportsTeams(event) && (
                        <>
                          <button
                            className={secondary}
                            disabled={!!closed}
                            onClick={() => setCreating(!creating)}
                          >
                            Create a team
                          </button>
                          <a className={secondary} href="#event-teams">
                            Find a team
                          </a>
                        </>
                      )}
                    </>
                  )}
                  <button
                    className={secondary}
                    onClick={() =>
                      void act(async () => {
                        await navigator.clipboard.writeText(
                          `${window.location.origin}/opportunities/${id}`,
                        );
                      }, "Opportunity link copied")
                    }
                  >
                    Share opportunity
                  </button>
                </div>
              </section>
              {creating && (
                <form onSubmit={createTeam} className={`${panel} space-y-4`}>
                  <h2 className="text-xl font-bold">Create a team</h2>
                  <Field label="Team name">
                    <input
                      className={input}
                      name="name"
                      required
                      maxLength={100}
                    />
                  </Field>
                  <Field label="Short description">
                    <textarea
                      className={input}
                      name="description"
                      required
                      maxLength={2000}
                    />
                  </Field>
                  <Field label="Maximum members">
                    <input
                      className={input}
                      type="number"
                      name="max_members"
                      min={2}
                      max={event.max_team_size ?? 50}
                      defaultValue={Math.min(5, event.max_team_size ?? 5)}
                      required
                    />
                  </Field>
                  <Field label="Short goal (optional)">
                    <input className={input} name="goal" maxLength={500} />
                  </Field>
                  <Field label="Discord workspace (optional)">
                    <input
                      className={input}
                      type="url"
                      name="discord_invite_url"
                      maxLength={500}
                      placeholder="https://discord.gg/your-invite"
                      aria-describedby="create-discord-help"
                    />
                  </Field>
                  <p
                    id="create-discord-help"
                    className="text-sm text-slate-500"
                  >
                    Add a Discord invite if your team uses Discord for
                    collaboration.
                  </p>
                  {skillPicker}
                  <Field label="Skills we need (comma separated)">
                    <input
                      className={input}
                      name="needed_skills"
                      placeholder="React, UI/UX, Presentation"
                    />
                  </Field>
                  <button className={button} disabled={busy}>
                    Create team
                  </button>
                </form>
              )}
              {supportsTeams(event) && (
                <section id="event-teams" className="space-y-4">
                  <h2 className="text-xl font-bold">CampusCare team area</h2>
                  {user?.role === "student" && skillPicker}
                  <Field label="Find teammates by contribution or needed skill">
                    <input
                      className={input}
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search team skills"
                    />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    {teams
                      .filter(
                        (t) =>
                          (t.status === "recruiting" ||
                            t.my_status === "accepted" ||
                            t.leader_user_id === user?.id) &&
                          (!skillSearch ||
                            [...t.needed_skills, ...t.available_skills].some(
                              (s) =>
                                s
                                  .toLowerCase()
                                  .includes(skillSearch.toLowerCase()),
                            )),
                      )
                      .map((t) => (
                        <article className={`${panel} space-y-3`} key={t.id}>
                          <div className="flex flex-wrap justify-between gap-2">
                            <h3 className="text-lg font-bold">{t.name}</h3>
                            <span className="text-sm text-slate-500">
                              {t.member_count} / {t.max_members} members
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {t.goal || t.description}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            Skills available
                          </p>
                          <Tags values={t.available_skills} />
                          <p className="text-xs font-bold text-slate-500">
                            Looking for
                          </p>
                          <Tags values={t.needed_skills} />
                          {user?.role === "student" && (
                            <>
                              <p className="text-sm font-semibold text-teal-700">
                                {t.match.label}
                                {t.match.skills.length
                                  ? ` · You match: ${t.match.skills.join(", ")}`
                                  : ""}
                              </p>
                              {t.my_status === "accepted" ? (
                                <Link
                                  className={button}
                                  to={`/opportunities/${id}/teams/${t.id}`}
                                >
                                  Open workspace
                                  {unread[t.id]
                                    ? ` (${unread[t.id]} unread)`
                                    : ""}
                                </Link>
                              ) : (
                                <button
                                  className={secondary}
                                  disabled={
                                    busy ||
                                    !!t.my_status ||
                                    !!closed ||
                                    t.member_count >= t.max_members
                                  }
                                  onClick={() =>
                                    void act(
                                      () =>
                                        eventApi(
                                          `/teams/${t.id}/requests`,
                                          "post",
                                          { contribution_skills: selected },
                                        ),
                                      "Request sent",
                                    )
                                  }
                                >
                                  {t.my_status === "pending"
                                    ? "Request pending"
                                    : t.my_status === "declined"
                                      ? "Request declined"
                                      : "Request to join"}
                                </button>
                              )}
                            </>
                          )}
                        </article>
                      ))}
                  </div>
                  {!teams.some((t) => t.status === "recruiting") && (
                    <p className={`${panel} text-sm text-slate-500`}>
                      No teams are recruiting yet. You can start one.
                    </p>
                  )}
                </section>
              )}
            </>
          )}
          {workspace && teamId && (
            <div className="space-y-4">
              <nav
                aria-label="Workspace breadcrumb"
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500"
              >
                <Link
                  className="text-teal-700 hover:underline"
                  to="/opportunities"
                >
                  Hackathons & Events
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  className="min-w-0 hover:text-teal-700"
                  to={`/opportunities/${id}`}
                >
                  Back to opportunity
                </Link>
              </nav>
              <header className="cc-inverse rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 capitalize text-teal-200">
                        {workspace.status}
                      </span>
                      <span className="text-slate-300">
                        {
                          workspace.members.filter(
                            (m) => m.status === "accepted",
                          ).length
                        }{" "}
                        / {workspace.max_members} members
                      </span>
                      {workspace.leader_user_id === user?.id && (
                        <span className="rounded-full border border-white/15 px-2.5 py-1 text-cyan-100">
                          Team leader
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                      {workspace.name}
                    </h1>
                    <Link
                      className="mt-1.5 block text-sm leading-5 text-slate-300 hover:text-cyan-100"
                      to={`/opportunities/${id}`}
                    >
                      {workspace.event.title}
                    </Link>
                    <p className="mt-2 text-xs text-slate-400">
                      {date(workspace.event.start_date)}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                    {workspace.leader_user_id === user?.id && (
                      <a
                        className="inline-flex min-h-9 items-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/5"
                        href="#workspace-settings"
                      >
                        Team settings
                      </a>
                    )}
                    {workspace.discord_invite_url && (
                      <a
                        className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600"
                        href={workspace.discord_invite_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Discord <ExternalLinkIcon />
                      </a>
                    )}
                    {workspace.leader_user_id !== user?.id && (
                      <button
                        className="inline-flex min-h-9 items-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-100 disabled:opacity-50"
                        disabled={busy}
                        onClick={() =>
                          void act(async () => {
                            await eventApi(`/teams/${teamId}/leave`, "post");
                            navigate(`/opportunities/${id}`);
                          }, "You left the team")
                        }
                      >
                        Leave team
                      </button>
                    )}
                  </div>
                </div>
              </header>
              <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-4">
                  <section
                    className={`${workspacePanel} space-y-3`}
                    aria-label="Team overview"
                  >
                    <h2 className="text-sm font-bold">Team overview</h2>
                    <p className="text-sm leading-5 text-slate-600">
                      {workspace.description}
                    </p>
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Team objective
                        </h3>
                        {workspace.leader_user_id === user?.id && (
                          <a
                            className="text-xs font-semibold text-teal-700 hover:underline"
                            href="#workspace-settings"
                          >
                            Edit objective
                          </a>
                        )}
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-slate-700">
                        {workspace.note ||
                          workspace.goal ||
                          "No objective pinned yet."}
                      </p>
                    </div>
                  </section>
                  <section className={workspacePanel} aria-label="Team members">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold">Team members</h2>
                      <span className="text-xs text-slate-400">
                        {
                          workspace.members.filter(
                            (m) => m.status === "accepted",
                          ).length
                        }{" "}
                        accepted
                      </span>
                    </div>
                    <div className="max-h-64 space-y-2 overflow-y-auto overscroll-contain pr-1">
                      {workspace.members
                        .filter((m) => m.status === "accepted")
                        .map((m) => (
                          <div
                            className="flex min-w-0 items-start gap-2.5 rounded-xl bg-slate-50 p-2.5"
                            key={m.user_id}
                          >
                            <span
                              aria-hidden="true"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-[11px] font-bold text-teal-800"
                            >
                              {m.display_name
                                .split(/\s+/)
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <p className="text-sm font-semibold">
                                  {m.display_name}
                                </p>
                                <span className="text-[11px] text-slate-500">
                                  {m.user_id === workspace.leader_user_id
                                    ? "Leader"
                                    : "Member"}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <Tags values={m.contribution_skills} />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                  <section
                    className={`${workspacePanel} grid gap-3 sm:grid-cols-2`}
                    aria-label="Team skills"
                  >
                    <div className="min-w-0">
                      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Our skills
                      </h2>
                      <Tags
                        values={[
                          ...new Set(
                            workspace.members
                              .filter((m) => m.status === "accepted")
                              .flatMap((m) => m.contribution_skills),
                          ),
                        ]}
                      />
                    </div>
                    <div className="min-w-0 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Looking for
                      </h2>
                      <Tags
                        values={workspace.needed_skills.filter(
                          (s) =>
                            !workspace.members.some(
                              (m) =>
                                m.status === "accepted" &&
                                m.contribution_skills.some(
                                  (v) => v.toLowerCase() === s.toLowerCase(),
                                ),
                            ),
                        )}
                      />
                    </div>
                  </section>
                  <section
                    className={workspacePanel}
                    aria-label="Event quick info"
                  >
                    <h2 className="mb-3 text-sm font-bold">Event quick info</h2>
                    <dl className="grid gap-3 text-xs sm:grid-cols-2">
                      <div className="min-w-0">
                        <dt className="text-slate-400">
                          Registration deadline
                        </dt>
                        <dd className="mt-1 font-semibold leading-5 text-slate-700">
                          {date(workspace.event.registration_deadline)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-slate-400">Location</dt>
                        <dd className="mt-1 leading-5 text-slate-600">
                          {workspace.event.location}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
                <div className="min-w-0 space-y-4">
                  <section
                    className={`${workspacePanel} space-y-3`}
                    aria-label="Team Collaboration"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold">Team Collaboration</h2>
                      <span className="text-[11px] text-slate-400">
                        Members only
                      </span>
                    </div>
                    <a
                      className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800"
                      href="#workspace-chat"
                    >
                      CampusCare Chat{" "}
                      <svg
                        aria-hidden="true"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M12 4v16m-6-6 6 6 6-6" />
                      </svg>
                    </a>
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        External workspace
                      </p>
                      <h3 className="mb-1 mt-0.5 text-sm font-semibold">
                        Discord
                      </h3>
                      {workspace.discord_invite_url ? (
                        <>
                          <p className="mb-2.5 text-xs leading-5 text-slate-500">
                            Continue team communication in your shared Discord
                            space.
                          </p>
                          <a
                            className={`${secondary} min-h-9 w-full gap-2 !px-3 !py-1.5 text-xs sm:w-auto`}
                            href={workspace.discord_invite_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Discord <ExternalLinkIcon />
                          </a>
                        </>
                      ) : (
                        <p className="text-xs leading-5 text-slate-500">
                          {workspace.leader_user_id === user?.id
                            ? "Add Discord workspace"
                            : "Your team has not added a Discord workspace yet."}
                        </p>
                      )}
                      {workspace.leader_user_id === user?.id && (
                        <details className="mt-2.5">
                          <summary className="cursor-pointer text-xs font-semibold text-teal-700">
                            Edit link
                          </summary>
                          <form
                            className="mt-3 space-y-3"
                            key={workspace.discord_invite_url ?? "no-discord"}
                            onSubmit={(e) => {
                              e.preventDefault();
                              const value = new FormData(e.currentTarget).get(
                                "discord_invite_url",
                              );
                              void act(
                                () =>
                                  eventApi(
                                    `/teams/${teamId}/discord`,
                                    "patch",
                                    {
                                      discord_invite_url: value,
                                    },
                                  ),
                                "Discord workspace saved",
                              );
                            }}
                          >
                            <Field label="Discord workspace (optional)">
                              <input
                                className={input}
                                type="url"
                                name="discord_invite_url"
                                maxLength={500}
                                defaultValue={
                                  workspace.discord_invite_url ?? ""
                                }
                                placeholder="https://discord.gg/your-invite"
                                aria-describedby="edit-discord-help"
                              />
                            </Field>
                            <p
                              id="edit-discord-help"
                              className="text-sm text-slate-500"
                            >
                              Add a Discord invite if your team uses Discord for
                              collaboration.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button className={secondary} disabled={busy}>
                                Save Discord workspace
                              </button>
                              {workspace.discord_invite_url && (
                                <button
                                  type="button"
                                  className={secondary}
                                  disabled={busy}
                                  onClick={() =>
                                    void act(
                                      () =>
                                        eventApi(
                                          `/teams/${teamId}/discord`,
                                          "patch",
                                          { discord_invite_url: null },
                                        ),
                                      "Discord workspace removed",
                                    )
                                  }
                                >
                                  Remove Discord workspace
                                </button>
                              )}
                            </div>
                          </form>
                        </details>
                      )}
                    </div>
                  </section>
                  {workspace.leader_user_id === user?.id && (
                    <section
                      id="workspace-settings"
                      className={`${workspacePanel} scroll-mt-4 space-y-3`}
                      aria-label="Team management"
                    >
                      <h2 className="text-sm font-bold">Team management</h2>
                      <details className="rounded-lg border border-slate-100 px-3 py-2">
                        <summary className="cursor-pointer text-xs font-semibold text-teal-700">
                          Team settings · Pinned objective
                        </summary>
                        <form
                          className="mt-3 space-y-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const note = new FormData(e.currentTarget).get(
                              "note",
                            );
                            void act(
                              () =>
                                eventApi(`/teams/${teamId}/note`, "patch", {
                                  note,
                                }),
                              "Objective saved",
                            );
                          }}
                        >
                          <textarea
                            aria-label="Pinned team objective"
                            className={input}
                            name="note"
                            maxLength={2000}
                            defaultValue={workspace.note}
                          />
                          <button className={secondary} disabled={busy}>
                            Save objective
                          </button>
                        </form>
                      </details>
                      <div className="border-t border-slate-100 pt-3">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Join requests ·{" "}
                          {
                            workspace.members.filter(
                              (m) => m.status === "pending",
                            ).length
                          }
                        </h3>
                        <div className="max-h-60 space-y-2 overflow-y-auto overscroll-contain pr-1">
                          {workspace.members
                            .filter((m) => m.status === "pending")
                            .map((m) => (
                              <div
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-slate-100 p-2.5"
                                key={m.user_id}
                              >
                                <div className="min-w-0 space-y-1.5">
                                  <p className="text-sm font-bold">
                                    {m.display_name}
                                  </p>
                                  <Tags values={m.contribution_skills} />
                                </div>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                  {[true, false].map((accept) => (
                                    <button
                                      key={String(accept)}
                                      className={`${secondary} !min-h-9 !px-2.5 !py-1.5 text-xs`}
                                      disabled={busy}
                                      onClick={() =>
                                        void act(
                                          () =>
                                            eventApi(
                                              `/teams/${teamId}/requests/${m.user_id}`,
                                              "patch",
                                              { accept },
                                            ),
                                          accept
                                            ? "Member accepted"
                                            : "Request declined",
                                        )
                                      }
                                    >
                                      {accept ? "Accept" : "Decline"}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          {!workspace.members.some(
                            (m) => m.status === "pending",
                          ) && (
                            <p className="text-xs text-slate-400">
                              No pending requests.
                            </p>
                          )}
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
              <section
                id="workspace-chat"
                aria-label="CampusCare Team Chat"
                className={`${workspacePanel} flex h-[420px] min-w-0 flex-col gap-3 scroll-mt-4 sm:h-[440px]`}
              >
                <h2 className="text-base font-bold">CampusCare Team Chat</h2>
                <div
                  role="log"
                  aria-label="Team messages"
                  aria-live="polite"
                  className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1"
                >
                  {!messages.length && (
                    <p className="py-10 text-center text-sm text-slate-500">
                      Start the conversation with your team.
                    </p>
                  )}
                  {messages.map((m) => (
                    <article
                      key={m.id}
                      className={`rounded-xl p-2.5 ${m.sender_user_id === user?.id ? "bg-teal-50" : "bg-slate-50"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold">{m.display_name}</span>
                        <time
                          className="text-slate-500"
                          dateTime={m.created_at}
                        >
                          {date(m.created_at)}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                        {m.message}
                      </p>
                    </article>
                  ))}
                </div>
                <form
                  className="shrink-0 space-y-2 border-t border-slate-100 pt-3 sm:flex sm:items-end sm:gap-3 sm:space-y-0"
                  onSubmit={send}
                >
                  <textarea
                    aria-label="Write to your team"
                    className={`${input} resize-none sm:flex-1`}
                    name="message"
                    placeholder="Write to your team..."
                    required
                    maxLength={2000}
                    rows={2}
                  />
                  <button
                    className={`${button} w-full shrink-0 sm:w-auto`}
                    disabled={busy}
                  >
                    Send message
                  </button>
                </form>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function OpportunitiesDashboardCard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void eventApi<CampusEvent[]>()
      .then((list) => {
        if (active)
          setEvents(
            list
              .filter(
                (e) =>
                  new Date(e.start_date).getTime() > Date.now() &&
                  !e.archived &&
                  e.effective_status !== "completed",
              )
              .slice(0, 3),
          );
      })
      .catch((err: unknown) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <section className={`${panel} mb-5`}>
      <div className="flex flex-wrap justify-between gap-2">
        <h2 className="font-bold">Upcoming opportunities</h2>
        <Link className="text-sm font-bold text-teal-700" to="/opportunities">
          Explore events
        </Link>
      </div>
      {error ? (
        <div role="alert" className="mt-3 text-sm text-red-700">
          {error}{" "}
          <button
            className="underline"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <p role="status" className="mt-3 text-sm text-slate-500">
          Loading opportunities…
        </p>
      ) : events.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {events.map((e) => (
            <Link
              className="rounded-xl bg-slate-50 p-3"
              key={e.id}
              to={`/opportunities/${e.id}`}
            >
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {date(e.start_date)}
              </p>
              {user?.role === "admin" && (
                <p className="mt-1 text-xs">
                  {e.team_count} teams · {e.interested_count} interested
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No opportunities have been published yet.
        </p>
      )}
    </section>
  );
}
