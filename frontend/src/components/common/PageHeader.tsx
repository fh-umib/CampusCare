type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  status?: string;
};

export function PageHeader({ title, description, eyebrow = 'CampusCare', status }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {status ? <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" role="status">{status}</span> : null}
      </div>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </header>
  );
}
