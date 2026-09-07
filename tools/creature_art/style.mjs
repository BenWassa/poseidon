/**
 * Poseidon creature art — shared style kit.
 *
 * The style reference pack required by docs/CONTENT_AND_ASSETS.md section 9:
 * flat stylised vector marine life on a transparent square canvas, two-tone
 * shading, bold silhouettes that stay readable at 192px, consistent
 * right-facing orientation, and a saturated palette that animates the light
 * aquatic product surface without becoming childish.
 *
 * Every creature is composed from these primitives so the collection reads as
 * one set rather than sixteen unrelated drawings.
 */

export const CANVAS = 1024;

/** Shared shading opacities keep the whole set consistently lit. */
export const SHADE = { deep: 0.22, soft: 0.13, light: 0.28 };

export const INK = '#0B2F3E';

/** White sclera, dark pupil, single highlight. Used by every creature. */
export function eye(cx, cy, r = 22, pupil = INK) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF"/>
    <circle cx="${cx + r * 0.12}" cy="${cy + r * 0.04}" r="${r * 0.58}" fill="${pupil}"/>
    <circle cx="${cx + r * 0.46}" cy="${cy - r * 0.42}" r="${r * 0.2}" fill="#FFFFFF" opacity="0.95"/>
  `;
}

/** A soft mouth line. */
export function mouth(d, width = 10, color = INK, opacity = 0.55) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;
}

/** Belly/back shading drawn inside a clipped body. */
export function shade(d, color = INK, opacity = SHADE.soft) {
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

export function highlight(d, opacity = SHADE.light) {
  return `<path d="${d}" fill="#FFFFFF" opacity="${opacity}"/>`;
}

/** Repeatable spot field, clipped to the body. */
export function spots(points, r, color, opacity = 0.85) {
  return points
    .map(([cx, cy, scale = 1]) => `<circle cx="${cx}" cy="${cy}" r="${r * scale}" fill="${color}" opacity="${opacity}"/>`)
    .join('');
}

/**
 * Wraps composed art in the canonical transparent square document.
 * The pipeline in tools/creature_assets owns everything downstream of this.
 */
export function document_(title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}" role="img" aria-label="${title}">
  <title>${title}</title>
${body}
</svg>`;
}
