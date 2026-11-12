import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  adminUsersService,
  type RegisteredUser,
  type RegisteredUserDetail,
  type UsersResult,
} from "../services/adminUsersService";
import { getApiErrorMessage } from "../services/apiClient";

const card = "min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm";
const field =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900";
const action =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40";
const roleName = (role: string) => role[0].toUpperCase() + role.slice(1);
const formatDate = (value: string | null, withTime = false) =>
  value
    ? new Date(value).toLocaleString(
        undefined,
        withTime
          ? { dateStyle: "medium", timeStyle: "short" }
          : { dateStyle: "medium" },
      )
    : "Not recorded";
function RoleBadge({ role }: { role: RegisteredUser["role"] }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${role === "admin" ? "bg-slate-900 text-white" : role === "mentor" ? "bg-sky-50 text-sky-800" : "bg-teal-50 text-teal-800"}`}
    >
      {roleName(role)}
    </span>
  );
}
function Initials({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-xs font-bold text-teal-800"
    >
      {name
        .split(/\s+/)
        .filter(Boolean)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

export default function AdminUsersPage() {
  const [result, setResult] = useState<UsersResult | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RegisteredUserDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailAttempt, setDetailAttempt] = useState(0);
  const detailPanel = useRef<HTMLElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void adminUsersService
      .list({ search, role, page, sort }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, role, page, sort, attempt]);
  useEffect(() => {
    setDetail(null);
    setDetailError("");
    if (!selected) {
      setDetailLoading(false);
      return;
    }
    const controller = new AbortController();
    setDetailLoading(true);
    detailPanel.current?.focus();
    void adminUsersService
      .detail(selected, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setDetail(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setDetailError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selected, detailAttempt]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(draft.trim());
  };
  const reset = () => {
    setDraft("");
    setSearch("");
    setRole("");
    setSort("newest");
    setPage(1);
  };
  const pages = Math.max(
    1,
    Math.ceil((result?.total ?? 0) / (result?.limit ?? 20)),
  );
  const summary = result?.summary;
  return (
    <div className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
      <header className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-teal-200">
          Account administration
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Registered Users
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          View registered CampusCare accounts and platform roles.
        </p>
      </header>
      <section
        aria-label="Registered account totals"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {[
          ["Total Users", summary?.total_users],
          ["Students", summary?.students],
          ["Mentors", summary?.mentors],
          ["Admins", summary?.admins],
        ].map(([label, value]) => (
          <div className={`${card} p-4`} key={label}>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </section>
      <form
        onSubmit={submit}
        className={`${card} grid items-end gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_170px_auto_auto]`}
        aria-label="User filters"
      >
        <div className="min-w-0 space-y-1.5">
          <label
            className="text-xs font-semibold text-slate-600"
            htmlFor="users-search"
          >
            Search users
          </label>
          <input
            id="users-search"
            className={field}
            placeholder="Name or email"
            type="search"
            maxLength={150}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <label
            className="text-xs font-semibold text-slate-600"
            htmlFor="users-role"
          >
            Role
          </label>
          <select
            id="users-role"
            className={field}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {["student", "mentor", "admin"].map((r) => (
              <option key={r} value={r}>
                {roleName(r)}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 space-y-1.5">
          <label
            className="text-xs font-semibold text-slate-600"
            htmlFor="users-sort"
          >
            Joined
          </label>
          <select
            id="users-sort"
            className={field}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <button
          className="min-h-11 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
          type="submit"
        >
          Search
        </button>
        <button type="button" className={`${action} min-h-11`} onClick={reset}>
          Reset
        </button>
      </form>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}{" "}
          <button
            className="ml-2 font-semibold underline"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      )}
      <div
        className={`grid min-w-0 items-start gap-4 ${selected ? "xl:grid-cols-[minmax(0,1fr)_300px]" : ""}`}
      >
        <section
          className={`${card} overflow-hidden`}
          aria-label="Registered users list"
          aria-busy={loading}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">
              CampusCare accounts
            </h2>
            <span className="text-xs text-slate-500">
              {result
                ? `${result.total} ${result.total === 1 ? "account" : "accounts"} found`
                : "Account directory"}
            </span>
          </div>
          {loading ? (
            <p
              role="status"
              className="px-4 py-12 text-center text-sm text-slate-500"
            >
              Loading registered users…
            </p>
          ) : (
            !error &&
            result && (
              <>
                <div className="hidden md:block">
                  <table className="w-full table-fixed text-left text-sm">
                    <caption className="sr-only">
                      Registered CampusCare accounts
                    </caption>
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-[23%] px-4 py-3">Name</th>
                        <th className="w-[27%] px-3 py-3">Email</th>
                        <th className="w-[13%] px-3 py-3">Role</th>
                        <th className="w-[18%] px-3 py-3">Joined</th>
                        <th className="w-[19%] px-3 py-3">Last login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.items.map((user) => (
                        <tr
                          key={user.id}
                          className={
                            selected === user.id
                              ? "bg-teal-50/70"
                              : "hover:bg-slate-50"
                          }
                        >
                          <td className="px-4 py-3 align-top">
                            <button
                              className="text-left font-bold text-teal-800 hover:underline"
                              aria-label={`View ${user.full_name}`}
                              onClick={() => setSelected(user.id)}
                            >
                              {user.full_name}
                            </button>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {user.profile_completed
                                ? "Profile complete"
                                : "Profile incomplete"}
                            </p>
                          </td>
                          <td className="break-all px-3 py-3 align-top text-xs leading-5 text-slate-600">
                            {user.email}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-3 py-3 align-top text-xs leading-5 text-slate-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-3 py-3 align-top text-xs leading-5 text-slate-500">
                            {formatDate(user.last_login_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3 p-3 md:hidden">
                  {result.items.map((user) => (
                    <article
                      key={user.id}
                      className={`rounded-xl border p-3 ${selected === user.id ? "border-teal-200 bg-teal-50/50" : "border-slate-200"}`}
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <Initials name={user.full_name} />
                        <div className="min-w-0 flex-1">
                          <button
                            className="text-left text-sm font-bold text-teal-800 hover:underline"
                            aria-label={`View ${user.full_name}`}
                            onClick={() => setSelected(user.id)}
                          >
                            {user.full_name}
                          </button>
                          <p className="mt-1 break-all text-xs leading-5 text-slate-600">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <RoleBadge role={user.role} />
                        <p className="text-[11px] text-slate-500">
                          Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-between gap-1 text-[11px] text-slate-400">
                        <span>
                          {user.profile_completed
                            ? "Profile complete"
                            : "Profile incomplete"}
                        </span>
                        <span>
                          Last login: {formatDate(user.last_login_at)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
                {!result.items.length && (
                  <p className="px-4 py-12 text-center text-sm text-slate-500">
                    No registered users found.
                  </p>
                )}
              </>
            )
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                className={action}
                disabled={loading || !!error || page <= 1}
                onClick={() => setPage((n) => n - 1)}
              >
                Previous
              </button>
              <button
                className={action}
                disabled={loading || !!error || !result || page >= pages}
                onClick={() => setPage((n) => n + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
        {selected && (
          <aside
            ref={detailPanel}
            tabIndex={-1}
            aria-label="User details"
            className={`${card} order-first p-4 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 xl:order-last`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">User details</h2>
              <button
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                aria-label="Close user details"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            {detailLoading ? (
              <p role="status" className="py-8 text-sm text-slate-500">
                Loading user details…
              </p>
            ) : detailError ? (
              <div role="alert" className="mt-3 text-sm text-red-700">
                {detailError}{" "}
                <button
                  className="underline"
                  onClick={() => setDetailAttempt((n) => n + 1)}
                >
                  Retry details
                </button>
              </div>
            ) : (
              detail && (
                <>
                  <div className="mt-4 flex min-w-0 items-start gap-3">
                    <Initials name={detail.full_name} />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        {detail.full_name}
                      </p>
                      <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                        {detail.email}
                      </p>
                      <div className="mt-2">
                        <RoleBadge role={detail.role} />
                      </div>
                    </div>
                  </div>
                  <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs">
                    {[
                      ["Joined", formatDate(detail.created_at, true)],
                      ["Last login", formatDate(detail.last_login_at, true)],
                      [
                        "Profile",
                        detail.profile_completed ? "Complete" : "Incomplete",
                      ],
                      ["Department", detail.department],
                      ["Study year", detail.study_year],
                      ["Position", detail.admin_position],
                      ["Department / unit", detail.admin_department_unit],
                    ]
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-slate-400">{label}</dt>
                          <dd className="mt-1 font-medium leading-5 text-slate-700">
                            {value}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </>
              )
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
