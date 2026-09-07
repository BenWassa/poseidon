/**
 * Poseidon's tactile primitives.
 *
 * Rounded geometry, translucent chrome, deep-teal type and coral interactions
 * come from the external visual prototype; the semantics — real buttons, real
 * labels, 44px targets, focus that is visible — are the product's own.
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { ChevronLeft } from 'lucide-react';

export function Card({
  children,
  className = '',
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <As className={`rounded-card border border-shallows bg-surface shadow-card ${className}`}>{children}</As>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.14em] text-lagoon ${className}`}>{children}</p>
  );
}

export function SectionHeader({
  title,
  action,
  className = '',
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-end justify-between gap-3 ${className}`}>
      <h2 className="text-lg font-bold text-ocean">{title}</h2>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  icon,
  tone = 'blue',
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: 'blue' | 'mint' | 'coral';
}) {
  const tones = {
    blue: 'bg-shallows text-marine',
    mint: 'bg-lagoon/12 text-lagoon',
    coral: 'bg-coral-soft text-coral',
  } as const;
  return (
    <Card className="flex min-w-0 flex-1 items-center gap-3 p-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-ocean/55">{label}</span>
        <span className="block truncate text-xl font-black text-ocean">{value}</span>
      </span>
    </Card>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const BUTTON_BASE =
  'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-field px-6 text-base font-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100';

/** Shared with `Link` so a navigation CTA never nests a button inside an anchor. */
export const ACTION_PRIMARY = `${BUTTON_BASE} bg-marine text-white shadow-lift`;
export const ACTION_CORAL = `${BUTTON_BASE} bg-coral text-white shadow-float`;
export const ACTION_QUIET = `${BUTTON_BASE} border border-shallows bg-surface text-ocean shadow-card`;

export function PrimaryAction({ className = '', ...props }: ButtonProps) {
  return <button {...props} className={`${ACTION_PRIMARY} ${className}`} />;
}

export function CoralAction({ className = '', ...props }: ButtonProps) {
  return <button {...props} className={`${ACTION_CORAL} ${className}`} />;
}

export function QuietAction({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${ACTION_QUIET} ${className}`}
    />
  );
}

export function IconButton({
  label,
  tone = 'shallows',
  className = '',
  children,
  ...props
}: ButtonProps & { label: string; tone?: 'shallows' | 'coral' | 'glass' }) {
  const tones = {
    shallows: 'bg-shallows text-ocean',
    coral: 'bg-coral-soft text-coral',
    glass: 'border border-white/40 bg-white/25 text-white backdrop-blur-md',
  } as const;
  return (
    <button
      {...props}
      aria-label={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Chip({
  selected = false,
  className = '',
  ...props
}: ButtonProps & { selected?: boolean }) {
  return (
    <button
      {...props}
      aria-pressed={selected}
      className={`min-h-[2.5rem] whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors ${
        selected ? 'bg-ocean text-white' : 'border border-shallows bg-surface text-ocean/65'
      } ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-lagoon" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs font-medium text-ocean/55">{hint}</p> : null}
    </div>
  );
}

const CONTROL =
  'w-full rounded-field border border-shallows bg-surface px-5 py-3.5 text-base font-bold text-ocean shadow-card outline-none placeholder:font-medium placeholder:text-ocean/35 focus-visible:border-marine';

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${className}`} />;
}

export function TextArea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${CONTROL} resize-none font-medium ${className}`} />;
}

export function TopBar({
  title,
  onBack,
  backLabel = 'Go back',
  action,
  asHeading = true,
}: {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  action?: ReactNode;
  /** Screens that render their own primary heading pass false to avoid a second h1. */
  asHeading?: boolean;
}) {
  const Title = asHeading ? 'h1' : 'p';
  return (
    <header className="safe-top sticky top-0 z-30 flex items-center justify-between gap-3 bg-canvas/85 px-5 pb-3 backdrop-blur-xl">
      <div className="w-11">
        {onBack ? (
          <IconButton label={backLabel} onClick={onBack}>
            <ChevronLeft size={24} />
          </IconButton>
        ) : null}
      </div>
      <Title className="min-w-0 truncate text-lg font-bold text-ocean">{title}</Title>
      <div className="flex w-11 justify-end">{action}</div>
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-shallows text-marine">
        {icon}
      </span>
      <h2 className="mb-2 text-xl font-black text-ocean">{title}</h2>
      <p className="mb-6 max-w-xs text-sm font-medium leading-relaxed text-ocean/60">{body}</p>
      {action}
    </div>
  );
}
