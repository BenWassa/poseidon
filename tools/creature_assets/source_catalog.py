from __future__ import annotations

import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
from typing import Any, Iterable

from PIL import Image, UnidentifiedImageError

from .pipeline import (
    MODE_OPAQUE_SCENE,
    MODE_TRANSPARENT_SPECIMEN,
    SOURCE_MODES,
    AssetPipelineError,
    _validate_creature_id,
    ingest,
)

CATALOG_SCHEMA_VERSION = 1
EDITORIAL_STATES = {"keep", "provisional", "remake"}
IDENTITY_LEVELS = {"high", "medium", "low"}
BINARY_IMPORT_STATES = {"pending", "complete"}
SHA256_PATTERN = re.compile(r"^[a-f0-9]{64}$")
CANDIDATE_NAME_PATTERN = re.compile(r"^candidate-v[1-9][0-9]*\.webp$")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AssetPipelineError(f"Broken JSON: {path}: {exc}") from exc


def _require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def _content_creature_ids(repo_root: Path) -> set[str]:
    ids: set[str] = set()
    content_root = repo_root / "content"
    if not content_root.exists():
        return ids
    for path in sorted(content_root.glob("**/creatures/*.json")):
        try:
            data = _load_json(path)
        except AssetPipelineError:
            continue
        if not isinstance(data, dict):
            continue
        creatures = data.get("creatures")
        if not isinstance(creatures, list):
            continue
        for creature in creatures:
            if isinstance(creature, dict) and isinstance(creature.get("id"), str):
                ids.add(creature["id"])
    return ids


def _validate_candidate_file(
    path: Path,
    entry: dict[str, Any],
    errors: list[str],
) -> None:
    if not path.is_file():
        errors.append(f"Missing source candidate: {path}")
        return
    try:
        with Image.open(path) as image:
            image.load()
            _require(image.format == "WEBP", f"Source candidate is not WebP: {path}", errors)
            _require(image.size == (1024, 1024), f"Source candidate must be 1024x1024: {path}", errors)
            mode = entry.get("ingestMode")
            if mode == MODE_OPAQUE_SCENE and "A" in image.getbands():
                _require(
                    image.getchannel("A").getextrema() == (255, 255),
                    f"Opaque-scene source candidate contains transparency: {path}",
                    errors,
                )
            if mode == MODE_TRANSPARENT_SPECIMEN:
                _require(
                    "A" in image.getbands(),
                    f"Transparent/specimen source candidate has no alpha channel: {path}",
                    errors,
                )
    except (UnidentifiedImageError, OSError) as exc:
        errors.append(f"Unreadable source candidate {path}: {exc}")
        return

    actual_bytes = path.stat().st_size
    actual_sha = _sha256(path)
    _require(entry.get("bytes") == actual_bytes, f"Source byte-size metadata mismatch: {path}", errors)
    _require(entry.get("sha256") == actual_sha, f"Source SHA-256 metadata mismatch: {path}", errors)


