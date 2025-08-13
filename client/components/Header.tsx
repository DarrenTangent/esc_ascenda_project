// components/Header.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/about',        label: 'About' },
  { href: '/blog',         label: 'Blog'  },
  { href: '/search',       label: 'Book now' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Transparent only on the homepage
  const isHome = pathname === '/' || pathname === '/home';

  useEffect(() => {
    // Scroll shadow & glass transition
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Simple “auth” read (your Login.tsx writes these)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u?.username || u?.email || 'Account');
      } else {
        setUserName(null);
      }
    } catch {
      setUserName(null);
    }
  }, [pathname]);

  // Header skin
  const wrapperClass = useMemo(() => {
    // Home: transparent until scroll; Others: solid
    if (isHome) {
      return scrolled
        ? 'bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm'
        : 'bg-transparent';
    }
    return 'bg-white shadow-sm';
  }, [isHome, scrolled]);

  const linkBase =
    'px-3 py-2 text-sm font-medium transition-colors';
  const linkActive =
    'text-blue-700';
  const linkIdle =
    'text-slate-700 hover:text-blue-700';

  return (
    <header className={`sticky top-0 z-50 transition-colors ${wrapperClass}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          {/* If you have a logo.png or logo.svg, drop it here */}
          {/* <Image src="/logo.svg" alt="Ascenda" width={28} height={28} /> */}
          <Link
            href="/"
            className={`text-lg font-semibold ${isHome && !scrolled ? 'text-white drop-shadow' : 'text-slate-900'}`}
          >
            Ascenda
          </Link>
        </div>

        {/* Center/Right: Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  linkBase,
                  active ? linkActive : linkIdle,
                  isHome && !scrolled && !active ? 'text-white/90 hover:text-white' : '',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth (Desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {userName ? (
            <UserMenu name={userName} onLogout={() => handleLogout(setUserName)} />
          ) : (
            <>
              <Link
                href="/login"
                className={[
                  'rounded-md px-4 py-2 text-sm font-medium',
                  isHome && !scrolled
                    ? 'text-white/95 ring-1 ring-white/40 hover:bg-white/10'
                    : 'text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className={[
            'md:hidden rounded-md p-2',
            isHome && !scrolled ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100',
          ].join(' ')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-base font-semibold">
                Ascenda
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="space-y-1">
                {NAV_LINKS.map(({ href, label }) => {
                  const active = pathname?.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        'block rounded-md px-3 py-2 text-sm font-medium',
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 border-t pt-4">
                {userName ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={userName} />
                      <div className="text-sm">
                        <p className="font-medium text-slate-900">{userName}</p>
                        <p className="text-slate-500">Signed in</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleLogout(setUserName); setMobileOpen(false); }}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-center text-sm font-medium hover:bg-slate-50"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-2 py-1 hover:bg-white"
      >
        <Avatar name={name} />
        <span className="text-sm text-slate-800">{name}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" className="text-slate-500">
          <path d="M6 8l4 4 4-4" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <Link href="/account" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Account
          </Link>
          <Link href="/bookings" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            My bookings
          </Link>
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = (name || 'A')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
      {initials}
    </div>
  );
}

function handleLogout(setUserName: (v: string | null) => void) {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } finally {
    setUserName(null);
  }
}
