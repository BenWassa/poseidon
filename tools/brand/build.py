from __future__ import annotations

import base64
import hashlib
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = Path(__file__).resolve().parent / 'source'
OUTPUT_DIR = ROOT / 'apps' / 'web' / 'public' / 'icons'
SOURCE_SHA256 = 'c3bebef7794cb00f1987d6ac52bec98e6d8e84377551674fa640a0ba3208e028'
PALETTE_COLORS = 128
MASKABLE_SCALE = 0.82
MASKABLE_FADE = 18
TARGETS = (
    ('favicon-32.png', 32),
    ('favicon-64.png', 64),
    ('apple-touch-icon.png', 180),
    ('icon-192.png', 192),
    ('icon-512.png', 512),
)


def load_master() -> Image.Image:
    parts = sorted(SOURCE_DIR.glob('app-icon-master.b64.*'))
    if not parts:
        raise SystemExit('Poseidon app-icon source chunks are missing.')
    encoded = ''.join(part.read_text(encoding='ascii').strip() for part in parts)
    payload = base64.b64decode(encoded, validate=True)
    digest = hashlib.sha256(payload).hexdigest()
    if digest != SOURCE_SHA256:
        raise SystemExit(f'Poseidon app-icon source hash mismatch: {digest}')
    image = Image.open(BytesIO(payload)).convert('RGB')
    if image.width != image.height or image.width < 256:
        raise SystemExit(
            f'Poseidon app-icon master must be square and at least 256px, got {image.size}.'
        )
    return image


def quantized_save(image: Image.Image, path: Path) -> None:
    quantized = image.quantize(
        colors=PALETTE_COLORS,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.FLOYDSTEINBERG,
    )
    quantized.save(path, format='PNG', optimize=True)


def build_maskable(master: Image.Image) -> Image.Image:
    size = 512
    full = master.resize((size, size), Image.Resampling.LANCZOS)
    background = ImageEnhance.Brightness(
        full.filter(ImageFilter.GaussianBlur(22))
    ).enhance(0.82)

    inset_size = round(size * MASKABLE_SCALE)
    foreground = master.resize((inset_size, inset_size), Image.Resampling.LANCZOS)
    alpha = Image.new('L', (inset_size, inset_size), 255)
    pixels = alpha.load()
    for y in range(inset_size):
        for x in range(inset_size):
            distance = min(x, y, inset_size - 1 - x, inset_size - 1 - y)
            t = min(1.0, distance / MASKABLE_FADE)
            smooth = t * t * (3.0 - 2.0 * t)
            pixels[x, y] = round(255 * smooth)

    foreground_rgba = foreground.convert('RGBA')
    foreground_rgba.putalpha(alpha)
    result = background.convert('RGBA')
    offset = ((size - inset_size) // 2, (size - inset_size) // 2)
    result.alpha_composite(foreground_rgba, offset)
    return result.convert('RGB')


def main() -> None:
    master = load_master()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for filename, size in TARGETS:
        output = master.resize((size, size), Image.Resampling.LANCZOS)
        quantized_save(output, OUTPUT_DIR / filename)
        print(f'[brand] wrote {filename}')

    quantized_save(build_maskable(master), OUTPUT_DIR / 'icon-maskable-512.png')
    print('[brand] wrote icon-maskable-512.png')

    # Retired trident-source artifact. The approved diver artwork is now the
    # single app-icon authority.
    (OUTPUT_DIR / 'mark.svg').unlink(missing_ok=True)


if __name__ == '__main__':
    main()
