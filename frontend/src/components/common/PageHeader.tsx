type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </header>
  );
}

