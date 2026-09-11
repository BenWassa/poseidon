/**
 * The product's stand-in for photography.
 *
 * Poseidon is not a photo product, so its large memory surfaces are built from
 * colour, place typography, creature artwork and this bathymetric contour
 * motif — depth lines of an imagined seabed. It is decorative, deterministic
 * and entirely local, so a dive looks finished with no photograph at all.
 */
export function AtlasMotif({
  className = '',
  seed = 0,
}: {
  className?: string;
  seed?: number;
}) {
  const offset = (seed % 5) * 14;
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5].map((ring) => {
          const spread = 26 + ring * 21;
          return (
            <path
              key={ring}
              d={`M -30 ${150 + offset - ring * 6}
                  C ${60 - ring * 4} ${100 + offset - spread * 0.28}, ${150 + ring * 5} ${196 + offset - spread * 0.5}, ${232 + ring * 3} ${132 + offset - spread * 0.34}
                  C ${300 + ring * 4} ${88 + offset - spread * 0.24}, ${370} ${140 + offset - spread * 0.42}, 430 ${104 + offset - spread * 0.3}`}
              strokeWidth={ring === 2 ? 2.2 : 1.2}
              opacity={0.16 + ring * 0.035}
            />
          );
        })}
      </g>
    </svg>
  );
}
