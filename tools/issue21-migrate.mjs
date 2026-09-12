import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function read(path) {
  return readFile(join(root, path), 'utf8');
}

async function write(path, content) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), content, 'utf8');
}

function replaceRequired(content, from, to, label = from) {
  if (!content.includes(from)) throw new Error(`Missing expected text: ${label}`);
  return content.replaceAll(from, to);
}

async function update(path, transform) {
  const before = await read(path);
  const after = transform(before);
  if (after === before) throw new Error(`No change made to ${path}`);
  await write(path, after);
}

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
    const relative = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesUnder(relative)));
    else output.push(relative);
  }
  return output;
}

const css = `@import 'tailwindcss';

/**
 * Poseidon Sunlit Reef design tokens.
 *
 * docs/BRAND.md is the product authority. Brand anchors stay distinct from
 * supporting tints and semantic status colours; components consume these role
 * tokens rather than scattering raw brand hex values.
 */
@theme {
  /* Locked brand anchors. */
  --color-abyss: #05323F; /* Jet Black: primary ink / depth */
  --color-marine: #087EA4; /* Cerulean: primary ocean / action */
  --color-lagoon: #34B6A4; /* Ocean Mist: supporting aquatic accent */
  --color-coral: #F7735C; /* Vibrant Coral: expressive brand accent */
  --color-sun: #EFC15E; /* Tuscan Sun: highlight / sunlight */
  --color-canvas: #F3FAFA; /* Mint Cream: default cool canvas */
  --color-shell: #FFF8EC; /* Floral White: warm memory/detail surface */
  --color-surface: #FFFFFF; /* neutral raised card */

  /* Small supporting set; these are functional tints, not extra brand hues. */
  --color-frame: #DDEEEE;
  --color-border: #D3E7E6;
  --color-aqua-soft: #E5F5F3;
  --color-coral-soft: #FFF0EC;
  --color-sun-soft: #FFF6DE;

  /* Semantic status colours stay separate from Coral/Ocean Mist. */
  --color-danger: #A73931;
  --color-danger-soft: #FCEDEB;
  --color-success: #176B55;
  --color-success-soft: #E7F5EF;

  --radius-card: 2rem;
  --radius-field: 1.5rem;
  --radius-tile: 1.75rem;

  --font-sans:
    ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;

  --shadow-card:
    0 1px 2px rgb(5 50 63 / 0.04), 0 8px 24px -16px rgb(8 126 164 / 0.24);
  --shadow-float: 0 12px 32px -12px rgb(247 115 92 / 0.42);
  --shadow-lift: 0 18px 40px -22px rgb(8 126 164 / 0.5);
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    background: var(--color-frame);
    color: var(--color-abyss);
    font-family: var(--font-sans);
    /* Logging happens on a boat; never bounce the whole document. */
    overscroll-behavior-y: none;
  }

  /* Selection and focus must never be communicated by colour alone. */
  :focus-visible {
    outline: 3px solid var(--color-marine);
    outline-offset: 2px;
    border-radius: 0.75rem;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }
}

@layer utilities {
  .rail {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .rail::-webkit-scrollbar {
    display: none;
  }

  .safe-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .safe-top {
    padding-top: max(1.25rem, env(safe-area-inset-top));
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

@keyframes poseidon-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes poseidon-pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-rise {
  animation: poseidon-rise 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-pop {
  animation: poseidon-pop 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
`;
await write('apps/web/src/index.css', css);

const sourceFiles = (await filesUnder('apps/web/src')).filter((path) =>
  ['.ts', '.tsx'].includes(extname(path)),
);
const mechanical = [
  ['bg-tide', 'bg-frame'],
  ['border-shallows', 'border-border'],
  ['bg-shallows', 'bg-aqua-soft'],
  ['text-ocean', 'text-abyss'],
  ['border-ocean', 'border-abyss'],
  ['bg-ocean', 'bg-abyss'],
  ['from-ocean', 'from-marine'],
  ['text-lagoon', 'text-abyss'],
  ['text-reef', 'text-success'],
  ['bg-sand', 'bg-sun'],
  ['bg-foam', 'bg-canvas'],
  ['border-foam', 'border-canvas'],
  ['text-coral', 'text-abyss'],
];
for (const path of sourceFiles) {
  let content = await read(path);
  for (const [from, to] of mechanical) content = content.replaceAll(from, to);
  await write(path, content);
}

