import Link from 'next/link';

const STYLES = {
  primary:
    'bg-st-dark text-white shadow-md shadow-st-dark/20 hover:bg-st hover:-translate-y-0.5 hover:shadow-lg',
  secondary:
    'border border-st-dark/25 bg-white text-st-darker hover:border-st hover:text-st hover:-translate-y-0.5',
};

function Arrow({ dir }) {
  return dir === 'back' ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function PageButton({ href, variant = 'primary', dir = 'next', children }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-st-dark ${STYLES[variant]}`}
    >
      {dir === 'back' && <Arrow dir="back" />}
      {children}
      {dir === 'next' && <Arrow dir="next" />}
    </Link>
  );
}
