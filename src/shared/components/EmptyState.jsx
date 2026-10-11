// `children` is the optional call to action, e.g. a <Link> or a <button>.
export default function EmptyState({ title, text, children }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
