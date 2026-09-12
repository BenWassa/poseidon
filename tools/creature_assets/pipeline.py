from __future__ import annotations

import hashlib
import json
import re
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from PIL import Image, UnidentifiedImageError

MANIFEST_VERSION = 1
ASPECT_RATIO = 1.0
SUPPORTED_SOURCE_FORMATS = {"PNG", "WEBP"}
SOURCE_MAX_BYTES = 20 * 1024 * 1024
SOURCE_MAX_DIMENSION = 4096
ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
MODE_TRANSPARENT_SPECIMEN = "transparent-specimen"
MODE_OPAQUE_SCENE = "opaque-scene"
SOURCE_MODES = (MODE_TRANSPARENT_SPECIMEN, MODE_OPAQUE_SCENE)


@dataclass(frozen=True)
class VariantSpec:
    name: str
    size: int
    quality: int
    max_bytes: int


VARIANTS: tuple[VariantSpec, ...] = (
    VariantSpec("thumb", 192, 72, 64 * 1024),
    VariantSpec("gallery", 512, 80, 220 * 1024),
    VariantSpec("hero", 1024, 86, 700 * 1024),
)


class AssetPipelineError(RuntimeError):
    pass


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _validate_creature_id(creature_id: str) -> None:
    if not ID_PATTERN.fullmatch(creature_id):
        raise AssetPipelineError(
            "Creature ID must be lower-case and path-safe: letters, digits, '.', '_' or '-' only."
        )


def _validate_source_mode(mode: str) -> None:
    if mode not in SOURCE_MODES:
        raise AssetPipelineError(
            f"Unsupported source mode '{mode}'. Expected one of: {', '.join(SOURCE_MODES)}."
        )


def _has_transparency(image: Image.Image) -> bool:
    if "A" not in image.getbands():
        return False
    extrema = image.getchannel("A").getextrema()
    return extrema != (255, 255)


def _open_source(path: Path, mode: str) -> tuple[Image.Image, dict[str, Any]]:
    _validate_source_mode(mode)
    if not path.is_file():
        raise AssetPipelineError(f"Source image does not exist: {path}")
    source_bytes = path.stat().st_size
    if source_bytes > SOURCE_MAX_BYTES:
        raise AssetPipelineError(
            f"Source image is oversized: {source_bytes} bytes exceeds {SOURCE_MAX_BYTES}."
        )
    try:
        image = Image.open(path)
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise AssetPipelineError(f"Source image is unreadable: {path}") from exc

    source_format = (image.format or "").upper()
    if source_format not in SUPPORTED_SOURCE_FORMATS:
        image.close()
        allowed = ", ".join(sorted(SUPPORTED_SOURCE_FORMATS))
        raise AssetPipelineError(
            f"Unsupported source format '{source_format or 'unknown'}'. Supported formats: {allowed}."
        )
    if max(image.size) > SOURCE_MAX_DIMENSION:
        width, height = image.size
        image.close()
        raise AssetPipelineError(
            f"Source dimensions are oversized: {width}x{height}; max dimension is {SOURCE_MAX_DIMENSION}px."
        )

    if mode == MODE_TRANSPARENT_SPECIMEN:
        if "A" not in image.getbands():
            image.close()
            raise AssetPipelineError(
                "Transparent/specimen source must include an alpha channel for transparent artwork."
            )
        prepared = image.convert("RGBA")
        image.close()
        if prepared.getchannel("A").getbbox() is None:
            prepared.close()
            raise AssetPipelineError("Transparent/specimen source image is fully transparent.")
    else:
        if image.width != image.height:
            width, height = image.size
            image.close()
            raise AssetPipelineError(
                f"Opaque-scene source must be square; got {width}x{height}."
            )
        if _has_transparency(image):
            image.close()
            raise AssetPipelineError(
                "Opaque-scene source must be fully opaque; use transparent-specimen mode for alpha artwork."
            )
        prepared = image.convert("RGB")
        image.close()

    metadata = {
        "mode": mode,
        "format": source_format.lower(),
        "width": prepared.width,
        "height": prepared.height,
        "aspectRatio": round(prepared.width / prepared.height, 6),
        "bytes": source_bytes,
        "sha256": _sha256(path),
    }
    return prepared, metadata


