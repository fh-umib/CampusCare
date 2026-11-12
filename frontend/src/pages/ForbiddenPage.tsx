import { Link } from "react-router-dom";
export default function ForbiddenPage() {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
        403 · Access denied
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-950">
        Admin access required
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        You do not have permission to view registered users.
      </p>
      <Link
        className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
        to="/dashboard"
      >
        Return to dashboard
      </Link>
    </section>
  );
}
