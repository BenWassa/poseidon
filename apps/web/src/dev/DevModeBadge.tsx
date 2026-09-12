/**
 * Development-only switch between the real application and seeded mock history.
 *
 * `main.tsx` renders this behind `import.meta.env.DEV`, so it never reaches a
 * production build. It styles itself with its own scoped stylesheet rather than
 * the brand tokens on purpose: development chrome must never read as product
 * UI, and it has to keep working across brand-system migrations without being
 * one of the screens that a migration has to think about.
 */
import { useEffect, useRef, useState } from 'react';

import {
  MOCK_PRESETS,
  describeDevSelection,
  writeDevSelection,
  type DevSelection,
} from './selection';

const OPTIONS: readonly DevSelection[] = [
  { kind: 'real' },
  ...MOCK_PRESETS.map((preset) => ({ kind: 'mock' as const, preset })),
];

function hint(option: DevSelection): string {
  if (option.kind === 'real') return 'sign-in';
  if (option.preset === 0) return 'empty';
  return `${option.preset} dives`;
}

function isSame(a: DevSelection, b: DevSelection): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind !== 'mock' || b.kind !== 'mock') return true;
  return a.preset === b.preset;
}

/**
 * Storage is the authority, so a stale `?mock=` parameter is dropped on the way
 * out. Removing it is itself the navigation; otherwise reload explicitly.
 */
function apply(option: DevSelection): void {
  writeDevSelection(option);
  const url = new URL(window.location.href);
  if (url.searchParams.has('mock')) {
    url.searchParams.delete('mock');
    window.location.replace(url.toString());
    return;
  }
  window.location.reload();
}

const STYLES = `
.poseidon-dev-badge {
  position: fixed;
  right: 12px;
  bottom: 104px;
  z-index: 2147483000;
  color: #e8f1f5;
  font: 600 11px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.06em;
}
@media (min-width: 640px) {
  .poseidon-dev-badge { right: 16px; bottom: 16px; }
}
.poseidon-dev-badge button {
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}
.poseidon-dev-badge__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: #0b2530;
  box-shadow: 0 8px 24px rgba(3, 24, 32, 0.35);
  text-transform: uppercase;
}
.poseidon-dev-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34b6a4;
}
.poseidon-dev-badge__dot--mock { background: #f7735c; }
.poseidon-dev-badge__caret { opacity: 0.55; font-size: 9px; }
.poseidon-dev-badge__menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  display: flex;
  min-width: 190px;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: #0b2530;
  box-shadow: 0 12px 32px rgba(3, 24, 32, 0.45);
}
.poseidon-dev-badge__label {
  padding: 6px 10px 4px;
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.5;
}
.poseidon-dev-badge__option {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  text-align: left;
}
.poseidon-dev-badge__option:hover { background: rgba(255, 255, 255, 0.08); }
.poseidon-dev-badge__option[aria-current='true'] {
  background: rgba(52, 182, 164, 0.2);
}
.poseidon-dev-badge__hint {
  font-size: 10px;
  letter-spacing: 0;
  opacity: 0.5;
}
.poseidon-dev-badge__note {
  padding: 4px 10px 6px;
  font-size: 10px;
  letter-spacing: 0;
  line-height: 1.4;
  opacity: 0.45;
}
`;

export function DevModeBadge({ selection }: { selection: DevSelection }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const mock = selection.kind === 'mock';

  return (
    <div ref={root} className="poseidon-dev-badge" data-testid="dev-mode-badge">
      <style>{STYLES}</style>
      {open ? (
        <div
          className="poseidon-dev-badge__menu"
          role="group"
          aria-label="Development data"
        >
          <p className="poseidon-dev-badge__label">Boot with</p>
          {OPTIONS.map((option) => (
            <button
              key={describeDevSelection(option)}
              type="button"
              className="poseidon-dev-badge__option"
              aria-label={describeDevSelection(option)}
              aria-current={isSame(option, selection)}
              onClick={() => apply(option)}
            >
              <span>{describeDevSelection(option)}</span>
              <span className="poseidon-dev-badge__hint">{hint(option)}</span>
            </button>
          ))}
          <p className="poseidon-dev-badge__note">
            Mock history is in memory only. Reloading re-seeds it.
          </p>
        </div>
      ) : null}
      <button
        type="button"
        className="poseidon-dev-badge__toggle"
        aria-expanded={open}
        aria-label={`Development data: ${describeDevSelection(selection)}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={`poseidon-dev-badge__dot${mock ? 'poseidon-dev-badge__dot--mock' : ''}`}
          aria-hidden="true"
        />
        <span>{describeDevSelection(selection)}</span>
        <span className="poseidon-dev-badge__caret" aria-hidden="true">
          {open ? '▾' : '▴'}
        </span>
      </button>
    </div>
  );
}
