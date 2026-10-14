// The server error above the Login and Register forms. role="alert" makes screen readers
// read it out as soon as it appears.
export default function AuthAlert({ message }) {
  return (
    <div role="alert" className="alert-error auth-alert">
      <svg className="auth-alert-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 5.75v5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="10" cy="14" r="1.1" fill="currentColor" />
      </svg>
      <p>{message}</p>
    </div>
  );
}