def validate_source_catalog(
    catalog_path: Path,
    repo_root: Path,
    *,
    allow_pending: bool = False,
) -> list[str]:
    catalog_path = catalog_path.resolve()
    repo_root = repo_root.resolve()
    errors: list[str] = []
    if not catalog_path.is_file():
        return [f"Source catalog does not exist: {catalog_path}"]

    try:
        catalog = _load_json(catalog_path)
    except AssetPipelineError as exc:
        return [str(exc)]
    if not isinstance(catalog, dict):
        return [f"Source catalog must contain a JSON object: {catalog_path}"]

    _require(catalog.get("schemaVersion") == CATALOG_SCHEMA_VERSION, "Unsupported source catalog schemaVersion.", errors)
    _require(isinstance(catalog.get("libraryId"), str) and bool(catalog.get("libraryId")), "Missing source catalog libraryId.", errors)
    _require(isinstance(catalog.get("styleFamily"), str) and bool(catalog.get("styleFamily")), "Missing source catalog styleFamily.", errors)

    import_status = catalog.get("binaryImportStatus")
    _require(import_status in BINARY_IMPORT_STATES, "binaryImportStatus must be 'pending' or 'complete'.", errors)
    if import_status == "pending" and not allow_pending:
        errors.append("Source binary import is still pending; all cataloged candidates must be present before this gate can pass.")

    policy = catalog.get("policy")
    if not isinstance(policy, dict):
        errors.append("Missing/invalid source catalog policy block.")
    else:
        _require(policy.get("runtimeRoot") == "assets/creatures", "policy.runtimeRoot must remain assets/creatures.", errors)
        _require(policy.get("sourceRoot") == "assets/source/creatures", "policy.sourceRoot must remain assets/source/creatures.", errors)
        _require(policy.get("runtimeMayImportSource") is False, "policy.runtimeMayImportSource must be false.", errors)

    provenance = catalog.get("provenance")
    if not isinstance(provenance, dict):
        errors.append("Missing/invalid source catalog provenance block.")
    else:
        for key in ("generator", "generatedOn", "batch"):
            _require(isinstance(provenance.get(key), str) and bool(provenance.get(key)), f"Missing provenance.{key}.", errors)

    assets = catalog.get("assets")
    if not isinstance(assets, list) or not assets:
        errors.append("Source catalog assets must be a non-empty list.")
        return sorted(set(errors))

    content_ids = _content_creature_ids(repo_root)
    seen_ids: set[str] = set()
    seen_paths: set[str] = set()
    status_counts = {state: 0 for state in EDITORIAL_STATES}

    for index, raw_entry in enumerate(assets):
        label = f"assets[{index}]"
        if not isinstance(raw_entry, dict):
            errors.append(f"{label} must be an object.")
            continue
        entry = raw_entry
        candidate_id = entry.get("id")
        if not isinstance(candidate_id, str):
            errors.append(f"{label}.id must be a string.")
            continue
        try:
            _validate_creature_id(candidate_id)
        except AssetPipelineError as exc:
            errors.append(f"{label}.id: {exc}")
        if candidate_id in seen_ids:
            errors.append(f"Duplicate source candidate ID '{candidate_id}'.")
        seen_ids.add(candidate_id)

        name = entry.get("name")
        _require(isinstance(name, str) and bool(name.strip()), f"{label}.name must be non-empty.", errors)

        creature_id = entry.get("creatureId")
        if creature_id is not None:
            if not isinstance(creature_id, str):
                errors.append(f"{label}.creatureId must be a string or null.")
            else:
                try:
                    _validate_creature_id(creature_id)
                except AssetPipelineError as exc:
                    errors.append(f"{label}.creatureId: {exc}")
                if content_ids and creature_id not in content_ids:
                    errors.append(
                        f"{label}.creatureId '{creature_id}' is not present in repository creature content; use null for source-only candidates."
                    )

        status = entry.get("status")
        _require(status in EDITORIAL_STATES, f"{label}.status must be keep/provisional/remake.", errors)
        if status in status_counts:
            status_counts[status] += 1

        identity = entry.get("identity")
        _require(identity in IDENTITY_LEVELS, f"{label}.identity must be high/medium/low.", errors)
        score = entry.get("score")
        _require(
            isinstance(score, (int, float)) and not isinstance(score, bool) and 0 <= score <= 10,
            f"{label}.score must be numeric from 0 to 10.",
            errors,
        )
        qa_note = entry.get("qaNote")
        _require(isinstance(qa_note, str) and bool(qa_note.strip()), f"{label}.qaNote must be non-empty.", errors)

        mode = entry.get("ingestMode")
        _require(mode in SOURCE_MODES, f"{label}.ingestMode must be explicit and supported.", errors)

        rel_path = entry.get("path")
        if not isinstance(rel_path, str):
            errors.append(f"{label}.path must be a string.")
            continue
        if rel_path in seen_paths:
            errors.append(f"Duplicate source candidate path '{rel_path}'.")
        seen_paths.add(rel_path)
        candidate_path = Path(rel_path)
        expected_parent = Path("assets/source/creatures") / candidate_id
        _require(candidate_path.parent == expected_parent, f"{label}.path must live under {expected_parent}/.", errors)
        _require(bool(CANDIDATE_NAME_PATTERN.fullmatch(candidate_path.name)), f"{label}.path must end in candidate-vN.webp.", errors)

        sha = entry.get("sha256")
        size_bytes = entry.get("bytes")
        if import_status == "complete":
            _require(isinstance(sha, str) and bool(SHA256_PATTERN.fullmatch(sha)), f"{label}.sha256 must be a SHA-256 when import is complete.", errors)
            _require(isinstance(size_bytes, int) and size_bytes > 0, f"{label}.bytes must be positive when import is complete.", errors)
            _validate_candidate_file(repo_root / candidate_path, entry, errors)
        else:
            _require(sha is None or (isinstance(sha, str) and bool(SHA256_PATTERN.fullmatch(sha))), f"{label}.sha256 must be null or SHA-256 while pending.", errors)
            _require(size_bytes is None or (isinstance(size_bytes, int) and size_bytes > 0), f"{label}.bytes must be null or positive while pending.", errors)
            if (repo_root / candidate_path).is_file():
                _validate_candidate_file(repo_root / candidate_path, entry, errors)

    summary = catalog.get("summary")
    if isinstance(summary, dict):
        _require(summary.get("total") == len(assets), "summary.total does not match catalog assets.", errors)
        for state in EDITORIAL_STATES:
            _require(summary.get(state) == status_counts[state], f"summary.{state} does not match catalog assets.", errors)

    return sorted(set(errors))


