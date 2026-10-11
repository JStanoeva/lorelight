// `children` is the optional call to action, e.g. a <Link> or a <button>.
export default function EmptyState({ title, text, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <h2>{title}</h2>
      {text && <p className="max-w-prose text-parchment-300">{text}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
