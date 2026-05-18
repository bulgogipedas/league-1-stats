export default function PageHeader({ title, description }) {
  return (
    <div className="mb-5 border-b border-border pb-5 sm:mb-8 sm:pb-8">
      <h1 className="text-3xl font-light leading-tight text-text sm:text-[42px]">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
    </div>
  );
}