def _render_variant(
    source: Image.Image,
    spec: VariantSpec,
    destination: Path,
    mode: str,
) -> dict[str, Any]:
    _validate_source_mode(mode)
    if mode == MODE_TRANSPARENT_SPECIMEN:
        working = source.copy()
        working.thumbnail((spec.size, spec.size), Image.Resampling.LANCZOS, reducing_gap=3.0)
        canvas = Image.new("RGBA", (spec.size, spec.size), (0, 0, 0, 0))
        x = (spec.size - working.width) // 2
        y = (spec.size - working.height) // 2
        canvas.alpha_composite(working, (x, y))
        working.close()
    else:
        # Opaque scenes are required to be square, so resizing preserves the reviewed composition.
        canvas = source.resize((spec.size, spec.size), Image.Resampling.LANCZOS, reducing_gap=3.0)
        if canvas.mode != "RGB":
            opaque = canvas.convert("RGB")
            canvas.close()
            canvas = opaque

    destination.parent.mkdir(parents=True, exist_ok=True)
    save_kwargs: dict[str, Any] = {
        "format": "WEBP",
        "quality": spec.quality,
        "method": 6,
        "lossless": False,
        "exif": b"",
        "xmp": b"",
        "icc_profile": None,
    }
    if mode == MODE_TRANSPARENT_SPECIMEN:
        save_kwargs["exact"] = True
    canvas.save(destination, **save_kwargs)
    canvas.close()

    size_bytes = destination.stat().st_size
    if size_bytes > spec.max_bytes:
        raise AssetPipelineError(
            f"Generated {spec.name} variant is oversized: {size_bytes} bytes exceeds {spec.max_bytes}."
        )
    return {
        "path": destination.name,
        "width": spec.size,
        "height": spec.size,
        "aspectRatio": ASPECT_RATIO,
        "bytes": size_bytes,
        "sha256": _sha256(destination),
        "mediaType": "image/webp",
    }


