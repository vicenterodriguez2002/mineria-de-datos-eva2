const PATHS = {
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  'trending-down': (
    <>
      <path d="M22 17 13.5 8.5l-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M3 7h18" />
      <path d="m6 7-3 7a3.5 3.5 0 0 0 6 0L6 7Z" />
      <path d="m18 7-3 7a3.5 3.5 0 0 0 6 0l-3-7Z" />
    </>
  ),
};

export default function KpiIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.database}
    </svg>
  );
}
