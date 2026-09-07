from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from tools.creature_assets.pipeline import (
    AssetPipelineError,
    VARIANTS,
    ingest,
    validate_root,
    write_fallback,
)


class AssetPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.base = Path(self.temp_dir.name)
        self.root = self.base / "assets"
        self.source = self.base / "source.png"
        self._write_source(self.source)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    @staticmethod
    def _write_source(path: Path, size: int = 1024) -> None:
        # Fast synthetic RGBA fixture; no production creature artwork is committed.
        noise = Image.effect_noise((size, size), 85).convert("L")
        alpha = Image.new("L", (size, size), 230)
        border = 24
        alpha.paste(0, (0, 0, size, border))
        alpha.paste(0, (0, size - border, size, size))
        alpha.paste(0, (0, 0, border, size))
        alpha.paste(0, (size - border, 0, size, size))
        image = Image.merge("RGBA", (noise, noise, noise, alpha))
        image.save(path, format="PNG", optimize=False)
        image.close()
        noise.close()
        alpha.close()

    def test_ingest_produces_stable_variants_manifest_and_transparency(self) -> None:
        manifest_path = ingest(self.source, "sample-ray", self.root)
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertEqual(manifest["creatureId"], "sample-ray")
        self.assertEqual(manifest["artwork"]["status"], "curated")
        self.assertEqual(manifest["artwork"]["aspectRatio"], 1.0)

        for spec in VARIANTS:
            variant_path = manifest_path.parent / f"{spec.name}.webp"
            self.assertTrue(variant_path.is_file())
            with Image.open(variant_path) as rendered:
                self.assertEqual(rendered.size, (spec.size, spec.size))
                self.assertEqual(rendered.format, "WEBP")
                self.assertIn("A", rendered.getbands())
            self.assertLessEqual(variant_path.stat().st_size, spec.max_bytes)

        source_bytes = self.source.stat().st_size
        thumb_bytes = (manifest_path.parent / "thumb.webp").stat().st_size
        gallery_bytes = (manifest_path.parent / "gallery.webp").stat().st_size
        hero_bytes = (manifest_path.parent / "hero.webp").stat().st_size
        self.assertLess(thumb_bytes, gallery_bytes)
        self.assertLess(gallery_bytes, hero_bytes)
        self.assertLess(gallery_bytes, source_bytes)
        self.assertEqual(validate_root(self.root), [])

    def test_same_input_is_deterministic_under_pinned_toolchain(self) -> None:
        root_a = self.base / "a"
        root_b = self.base / "b"
        manifest_a = ingest(self.source, "sample-ray", root_a)
        manifest_b = ingest(self.source, "sample-ray", root_b)
        self.assertEqual(manifest_a.read_bytes(), manifest_b.read_bytes())
        for spec in VARIANTS:
            self.assertEqual(
                (manifest_a.parent / f"{spec.name}.webp").read_bytes(),
                (manifest_b.parent / f"{spec.name}.webp").read_bytes(),
            )

    def test_placeholder_and_missing_states_validate_without_art(self) -> None:
        placeholder = write_fallback("unknown-eel", "placeholder", self.root)
        missing = write_fallback("unknown-ray", "missing", self.root)
        self.assertEqual(json.loads(placeholder.read_text())["artwork"]["status"], "placeholder")
        self.assertEqual(json.loads(missing.read_text())["artwork"]["status"], "missing")
        self.assertEqual(validate_root(self.root), [])

    def test_validator_reports_broken_reference(self) -> None:
        manifest_path = ingest(self.source, "sample-ray", self.root)
        (manifest_path.parent / "gallery.webp").unlink()
        errors = validate_root(self.root)
        self.assertTrue(any("Broken reference for gallery" in error for error in errors))

    def test_validator_reports_missing_manifest(self) -> None:
        stray = self.root / "orphan"
        stray.mkdir(parents=True)
        (stray / "thumb.webp").write_bytes(b"not-an-image")
        errors = validate_root(self.root)
        self.assertTrue(any("Missing manifest" in error for error in errors))

    def test_validator_reports_duplicate_id(self) -> None:
        manifest_path = ingest(self.source, "sample-ray", self.root)
        duplicate_dir = self.root / "duplicate-copy" / "nested"
        duplicate_dir.mkdir(parents=True)
        shutil.copy2(manifest_path, duplicate_dir / "manifest.json")
        errors = validate_root(self.root)
        self.assertTrue(any("Duplicate creature ID 'sample-ray'" in error for error in errors))

    def test_validator_reports_oversized_variant(self) -> None:
        manifest_path = ingest(self.source, "sample-ray", self.root)
        manifest = json.loads(manifest_path.read_text())
        thumb = manifest_path.parent / "thumb.webp"
        thumb.write_bytes(thumb.read_bytes() + b"x" * (VARIANTS[0].max_bytes + 1))
        errors = validate_root(self.root)
        self.assertTrue(any("Oversized thumb variant" in error for error in errors))

    def test_unsupported_source_format_fails(self) -> None:
        jpeg = self.base / "source.jpg"
        with Image.new("RGB", (32, 32), "white") as image:
            image.save(jpeg, format="JPEG")
        with self.assertRaisesRegex(AssetPipelineError, "Unsupported source format"):
            ingest(jpeg, "sample-ray", self.root)

    def test_opaque_png_without_alpha_fails(self) -> None:
        opaque = self.base / "opaque.png"
        with Image.new("RGB", (32, 32), "white") as image:
            image.save(opaque, format="PNG")
        with self.assertRaisesRegex(AssetPipelineError, "must include an alpha channel"):
            ingest(opaque, "sample-ray", self.root)

    def test_oversized_source_dimensions_fail(self) -> None:
        oversized = self.base / "oversized.png"
        with Image.new("RGBA", (4097, 1), (1, 2, 3, 255)) as image:
            image.save(oversized, format="PNG")
        with self.assertRaisesRegex(AssetPipelineError, "Source dimensions are oversized"):
            ingest(oversized, "sample-ray", self.root)

    def test_replace_requires_force(self) -> None:
        ingest(self.source, "sample-ray", self.root)
        with self.assertRaisesRegex(AssetPipelineError, "--force"):
            ingest(self.source, "sample-ray", self.root)
        ingest(self.source, "sample-ray", self.root, force=True)
        self.assertEqual(validate_root(self.root), [])


if __name__ == "__main__":
    unittest.main()
