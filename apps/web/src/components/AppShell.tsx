/**
 * The phone column and its chrome.
 *
 * The application is phone-first: on a wider screen it stays a centred column
 * against the tide-blue frame rather than stretching into a desktop dashboard.
 * The bottom bar keeps the prototype's translucent chrome and its central
 * coral Log Dive action, which is the product's most important control.
 */
import type { ReactNode } from 'react';
import { BookOpen, Fish, Home, Map, Plus } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

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
        `flex min-h-[3rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors ${
          isActive ? 'text-marine' : 'text-ocean/40'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
          <span className="text-[10px] font-bold">{tab.label}</span>
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
      className="safe-bottom absolute inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-shallows bg-surface/92 px-3 pt-2 backdrop-blur-xl"
    >
      {LEFT_TABS.map((tab) => (
        <TabLink key={tab.to} tab={tab} />
      ))}
      <div className="relative w-20 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/log')}
          className="absolute -top-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-canvas bg-coral text-white shadow-float transition-transform active:scale-90"
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
  return pathname === '/log' || pathname.endsWith('/edit');
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const immersive = isImmersive(pathname);

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-tide">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-canvas sm:shadow-2xl">
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
