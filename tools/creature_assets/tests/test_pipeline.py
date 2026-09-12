from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from tools.creature_assets.pipeline import (
    MODE_OPAQUE_SCENE,
    MODE_TRANSPARENT_SPECIMEN,
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
        self._write_transparent_source(self.source)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    @staticmethod
    def _write_transparent_source(path: Path, size: int = 256) -> None:
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

    @staticmethod
    def _write_opaque_source(path: Path, size: int = 256) -> None:
        noise = Image.effect_noise((size, size), 65).convert("L")
        image = Image.merge("RGB", (noise, noise, noise))
        image.save(path, format="WEBP", quality=84, method=6)
        image.close()
        noise.close()

    def test_ingest_produces_stable_variants_manifest_and_transparency(self) -> None:
        manifest_path = ingest(self.source, "sample-ray", self.root)
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertEqual(manifest["creatureId"], "sample-ray")
        self.assertEqual(manifest["source"]["mode"], MODE_TRANSPARENT_SPECIMEN)
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
        self.assertEqual(validate_root(self.root), [])

    def test_opaque_scene_produces_same_runtime_dimensions_without_alpha_requirement(self) -> None:
        opaque = self.base / "scene.webp"
        self._write_opaque_source(opaque)
        manifest_path = ingest(opaque, "sample-ray", self.root, mode=MODE_OPAQUE_SCENE)
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertEqual(manifest["source"]["mode"], MODE_OPAQUE_SCENE)
        self.assertEqual(manifest["source"]["width"], 256)
        self.assertEqual(manifest["source"]["height"], 256)
        for spec in VARIANTS:
            with Image.open(manifest_path.parent / f"{spec.name}.webp") as rendered:
                rendered.load()
                self.assertEqual(rendered.size, (spec.size, spec.size))
                if "A" in rendered.getbands():
                    self.assertEqual(rendered.getchannel("A").getextrema(), (255, 255))
        self.assertEqual(validate_root(self.root), [])

    def test_both_modes_are_deterministic_under_pinned_toolchain(self) -> None:
        for mode in (MODE_TRANSPARENT_SPECIMEN, MODE_OPAQUE_SCENE):
            with self.subTest(mode=mode):
                source = self.source
                if mode == MODE_OPAQUE_SCENE:
                    source = self.base / "scene.webp"
                    self._write_opaque_source(source)
                root_a = self.base / f"a-{mode}"
                root_b = self.base / f"b-{mode}"
                manifest_a = ingest(source, "sample-ray", root_a, mode=mode)
                manifest_b = ingest(source, "sample-ray", root_b, mode=mode)
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

    def test_validator_accepts_legacy_manifest_without_mode_as_transparent(self) -> None:
        manifest_path = ingest(self.source, "sample-ray", self.root)
        manifest = json.loads(manifest_path.read_text())
        manifest["source"].pop("mode")
        manifest_path.write_text(json.dumps(manifest))
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

    def test_transparent_mode_still_rejects_opaque_rgb_source(self) -> None:
        opaque = self.base / "opaque.png"
        with Image.new("RGB", (32, 32), "white") as image:
            image.save(opaque, format="PNG")
        with self.assertRaisesRegex(AssetPipelineError, "must include an alpha channel"):
            ingest(opaque, "sample-ray", self.root)

    def test_opaque_scene_rejects_transparency(self) -> None:
        with self.assertRaisesRegex(AssetPipelineError, "must be fully opaque"):
            ingest(self.source, "sample-ray", self.root, mode=MODE_OPAQUE_SCENE)

    def test_opaque_scene_rejects_non_square_source(self) -> None:
        scene = self.base / "wide.webp"
        with Image.new("RGB", (1024, 900), "white") as image:
            image.save(scene, format="WEBP", quality=84)
        with self.assertRaisesRegex(AssetPipelineError, "must be square"):
            ingest(scene, "sample-ray", self.root, mode=MODE_OPAQUE_SCENE)

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