await update('apps/web/src/components/ui.tsx', (content) => {
  content = replaceRequired(
    content,
    " * Rounded geometry, translucent chrome, deep-teal type and coral interactions\n * come from the external visual prototype; the semantics — real buttons, real\n * labels, 44px targets, focus that is visible — are the product's own.",
    " * Rounded geometry and translucent chrome remain, while colour follows the\n * Sunlit Reef role system in docs/BRAND.md. Semantics — real buttons, real\n * labels, 44px targets and visible focus — remain part of the component contract.",
  );
  content = replaceRequired(content, 'tracking-[0.14em] text-abyss uppercase', 'tracking-[0.14em] text-abyss/70 uppercase');
  content = replaceRequired(
    content,
    "    blue: 'bg-aqua-soft text-marine',\n    mint: 'bg-lagoon/12 text-abyss',\n    coral: 'bg-coral-soft text-abyss',",
    "    blue: 'bg-aqua-soft text-abyss',\n    mint: 'bg-lagoon/20 text-abyss',\n    coral: 'bg-coral-soft text-abyss',",
    'stat tones',
  );
  content = replaceRequired(content, "export const ACTION_CORAL = `${BUTTON_BASE} bg-coral text-white shadow-float`;", "export const ACTION_CORAL = `${BUTTON_BASE} bg-coral text-abyss shadow-float`;\nexport const ACTION_DANGER = `${BUTTON_BASE} bg-danger text-white shadow-card`;");
  content = replaceRequired(content, "export function CoralAction({ className = '', ...props }: ButtonProps) {\n  return <button {...props} className={`${ACTION_CORAL} ${className}`} />;\n}\n", "export function CoralAction({ className = '', ...props }: ButtonProps) {\n  return <button {...props} className={`${ACTION_CORAL} ${className}`} />;\n}\n\nexport function DangerAction({ className = '', ...props }: ButtonProps) {\n  return <button {...props} className={`${ACTION_DANGER} ${className}`} />;\n}\n");
  content = content.replaceAll("tone = 'shallows'", "tone = 'quiet'");
  content = content.replaceAll("tone?: 'shallows' | 'coral' | 'glass'", "tone?: 'quiet' | 'coral' | 'glass'");
  content = content.replaceAll("    shallows: 'bg-aqua-soft text-abyss',", "    quiet: 'bg-aqua-soft text-abyss',");
  content = replaceRequired(content, "? 'bg-abyss text-white'", "? 'bg-marine text-white'");
  return content;
});

await update('apps/web/src/components/AppShell.tsx', (content) => {
  content = content.replace('against the tide-blue frame', 'against the pale aquatic frame');
  content = replaceRequired(content, 'bg-coral text-white shadow-float', 'bg-coral text-abyss shadow-float');
  return content;
});

await update('apps/web/src/components/CreatureTile.tsx', (content) => {
  content = replaceRequired(content, 'bg-coral text-white shadow-float', 'bg-coral text-abyss shadow-float');
  content = replaceRequired(content, 'bg-sun text-white shadow-card', 'bg-sun text-abyss shadow-card');
  content = content.replace('tracking-[0.12em] text-abyss uppercase', 'tracking-[0.12em] text-abyss/70 uppercase');
  return content;
});

await update('apps/web/src/components/DiveHero.tsx', (content) => {
  content = replaceRequired(content, 'from-marine via-ocean to-abyss', 'from-marine to-abyss');
  content = replaceRequired(content, 'bg-coral px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-white uppercase', 'bg-coral px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-abyss uppercase');
  return content;
});

await update('apps/web/src/components/AtlasMap.tsx', (content) => {
  content = replaceRequired(content, "color: '#075E70',", "color: 'var(--color-marine)',");
  content = replaceRequired(content, "fillColor: visited ? '#075E70' : '#FFFFFF',", "fillColor: visited ? 'var(--color-marine)' : 'var(--color-surface)',");
  content = content.replace('border-abyss/10 bg-aqua-soft', 'border-border bg-aqua-soft');
  return content;
});

