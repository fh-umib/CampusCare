type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">CampusCare</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </header>
  );
}
