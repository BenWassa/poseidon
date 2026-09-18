/**
 * The phone column and its chrome.
 *
 * The application is phone-first: on a wider screen it stays a centred column
 * against the pale aquatic frame rather than stretching into a desktop dashboard.
 * The bottom bar keeps the prototype's translucent chrome and its central
 * coral Log Dive action, which is the product's most important control.
 */
import type { ReactNode } from 'react';
import { BookOpen, Fish, Home, Map, Plus } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { PwaNotice } from './PwaNotice';

interface Tab {
  to: string;
  label: string;
  icon: typeof Home;
}

const LEFT_TABS: Tab[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/journal', label: 'Journal', icon: BookOpen },
];

const RIGHT_TABS: Tab[] = [
  { to: '/atlas', label: 'Atlas', icon: Map },
  { to: '/collection', label: 'Collection', icon: Fish },
];

function TabLink({ tab }: { tab: Tab }) {
  const Icon = tab.icon;
  return (
    <NavLink
      to={tab.to}
      end={tab.to === '/'}
      className={({ isActive }) =>
        `tap-lift relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 ${
          isActive ? 'bg-aqua-soft/70 text-marine' : 'text-abyss/70'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
          <span className="text-[0.6875rem] leading-none font-bold">
            {tab.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav
      aria-label="Main"
      className="safe-bottom absolute inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-border/80 bg-surface/94 px-3 pt-2 shadow-[0_-14px_36px_-28px_rgb(5_50_63_/_0.55)] backdrop-blur-xl"
    >
      {LEFT_TABS.map((tab) => (
        <TabLink key={tab.to} tab={tab} />
      ))}
      <div className="relative w-20 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/log')}
          className="press-ring nav-log-action absolute -top-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-canvas bg-coral text-abyss shadow-float"
        >
          <Plus size={30} strokeWidth={3} aria-hidden="true" />
          <span className="sr-only">Log a dive</span>
        </button>
      </div>
      {RIGHT_TABS.map((tab) => (
        <TabLink key={tab.to} tab={tab} />
      ))}
    </nav>
  );
}

/** Routes that own the whole screen and hide the navigation. */
function isImmersive(pathname: string): boolean {
  return (
    pathname === '/log' ||
    pathname.endsWith('/edit') ||
    pathname === '/dev/assets'
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const immersive = isImmersive(pathname);
  const reviewStudio = pathname === '/dev/assets';

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-frame">
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden bg-canvas ${
          reviewStudio ? 'max-w-[90rem]' : 'max-w-md sm:shadow-2xl'
        }`}
      >
        <PwaNotice />
        <main
          id="main"
          className={`rail h-full flex-1 overflow-y-auto ${immersive ? '' : 'pb-28'}`}
          data-testid="app-main"
        >
          {children}
        </main>
        {immersive ? null : <BottomNav />}
      </div>
    </div>
  );
}