await update('apps/web/src/components/CreatureMark.tsx', (content) => {
  const start = content.indexOf("const WASHES:");
  const end = content.indexOf("\n\nconst CATEGORY_ICON", start);
  if (start < 0 || end < 0) throw new Error('Could not find CreatureMark washes');
  content = `${content.slice(0, start)}type Wash = { from: string; to: string; foreground: string };\n\nconst WASHES: Wash[] = [\n  {\n    from: 'var(--color-aqua-soft)',\n    to: 'var(--color-lagoon)',\n    foreground: 'text-abyss/85',\n  },\n  {\n    from: 'var(--color-lagoon)',\n    to: 'var(--color-aqua-soft)',\n    foreground: 'text-abyss/85',\n  },\n  {\n    from: 'var(--color-marine)',\n    to: 'var(--color-abyss)',\n    foreground: 'text-white/90',\n  },\n  {\n    from: 'var(--color-abyss)',\n    to: 'var(--color-marine)',\n    foreground: 'text-white/90',\n  },\n];${content.slice(end)}`;
  content = replaceRequired(content, 'function washFor(id: string): [string, string] {', 'function washFor(id: string): Wash {');
  content = replaceRequired(content, "  return WASHES[hash % WASHES.length] as [string, string];", "  return WASHES[hash % WASHES.length] as Wash;");
  content = replaceRequired(content, '  const [from, to] = washFor(creature.id);', '  const { from, to, foreground } = washFor(creature.id);');
  content = replaceRequired(content, 'className="font-black tracking-tight text-white/90"', 'className={`font-black tracking-tight ${foreground}`}');
  content = replaceRequired(content, 'className="text-white/85"', 'className={foreground}');
  return content;
});

await update('apps/web/src/auth/SignInScreen.tsx', (content) =>
  replaceRequired(content, 'className="mt-4 text-sm font-bold text-abyss"', 'className="mt-4 text-sm font-bold text-danger"'),
);

await update('apps/web/src/auth/PendingApprovalScreen.tsx', (content) =>
  replaceRequired(content, 'className="mt-3 text-sm font-bold text-abyss"', 'className="mt-3 text-sm font-bold text-danger"'),
);

await update('apps/web/src/screens/Home.tsx', (content) => {
  content = replaceRequired(content, 'className="inline-flex items-center gap-1 text-sm font-bold text-abyss"', 'className="inline-flex items-center gap-1 text-sm font-bold text-abyss/75 underline decoration-marine/45 underline-offset-4"');
  return content;
});

await update('apps/web/src/screens/DiveDetail.tsx', (content) => {
  content = replaceRequired(content, '  CoralAction,', '  DangerAction,');
  content = replaceRequired(content, '<Card className="bg-canvas p-5">', '<Card className="bg-shell p-5">');
  content = content.replaceAll('border-coral/40 bg-coral-soft', 'border-danger/25 bg-danger-soft');
  content = replaceRequired(content, '<CoralAction type="button" onClick={remove} disabled={pending}>', '<DangerAction type="button" onClick={remove} disabled={pending}>');
  content = replaceRequired(content, '</CoralAction>', '</DangerAction>');
  content = replaceRequired(content, 'rounded-full px-4 text-sm font-bold text-abyss"', 'rounded-full px-4 text-sm font-bold text-danger"');
  return content;
});

await update('apps/web/src/screens/DataAndBackup.tsx', (content) => {
  content = content.replaceAll('bg-lagoon/12 text-abyss', 'bg-aqua-soft text-abyss');
  content = replaceRequired(content, 'className="mt-3 rounded-field bg-coral-soft px-4 py-3 text-sm leading-relaxed font-bold text-abyss"', 'className="mt-3 rounded-field border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-relaxed font-bold text-danger"');
  content = replaceRequired(content, 'className="mt-3 flex items-start gap-2 rounded-field bg-lagoon/10 px-4 py-3 text-sm leading-relaxed font-bold text-success"', 'className="mt-3 flex items-start gap-2 rounded-field bg-success-soft px-4 py-3 text-sm leading-relaxed font-bold text-success"');
  content = replaceRequired(content, 'className="mt-2 text-xs leading-relaxed font-bold text-abyss"', 'className="mt-2 text-xs leading-relaxed font-bold text-danger"');
  content = content.replaceAll('border-coral/20 bg-coral-soft/35', 'border-danger/20 bg-danger-soft/60');
  content = content.replaceAll('mt-3 border-coral/25 text-abyss', 'mt-3 border-danger/30 text-danger');
  return content;
});

