'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' }
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-st-dark text-white shadow-lg shadow-st-darker/30">
      <div className="bg-st-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white/70">
          <span>Minería de Datos · Presentación</span>
          <span className="hidden sm:inline">Customer Personality Analysis</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-st-lighter">
          <Image
            src="/logo-st.svg"
            alt="Logo Santo Tomás"
            width={44}
            height={52}
            priority
            className="h-12 w-auto shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-st-lighter">
              Santo Tomás
            </span>
            <span className="block text-lg sm:text-xl font-bold leading-tight truncate">
              Minería de Datos
            </span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-st-lighter"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="ml-auto md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-st-lighter"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block w-6 h-6">
            <span className={`absolute left-0 right-0 top-1 h-0.5 bg-white rounded transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`absolute left-0 right-0 top-3 h-0.5 bg-white rounded transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 right-0 top-5 h-0.5 bg-white rounded transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Navegación móvil" className="md:hidden border-t border-white/10">
          <ul className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-st-lighter"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="h-1 bg-st-light" aria-hidden="true" />
    </header>
  );
}