def _validate_candidate_bytes(data: bytes, rel_path: str, entry: dict[str, Any]) -> None:
    try:
        with Image.open(io.BytesIO(data)) as image:
            image.load()
            if image.format != "WEBP":
                raise AssetPipelineError(f"Source candidate is not WebP: {rel_path}")
            if image.size != (1024, 1024):
                raise AssetPipelineError(f"Source candidate must be 1024x1024: {rel_path}")
            mode = entry.get("ingestMode")
            if mode == MODE_OPAQUE_SCENE and "A" in image.getbands():
                if image.getchannel("A").getextrema() != (255, 255):
                    raise AssetPipelineError(f"Opaque-scene source candidate contains transparency: {rel_path}")
            if mode == MODE_TRANSPARENT_SPECIMEN and "A" not in image.getbands():
                raise AssetPipelineError(f"Transparent/specimen source candidate has no alpha channel: {rel_path}")
    except (UnidentifiedImageError, OSError) as exc:
        raise AssetPipelineError(f"Unreadable source candidate {rel_path}: {exc}") from exc


def _detect_single_root_prefix(names: list[str]) -> str | None:
    """If every archive member shares one top-level directory, return that directory's prefix.

    Real-world export tools (branch/zip exports, editorial handoffs) commonly wrap an
    entire tree in one root folder. Detecting it lets the exact, hash-verified bundle be
    imported without repackaging it, while every other validation stays unchanged.
    """
    root_segment: str | None = None
    for name in names:
        parts = name.split("/", 1)
        if len(parts) != 2 or not parts[0]:
            return None
        if root_segment is None:
            root_segment = parts[0]
        elif parts[0] != root_segment:
            return None
    return f"{root_segment}/" if root_segment else None