await update('apps/web/src/features/log-dive/steps.tsx', (content) => {
  content = replaceRequired(content, 'bg-coral px-4 text-sm font-black text-white', 'bg-coral px-4 text-sm font-black text-abyss');
  content = replaceRequired(content, "'bg-sun text-white'", "'bg-sun text-abyss'");
  content = content.replaceAll('border-coral/40 bg-coral-soft', 'border-danger/25 bg-danger-soft');
  return content;
});

await update('apps/web/src/screens/Atlas.tsx', (content) => {
  content = content.replaceAll('bg-abyss"', 'bg-marine"');
  content = content.replaceAll('border-abyss bg-white', 'border-marine bg-white');
  content = content.replaceAll('bg-aqua-soft px-2 py-0.5 text-[10px] font-black tracking-widest text-marine', 'bg-aqua-soft px-2 py-0.5 text-[10px] font-black tracking-widest text-abyss');
  return content;
});

for (const path of ['apps/web/src/screens/Journal.tsx', 'apps/web/src/screens/CreatureDetail.tsx']) {
  await update(path, (content) => content.replaceAll('text-marine uppercase', 'text-abyss/70 uppercase'));
}

await update('apps/web/vite.config.ts', (content) =>
  content.replaceAll("'#F2FBFC'", "'#F3FAFA'"),
);
await update('apps/web/index.html', (content) =>
  content.replaceAll('#F2FBFC', '#F3FAFA'),
);

await update('tools/brand/build.mjs', (content) => {
  content = replaceRequired(content, ' * The mark is a coral trident rising through the ocean gradient and the', ' * The existing trident geometry is retained while its colour follows Sunlit Reef.');
  content = content.replace(' * bathymetric swell used across the app\'s memory surfaces, so the installed\n * icon reads as the same product as the screens behind it.\n', ' * The installed icon therefore matches the live product without prejudging a future\n * icon-concept redesign.\n');
  content = content.replaceAll('#118AB2', '#087EA4');
  content = content.replaceAll('#084C61', '#05323F');
  content = content.replaceAll('#7FD8E8', '#34B6A4');
  content = content.replaceAll('#FF6B6B', '#F7735C');
  content = replaceRequired(content, '      <stop offset="0.55" stop-color="#05323F"/>\n      <stop offset="1" stop-color="#05323F"/>', '      <stop offset="1" stop-color="#05323F"/>');
  return content;
});