def _manifest_for_curated(
    creature_id: str,
    source_metadata: dict[str, Any],
    variant_metadata: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    artwork: dict[str, Any] = {
        "status": "curated",
        "aspectRatio": ASPECT_RATIO,
        "thumb": variant_metadata["thumb"]["path"],
        "gallery": variant_metadata["gallery"]["path"],
        "hero": variant_metadata["hero"]["path"],
        "variants": variant_metadata,
    }
    return {
        "version": MANIFEST_VERSION,
        "creatureId": creature_id,
        "source": source_metadata,
        "artwork": artwork,
    }


def _manifest_for_fallback(creature_id: str, status: str) -> dict[str, Any]:
    if status not in {"placeholder", "missing"}:
        raise AssetPipelineError("Fallback status must be 'placeholder' or 'missing'.")
    return {
        "version": MANIFEST_VERSION,
        "creatureId": creature_id,
        "source": None,
        "artwork": {
            "status": status,
            "aspectRatio": ASPECT_RATIO,
            "thumb": None,
            "gallery": None,
            "hero": None,
            "variants": {},
        },
    }


def _write_manifest(path: Path, manifest: dict[str, Any]) -> None:
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def ingest(
    source: Path,
    creature_id: str,
    output_root: Path,
    force: bool = False,
    mode: str = MODE_TRANSPARENT_SPECIMEN,
) -> Path:
    _validate_creature_id(creature_id)
    _validate_source_mode(mode)
    source = source.resolve()
    output_root = output_root.resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    target = output_root / creature_id
    if target.exists() and not force:
        raise AssetPipelineError(
            f"Asset directory already exists for '{creature_id}'. Re-run with --force to replace it."
        )

    image, source_metadata = _open_source(source, mode)
    staging = Path(tempfile.mkdtemp(prefix=f".{creature_id}.", dir=output_root))
    try:
        variants: dict[str, dict[str, Any]] = {}
        for spec in VARIANTS:
            variants[spec.name] = _render_variant(
                image, spec, staging / f"{spec.name}.webp", mode
            )
        image.close()
        manifest = _manifest_for_curated(creature_id, source_metadata, variants)
        _write_manifest(staging / "manifest.json", manifest)
        errors = validate_asset_directory(
            staging,
            expected_id=creature_id,
            manifest_path_override=staging / "manifest.json",
        )
        raise_if_invalid(errors)

        if target.exists():
            shutil.rmtree(target)
        staging.rename(target)
        return target / "manifest.json"
    except Exception:
        image.close()
        shutil.rmtree(staging, ignore_errors=True)
        raise


def write_fallback(creature_id: str, status: str, output_root: Path, force: bool = False) -> Path:
    _validate_creature_id(creature_id)
    output_root = output_root.resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    target = output_root / creature_id
    if target.exists() and not force:
        raise AssetPipelineError(
            f"Asset directory already exists for '{creature_id}'. Re-run with --force to replace it."
        )
    staging = Path(tempfile.mkdtemp(prefix=f".{creature_id}.", dir=output_root))
    try:
        _write_manifest(staging / "manifest.json", _manifest_for_fallback(creature_id, status))
        errors = validate_asset_directory(
            staging,
            expected_id=creature_id,
            manifest_path_override=staging / "manifest.json",
        )
        raise_if_invalid(errors)
        if target.exists():
            shutil.rmtree(target)
        staging.rename(target)
        return target / "manifest.json"
    except Exception:
        shutil.rmtree(staging, ignore_errors=True)
        raise


def _load_manifest(path: Path) -> dict[str, Any]:
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AssetPipelineError(f"Broken manifest: {path}: {exc}") from exc
    if not isinstance(manifest, dict):
        raise AssetPipelineError(f"Manifest must contain a JSON object: {path}")
    return manifest


def _require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_asset_directory(
    directory: Path,
    expected_id: str | None = None,
    manifest_path_override: Path | None = None,
) -> list[str]:
    errors: list[str] = []
    manifest_path = manifest_path_override or (directory / "manifest.json")
    if not manifest_path.is_file():
        return [f"Missing manifest: {manifest_path}"]
    try:
        manifest = _load_manifest(manifest_path)
    except AssetPipelineError as exc:
        return [str(exc)]

    creature_id = manifest.get("creatureId")
    _require(isinstance(creature_id, str), f"Missing/invalid creatureId in {manifest_path}", errors)
    if isinstance(creature_id, str):
        try:
            _validate_creature_id(creature_id)
        except AssetPipelineError as exc:
            errors.append(f"{manifest_path}: {exc}")
        if expected_id is not None:
            _require(
                creature_id == expected_id,
                f"Manifest ID '{creature_id}' does not match directory ID '{expected_id}'.",
                errors,
            )
    _require(
        manifest.get("version") == MANIFEST_VERSION,
        f"Unsupported manifest version in {manifest_path}",
        errors,
    )

    artwork = manifest.get("artwork")
    if not isinstance(artwork, dict):
        errors.append(f"Missing/invalid artwork block in {manifest_path}")
        return errors
    status = artwork.get("status")
    _require(
        status in {"curated", "placeholder", "missing"},
        f"Invalid artwork status in {manifest_path}",
        errors,
    )
    _require(
        artwork.get("aspectRatio") == ASPECT_RATIO,
        f"Artwork aspectRatio must be {ASPECT_RATIO} in {manifest_path}",
        errors,
    )

    variants = artwork.get("variants")
    _require(isinstance(variants, dict), f"Missing/invalid variants block in {manifest_path}", errors)
    if not isinstance(variants, dict):
        return errors

    if status in {"placeholder", "missing"}:
        _require(
            manifest.get("source") is None,
            f"Fallback manifest must have null source: {manifest_path}",
            errors,
        )
        _require(not variants, f"Fallback manifest must not reference variants: {manifest_path}", errors)
        for spec in VARIANTS:
            _require(
                artwork.get(spec.name) is None,
                f"Fallback '{spec.name}' reference must be null: {manifest_path}",
                errors,
            )
        return errors

    source = manifest.get("source")
    _require(isinstance(source, dict), f"Curated manifest requires source metadata: {manifest_path}", errors)
    if isinstance(source, dict):
        # Mode was added after manifest v1 shipped. Missing mode is the legacy transparent contract.
        source_mode = source.get("mode", MODE_TRANSPARENT_SPECIMEN)
        _require(
            source_mode in SOURCE_MODES,
            f"Invalid source mode in {manifest_path}",
            errors,
        )
    else:
        source_mode = MODE_TRANSPARENT_SPECIMEN

    for spec in VARIANTS:
        ref = artwork.get(spec.name)
        _require(isinstance(ref, str), f"Missing artwork.{spec.name} reference in {manifest_path}", errors)
        metadata = variants.get(spec.name)
        _require(
            isinstance(metadata, dict),
            f"Missing variants.{spec.name} metadata in {manifest_path}",
            errors,
        )
        if not isinstance(ref, str) or not isinstance(metadata, dict):
            continue
        _require(metadata.get("path") == ref, f"Broken {spec.name} path metadata in {manifest_path}", errors)
        _require(
            Path(ref).name == ref,
            f"Variant paths must be local filenames, not nested/absolute paths: {ref}",
            errors,
        )
        file_path = directory / ref
        if not file_path.is_file():
            errors.append(f"Broken reference for {spec.name}: {file_path}")
            continue
        actual_bytes = file_path.stat().st_size
        if actual_bytes > spec.max_bytes:
            errors.append(
                f"Oversized {spec.name} variant: {file_path} is {actual_bytes} bytes; max {spec.max_bytes}."
            )
        _require(metadata.get("bytes") == actual_bytes, f"Byte-size metadata mismatch for {file_path}", errors)
        _require(metadata.get("sha256") == _sha256(file_path), f"SHA-256 mismatch for {file_path}", errors)
        _require(metadata.get("width") == spec.size, f"Width metadata mismatch for {file_path}", errors)
        _require(metadata.get("height") == spec.size, f"Height metadata mismatch for {file_path}", errors)
        _require(metadata.get("aspectRatio") == ASPECT_RATIO, f"Aspect-ratio metadata mismatch for {file_path}", errors)
        _require(metadata.get("mediaType") == "image/webp", f"mediaType must be image/webp for {file_path}", errors)
        try:
            with Image.open(file_path) as rendered:
                rendered.load()
                _require(rendered.format == "WEBP", f"Variant is not WebP: {file_path}", errors)
                _require(
                    rendered.size == (spec.size, spec.size),
                    f"Variant dimensions are wrong: {file_path}",
                    errors,
                )
                if source_mode == MODE_TRANSPARENT_SPECIMEN:
                    _require("A" in rendered.getbands(), f"Variant lost alpha channel: {file_path}", errors)
                else:
                    _require(
                        not _has_transparency(rendered),
                        f"Opaque-scene variant contains transparency: {file_path}",
                        errors,
                    )
        except (UnidentifiedImageError, OSError) as exc:
            errors.append(f"Unreadable variant {file_path}: {exc}")

    return errors


def validate_root(output_root: Path) -> list[str]:
    output_root = output_root.resolve()
    if not output_root.exists():
        return [f"Asset root does not exist: {output_root}"]
    if not output_root.is_dir():
        return [f"Asset root is not a directory: {output_root}"]

    errors: list[str] = []
    seen_ids: dict[str, Path] = {}

    for child in sorted(output_root.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        manifest_path = child / "manifest.json"
        if not manifest_path.is_file():
            errors.append(f"Missing manifest: {manifest_path}")
            continue
        manifest = _load_manifest(manifest_path)
        creature_id = manifest.get("creatureId")
        if isinstance(creature_id, str):
            if creature_id in seen_ids:
                errors.append(
                    f"Duplicate creature ID '{creature_id}' in {seen_ids[creature_id]} and {manifest_path}."
                )
            else:
                seen_ids[creature_id] = manifest_path
        errors.extend(validate_asset_directory(child, expected_id=child.name))

    for manifest_path in sorted(output_root.rglob("manifest.json")):
        if manifest_path.parent.parent == output_root:
            continue
        try:
            manifest = _load_manifest(manifest_path)
        except AssetPipelineError as exc:
            errors.append(str(exc))
            continue
        creature_id = manifest.get("creatureId")
        if isinstance(creature_id, str) and creature_id in seen_ids:
            errors.append(
                f"Duplicate creature ID '{creature_id}' in {seen_ids[creature_id]} and {manifest_path}."
            )
        elif isinstance(creature_id, str):
            seen_ids[creature_id] = manifest_path

    return sorted(set(errors))


def raise_if_invalid(errors: Iterable[str]) -> None:
    collected = list(errors)
    if collected:
        raise AssetPipelineError("Asset validation failed:\n- " + "\n- ".join(collected))
