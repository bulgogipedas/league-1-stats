export default function PageHeader({ title, description }) {
  return (
    <div className="mb-8 border-b border-border pb-8">
      <h1 className="text-[42px] font-light leading-tight text-text">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
    </div>
  );
}