const brandDoc = `# Poseidon brand system — Sunlit Reef

This document is the canonical colour authority for Poseidon. Application code uses product-role tokens from \`apps/web/src/index.css\`; raw brand hex values should not be scattered through components.

## Locked palette

| Swatch | Hex | Role |
| --- | --- | --- |
| Jet Black | \`#05323F\` | Primary ink, depth and grounding |
| Cerulean | \`#087EA4\` | Primary ocean and primary action |
| Ocean Mist | \`#34B6A4\` | Supporting aquatic / sea-glass accent |
| Vibrant Coral | \`#F7735C\` | Expressive interaction, selection and delight |
| Tuscan Sun | \`#EFC15E\` | Sunlight, highlight creature and special emphasis |
| Mint Cream | \`#F3FAFA\` | Cool default application canvas |
| Floral White | \`#FFF8EC\` | Warm memory/detail surface |

Pure white is a neutral raised surface, not an eighth expressive brand colour.

The hierarchy is Jet Black for legibility and depth, Cerulean for ocean/action, Coral for signature expression, Ocean Mist for support, Tuscan Sun sparingly for highlight, then Mint Cream / Floral White / white as the environmental surface system. Creature artwork remains the main source of chromatic variety.

## Application tokens

The locked anchors map to \`abyss\`, \`marine\`, \`lagoon\`, \`coral\`, \`sun\`, \`canvas\` and \`shell\`. Supporting functional tints are deliberately small: \`frame #DDEEEE\`, \`border #D3E7E6\`, \`aqua-soft #E5F5F3\`, \`coral-soft #FFF0EC\` and \`sun-soft #FFF6DE\`.

Functional status colours are separate from the brand palette: \`danger #A73931\` / \`danger-soft #FCEDEB\`, and \`success #176B55\` / \`success-soft #E7F5EF\`. Do not make Coral mean danger or Ocean Mist mean success.

## Contrast and foreground rules

Important WCAG contrast relationships for the exact anchors:

| Pair | Approx. contrast | Use |
| --- | ---: | --- |
| white on Cerulean | 4.64:1 | normal control text/icons |
| Jet Black on Ocean Mist | 5.46:1 | normal text |
| Jet Black on Coral | 4.93:1 | normal text |
| Jet Black on Tuscan Sun | 8.12:1 | normal text |
| Jet Black on Mint Cream / Floral White | ~13:1 | primary and secondary copy |
| white on Ocean Mist | 2.51:1 | **do not use for normal text** |
| white on Coral | 2.78:1 | **do not use for normal text** |
| white on Tuscan Sun | 1.69:1 | **do not use for text** |

Cerulean text is safe on pure white but is slightly below 4.5:1 on the pale brand canvases, so small labels on Mint Cream or Floral White use Jet Black (often with opacity for hierarchy). Ocean Mist is an accent/fill, not small secondary copy. Selection/focus also needs shape, ring, iconography or state attributes; colour alone is never enough.

## Surfaces and composition

- **Mint Cream** is the default cool application canvas.
- **Floral White** is reserved for warm memory/detail moments such as written dive memories; it should not alternate with Mint Cream decoratively.
- **White** is the neutral raised-card surface.
- A typical screen should read as cool ocean + pale surface first, Coral second and Tuscan Sun only occasionally.

## Gradients

Use few gradients. The standard deep-ocean field is **Cerulean → Jet Black**. A shallow **Ocean Mist → Cerulean** treatment is allowed only where it improves composition. Do not build seven-stop/rainbow gradients; Coral and Tuscan Sun are normally discrete marks.

## Current icon

The current generated trident keeps its geometry. Its field is Cerulean → Jet Black, the trident is Vibrant Coral, and Ocean Mist may carry subtle bathymetric detail. Maskable safe zones and small-launcher legibility remain required. Final icon-concept exploration is separate work.

## Do / don't

- **Do:** use Cerulean + white for primary actions; Coral + Jet Black for expressive fills; Tuscan Sun + Jet Black for highlights; semantic danger for delete/refusal states.
- **Do:** keep creature artwork visually dominant and use pale surfaces around it.
- **Don't:** use white text on Coral, Ocean Mist or Tuscan Sun; use Ocean Mist for small body/eyebrow text; reuse Coral for errors; scatter raw brand hex values through UI components; recolour creature artwork to match the interface.
`;
await write('docs/BRAND.md', brandDoc);

await update('PRODUCT.md', (content) => {
  const old = `## Visual character\n\nPoseidon should be:\n\n- light mode first;\n- rich in ocean blues;\n- supported by aquatic greens;\n- accented with coral, tropical fish and reef colours;\n- fluid and alive;\n- polished and tactile;\n- playful without becoming childish;\n- premium without becoming sterile.\n\nCreature artwork should feel collectible and desirable in its own right.\n`;
  const next = `## Visual character\n\nPoseidon's canonical colour system is **Sunlit Reef**, documented in [\`docs/BRAND.md\`](docs/BRAND.md). The product is light-mode first: Jet Black grounds typography, Cerulean carries primary ocean/action, Coral provides restrained signature expression, Ocean Mist supports aquatic surfaces, and Tuscan Sun is reserved for sunlight/highlight emphasis. Mint Cream, Floral White and neutral white form the cool/warm/raised surface system.\n\nCreature artwork should feel collectible and desirable in its own right and remains the main source of chromatic variety. The interface should be polished and tactile, playful without becoming childish, and premium without becoming sterile.\n`;
  return replaceRequired(content, old, next, 'PRODUCT visual character');
});