def import_source_bundle(bundle_path: Path, catalog_path: Path, repo_root: Path) -> Path:
    bundle_path = bundle_path.resolve()
    catalog_path = catalog_path.resolve()
    repo_root = repo_root.resolve()
    if not bundle_path.is_file():
        raise AssetPipelineError(f"Source bundle does not exist: {bundle_path}")
    metadata_errors = validate_source_catalog(catalog_path, repo_root, allow_pending=True)
    if metadata_errors:
        raise AssetPipelineError("Source catalog validation failed before import:\n- " + "\n- ".join(metadata_errors))
    catalog = _load_json(catalog_path)
    assets = catalog["assets"]

    try:
        archive = zipfile.ZipFile(bundle_path)
    except (OSError, zipfile.BadZipFile) as exc:
        raise AssetPipelineError(f"Source bundle is not a readable ZIP: {bundle_path}") from exc

    payloads: dict[str, bytes] = {}
    try:
        names = [info.filename for info in archive.infolist() if not info.is_dir()]
        if len(names) != len(set(names)):
            raise AssetPipelineError("Source bundle contains duplicate ZIP member names.")
        name_set = set(names)
        expected = {entry["path"] for entry in assets}
        archive_prefix = ""
        missing = sorted(expected - name_set)
        if missing:
            wrapper = _detect_single_root_prefix(names)
            if wrapper is not None:
                stripped_set = {name[len(wrapper):] for name in names if name.startswith(wrapper)}
                if not (expected - stripped_set):
                    archive_prefix = wrapper
                    missing = []
        if missing:
            raise AssetPipelineError("Source bundle is missing cataloged entries:\n- " + "\n- ".join(missing))
        for entry in assets:
            rel_path = entry["path"]
            data = archive.read(archive_prefix + rel_path)
            _validate_candidate_bytes(data, rel_path, entry)
            payloads[rel_path] = data
    finally:
        archive.close()

    # Preflight immutable source paths before writing anything. Re-import is idempotent only for identical bytes.
    for rel_path, data in payloads.items():
        target = repo_root / rel_path
        if target.exists() and target.read_bytes() != data:
            raise AssetPipelineError(
                f"Source candidate already exists with different bytes: {target}. Add a new candidate revision instead of overwriting source history."
            )

    for rel_path, data in payloads.items():
        target = repo_root / rel_path
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)

    updated = json.loads(json.dumps(catalog))
    for entry in updated["assets"]:
        data = payloads[entry["path"]]
        entry["bytes"] = len(data)
        entry["sha256"] = hashlib.sha256(data).hexdigest()
    updated["binaryImportStatus"] = "complete"

    temp_catalog = catalog_path.with_name(f".{catalog_path.name}.importing")
    temp_catalog.write_text(json.dumps(updated, indent=2) + "\n", encoding="utf-8")
    try:
        errors = validate_source_catalog(temp_catalog, repo_root, allow_pending=False)
        if errors:
            raise AssetPipelineError("Imported source catalog validation failed:\n- " + "\n- ".join(errors))
        temp_catalog.replace(catalog_path)
    except Exception:
        temp_catalog.unlink(missing_ok=True)
        raise
    return catalog_path


def promote_source_candidate(
    catalog_path: Path,
    candidate_id: str,
    repo_root: Path,
    output_root: Path,
    *,
    force: bool = False,
) -> Path:
    errors = validate_source_catalog(catalog_path, repo_root, allow_pending=False)
    if errors:
        raise AssetPipelineError("Source catalog validation failed:\n- " + "\n- ".join(errors))

    catalog = _load_json(catalog_path.resolve())
    assets = catalog["assets"]
    entry = next((item for item in assets if isinstance(item, dict) and item.get("id") == candidate_id), None)
    if entry is None:
        raise AssetPipelineError(f"Source candidate '{candidate_id}' is not present in the catalog.")
    status = entry["status"]
    if status != "keep":
        raise AssetPipelineError(
            f"Source candidate '{candidate_id}' is '{status}' and is blocked from canonical promotion."
        )
    creature_id = entry.get("creatureId")
    if not isinstance(creature_id, str):
        raise AssetPipelineError(
            f"Source candidate '{candidate_id}' has no stable content creatureId and cannot create taxonomy during promotion."
        )

    source_path = repo_root.resolve() / Path(entry["path"])
    return ingest(
        source_path,
        creature_id,
        output_root,
        force=force,
        mode=entry["ingestMode"],
    )


def raise_if_source_catalog_invalid(errors: Iterable[str]) -> None:
    collected = list(errors)
    if collected:
        raise AssetPipelineError("Source catalog validation failed:\n- " + "\n- ".join(collected))
