from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ICON_DIR = ROOT / 'apps' / 'web' / 'public' / 'icons'
EXPECTED = {
    'favicon-32.png': (32, 32),
    'favicon-64.png': (64, 64),
    'apple-touch-icon.png': (180, 180),
    'icon-192.png': (192, 192),
    'icon-512.png': (512, 512),
    'icon-maskable-512.png': (512, 512),
}


def main() -> None:
    for filename, expected_size in EXPECTED.items():
        path = ICON_DIR / filename
        if not path.exists():
            raise SystemExit(f'Missing generated brand icon: {filename}')
        with Image.open(path) as image:
            if image.format != 'PNG':
                raise SystemExit(f'{filename} must be PNG, got {image.format}.')
            if image.size != expected_size:
                raise SystemExit(
                    f'{filename} must be {expected_size[0]}x{expected_size[1]}, got {image.size}.'
                )
            if 'transparency' in image.info or image.mode in {'LA', 'RGBA'}:
                raise SystemExit(f'{filename} must be opaque for launcher compatibility.')
    print('[brand] app-icon dimensions, format and opacity verified')


if __name__ == '__main__':
    main()