await update('docs/PRD.md', (content) => {
  const old = `## 7.2 Poseidon character\n\n- light mode first;\n- rich ocean blues;\n- aquatic greens;\n- coral/tropical accent colours;\n- generous breathing room;\n- tactile selection states;\n- polished creature artwork;\n- premium but playful;\n- alive rather than technical.\n\nThe integrated application’s established visual language is documented in \`docs/APPLICATION.md\` and should not be casually replaced.\n`;
  const next = `## 7.2 Poseidon character\n\nPoseidon uses the locked **Sunlit Reef** colour system in [\`BRAND.md\`](BRAND.md): cool Mint Cream environmental canvas, Jet Black legibility/depth, Cerulean primary ocean/action, Coral expressive selection/delight, Ocean Mist support, and rare Tuscan Sun highlight. Floral White provides selective warm memory/detail surfaces. Creature artwork remains the primary source of visual variety.\n\nThe integrated application’s established layout and interaction language is documented in \`docs/APPLICATION.md\` and should not be casually replaced.\n`;
  return replaceRequired(content, old, next, 'PRD visual character');
});

await update('docs/APPLICATION.md', (content) => {
  content = replaceRequired(content, "| Tailwind CSS v4 | Design tokens live in one CSS file as named product roles (`canvas`, `ocean`, `marine`, `lagoon`, `coral`), not as hex values scattered through components. |", "| Tailwind CSS v4 | Sunlit Reef design tokens live in one CSS authority as named product roles (`canvas`, `shell`, `abyss`, `marine`, `lagoon`, `coral`, `sun`) plus narrowly scoped supporting/semantic tokens. See `docs/BRAND.md`. |");
  content = replaceRequired(content, "Bright light-mode aquatic canvas; deep ocean teal typography; coral as the\ninteraction accent; mint supporting accents; generous rounded geometry;\ntranslucent sticky chrome; the central coral Log Dive action; rich visual\ncreature tiles; the coral-ring-plus-check selection feedback; a large\nmemory-oriented dive detail; energetic but uncluttered mobile hierarchy.", "Bright light-mode aquatic composition; the locked Sunlit Reef role hierarchy from\n`docs/BRAND.md`; generous rounded geometry; translucent sticky chrome; the\ncentral Coral Log Dive action; rich visual creature tiles; ring-plus-check\nselection feedback; a large memory-oriented dive detail; energetic but\nuncluttered mobile hierarchy.");
  content = content.replace('centred column against the tide-blue frame', 'centred column against the pale aquatic frame');
  return content;
});

await update('AGENTS.md', (content) => {
  content = replaceRequired(content, "4. `docs/APPLICATION.md`\n5. `docs/CONTENT_AND_ASSETS.md`\n6. `docs/UI_DATA_CONTRACT.md`", "4. `docs/APPLICATION.md`\n5. `docs/BRAND.md`\n6. `docs/CONTENT_AND_ASSETS.md`\n7. `docs/UI_DATA_CONTRACT.md`");
  const old = `The established character is light, aquatic, saturated and alive:\n\n- rich ocean blues;\n- aquatic greens;\n- coral/tropical accents;\n- polished tactile interactions;\n- creature art as a primary source of colour and personality;\n- phone-first hierarchy rather than a desktop analytics dashboard.\n`;
  const next = `The canonical colour authority is \`docs/BRAND.md\` (Sunlit Reef). Keep the interface light and aquatic, use the locked role hierarchy rather than ad-hoc hues, keep Coral separate from semantic danger, reserve Tuscan Sun for highlight, and let creature art remain the primary source of colour and personality. Preserve polished tactile interactions and phone-first hierarchy rather than a desktop analytics dashboard.\n`;
  return replaceRequired(content, old, next, 'AGENTS visual section');
});

