from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from PIL import Image

from tools.creature_assets.pipeline import MODE_OPAQUE_SCENE, AssetPipelineError
from tools.creature_assets.source_catalog import import_source_bundle, promote_source_candidate, validate_source_catalog


class SourceCatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp_dir.name)
        self.catalog = self.repo / "assets/source/creatures/catalog.json"
        self.catalog.parent.mkdir(parents=True)
        content = self.repo / "content/mexican-caribbean/creatures/01.json"
        content.parent.mkdir(parents=True)
        content.write_text(json.dumps({"kind":"creatures","creatures":[{"id":"queen-angelfish"},{"id":"nurse-shark"},{"id":"bad-ray"}]}))

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def _write_scene(self, candidate_id: str) -> tuple[Path, int, str]:
        path = self.repo / f"assets/source/creatures/{candidate_id}/candidate-v1.webp"
        path.parent.mkdir(parents=True, exist_ok=True)
        image = Image.new("RGB", (1024, 1024), (42, 137, 176))
        image.save(path, format="WEBP", quality=84, method=6)
        image.close()
        data = path.read_bytes()
        return path, len(data), hashlib.sha256(data).hexdigest()

    def _catalog(self, *, complete: bool, status: str = "keep", creature_id: str | None = "queen-angelfish") -> dict:
        path, size, sha = self._write_scene("queen-angelfish")
        return {
            "schemaVersion": 1,
            "libraryId": "poseidon-creature-source-art",
            "styleFamily": "poseidon-sunlit-square-v1",
            "updatedOn": "2026-09-09",
            "binaryImportStatus": "complete" if complete else "pending",
            "summary": {"total": 1, "keep": 1 if status == "keep" else 0, "provisional": 1 if status == "provisional" else 0, "remake": 1 if status == "remake" else 0},
            "provenance": {"generator":"ChatGPT image generation","generatedOn":"2026-09-07","batch":"poseidon-creature-source-library-2026-09-07"},
            "policy": {"runtimeRoot":"assets/creatures","sourceRoot":"assets/source/creatures","runtimeMayImportSource":False,"candidateFormat":"1024x1024 WebP"},
            "assets": [{
                "id":"queen-angelfish",
                "creatureId": creature_id,
                "name":"Queen angelfish",
                "path": str(path.relative_to(self.repo)).replace("\\", "/"),
                "score":8.5,
                "status":status,
                "identity":"high",
                "ingestMode":MODE_OPAQUE_SCENE,
                "qaNote":"Recognizable candidate.",
                "bytes": size if complete else None,
                "sha256": sha if complete else None,
            }],
        }

    def test_complete_catalog_validates_files_hashes_and_content_mapping(self) -> None:
        self.catalog.write_text(json.dumps(self._catalog(complete=True)))
        self.assertEqual(validate_source_catalog(self.catalog, self.repo), [])

    def test_pending_catalog_is_only_allowed_explicitly(self) -> None:
        data = self._catalog(complete=False)
        (self.repo / data["assets"][0]["path"]).unlink()
        self.catalog.write_text(json.dumps(data))
        errors = validate_source_catalog(self.catalog, self.repo)
        self.assertTrue(any("binary import is still pending" in error for error in errors))
        self.assertEqual(validate_source_catalog(self.catalog, self.repo, allow_pending=True), [])

    def test_complete_catalog_reports_missing_source(self) -> None:
        data = self._catalog(complete=True)
        source = self.repo / data["assets"][0]["path"]
        source.unlink()
        self.catalog.write_text(json.dumps(data))
        errors = validate_source_catalog(self.catalog, self.repo)
        self.assertTrue(any("Missing source candidate" in error for error in errors))

    def test_non_null_content_mapping_must_exist(self) -> None:
        data = self._catalog(complete=True, creature_id="not-in-content")
        self.catalog.write_text(json.dumps(data))
        errors = validate_source_catalog(self.catalog, self.repo)
        self.assertTrue(any("not present in repository creature content" in error for error in errors))

    def test_import_bundle_populates_hashes_and_completes_catalog(self) -> None:
        data = self._catalog(complete=False)
        source = self.repo / data["assets"][0]["path"]
        payload = source.read_bytes()
        source.unlink()
        self.catalog.write_text(json.dumps(data))
        bundle = self.repo / "source.zip"
        with zipfile.ZipFile(bundle, "w", compression=zipfile.ZIP_STORED) as archive:
            archive.writestr(data["assets"][0]["path"], payload)
        import_source_bundle(bundle, self.catalog, self.repo)
        imported = json.loads(self.catalog.read_text())
        self.assertEqual(imported["binaryImportStatus"], "complete")
        self.assertEqual(imported["assets"][0]["bytes"], len(payload))
        self.assertEqual(imported["assets"][0]["sha256"], hashlib.sha256(payload).hexdigest())
        self.assertEqual(validate_source_catalog(self.catalog, self.repo), [])

    def test_import_bundle_refuses_missing_cataloged_member(self) -> None:
        data = self._catalog(complete=False)
        (self.repo / data["assets"][0]["path"]).unlink()
        self.catalog.write_text(json.dumps(data))
        bundle = self.repo / "source.zip"
        with zipfile.ZipFile(bundle, "w") as archive:
            archive.writestr("not-the-candidate.webp", b"bad")
        with self.assertRaisesRegex(AssetPipelineError, "missing cataloged entries"):
            import_source_bundle(bundle, self.catalog, self.repo)

    def test_keep_can_be_promoted_deliberately(self) -> None:
        self.catalog.write_text(json.dumps(self._catalog(complete=True)))
        output = self.repo / "runtime"
        manifest = promote_source_candidate(self.catalog, "queen-angelfish", self.repo, output)
        self.assertTrue(manifest.is_file())
        data = json.loads(manifest.read_text())
        self.assertEqual(data["creatureId"], "queen-angelfish")
        self.assertEqual(data["source"]["mode"], MODE_OPAQUE_SCENE)

    def test_provisional_and_remake_are_blocked(self) -> None:
        for status in ("provisional", "remake"):
            with self.subTest(status=status):
                data = self._catalog(complete=True, status=status)
                self.catalog.write_text(json.dumps(data))
                with self.assertRaisesRegex(AssetPipelineError, "blocked from canonical promotion"):
                    promote_source_candidate(self.catalog, "queen-angelfish", self.repo, self.repo / f"runtime-{status}")

    def test_source_only_keep_cannot_create_taxonomy(self) -> None:
        data = self._catalog(complete=True, creature_id=None)
        self.catalog.write_text(json.dumps(data))
        with self.assertRaisesRegex(AssetPipelineError, "cannot create taxonomy"):
            promote_source_candidate(self.catalog, "queen-angelfish", self.repo, self.repo / "runtime")

    def test_promotion_preserves_existing_runtime_without_force(self) -> None:
        self.catalog.write_text(json.dumps(self._catalog(complete=True)))
        output = self.repo / "runtime"
        promote_source_candidate(self.catalog, "queen-angelfish", self.repo, output)
        with self.assertRaisesRegex(AssetPipelineError, "--force"):
            promote_source_candidate(self.catalog, "queen-angelfish", self.repo, output)


if __name__ == "__main__":
    unittest.main()