const brandTest = `import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = fileURLToPath(new URL('.', import.meta.url));
const webRoot = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

const BRAND = {
  abyss: '#05323F',
  marine: '#087EA4',
  lagoon: '#34B6A4',
  coral: '#F7735C',
  sun: '#EFC15E',
  canvas: '#F3FAFA',
  shell: '#FFF8EC',
} as const;

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(a: string, b: string): number {
  const [bright, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (bright! + 0.05) / (dark! + 0.05);
}

function sourceText(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceText(path);
      return ['.ts', '.tsx', '.css'].includes(extname(path)) ? readFileSync(path, 'utf8') : '';
    })
    .join('\n');
}

describe('Sunlit Reef brand contract', () => {
  it('keeps the locked anchors in the single CSS token authority', () => {
    const css = readFileSync(join(webRoot, 'src/index.css'), 'utf8');
    for (const [token, value] of Object.entries(BRAND)) {
      expect(css).toContain(\`--color-\${token}: \${value};\`);
    }
  });

  it('keeps required normal-text pairings at WCAG AA contrast', () => {
    expect(contrast('#FFFFFF', BRAND.marine)).toBeGreaterThanOrEqual(4.5);
    for (const background of [BRAND.lagoon, BRAND.coral, BRAND.sun, BRAND.canvas, BRAND.shell]) {
      expect(contrast(BRAND.abyss, background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast('#FFFFFF', '#A73931')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#176B55', '#E7F5EF')).toBeGreaterThanOrEqual(4.5);
  });

  it('does not reintroduce retired palette tokens or unsafe white-on-brand fills', () => {
    const source = sourceText(join(webRoot, 'src'));
    for (const retired of ['tide', 'foam', 'shallows', 'ocean', 'reef', 'sand']) {
      expect(source).not.toMatch(new RegExp(\`(?:bg|text|border|ring|from|via|to)-\${retired}(?:[/\\s\"'\\\`]|$)\`));
    }
    for (const fill of ['coral', 'lagoon', 'sun']) {
      expect(source).not.toMatch(new RegExp(\`bg-\${fill}[^\"'\\\`]*text-white\`));
    }
    expect(source).not.toContain('text-lagoon');
  });

  it('keeps obsolete expressive hex values out of live brand/UI code', () => {
    const live = [
      sourceText(join(webRoot, 'src')),
      readFileSync(join(webRoot, 'vite.config.ts'), 'utf8'),
      readFileSync(join(webRoot, 'index.html'), 'utf8'),
      readFileSync(join(repoRoot, 'tools/brand/build.mjs'), 'utf8'),
    ].join('\n').toUpperCase();
    for (const old of ['#F2FBFC', '#118AB2', '#084C61', '#17C3B2', '#06D6A0', '#FF6B6B', '#F2B21E']) {
      expect(live).not.toContain(old);
    }
  });

  it('keeps PWA chrome and icon generation on the locked palette', () => {
    const vite = readFileSync(join(webRoot, 'vite.config.ts'), 'utf8');
    const html = readFileSync(join(webRoot, 'index.html'), 'utf8');
    const generator = readFileSync(join(repoRoot, 'tools/brand/build.mjs'), 'utf8');
    expect(vite.match(/#F3FAFA/g)).toHaveLength(2);
    expect(html).toContain('content="#F3FAFA"');
    for (const value of [BRAND.marine, BRAND.abyss, BRAND.lagoon, BRAND.coral]) {
      expect(generator).toContain(value);
    }
  });
});
`;
await write('apps/web/test/brand.test.ts', brandTest);

await update('package.json', (content) => {
  const pkg = JSON.parse(content);
  pkg.scripts['brand:build'] = 'node tools/brand/build.mjs';
  pkg.scripts['verify:brand'] = 'npm run brand:build && git diff --exit-code -- apps/web/public/icons';
  pkg.scripts.gate = 'npm run check:assets && npm run check && npm run verify:brand && npm run build && npm run test:pwa && npm run verify:field --workspace @poseidon/web';
  return `${JSON.stringify(pkg, null, 2)}\n`;
});

console.log('[issue-21] Sunlit Reef migration staged');
