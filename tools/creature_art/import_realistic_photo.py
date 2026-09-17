#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import io
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "assets/source/creatures/catalog.json"
SOURCE_ROOT = ROOT / "assets/source/creatures"
CANDIDATE_RE = re.compile(r"candidate-v([1-9][0-9]*)\.webp$")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Project-Poseidon-creature-art/1.0 (+https://github.com/BenWassa/poseidon)"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def square_crop(image: Image.Image, crop_box: list[float] | None) -> Image.Image:
    width, height = image.size
    if crop_box is not None:
        if len(crop_box) != 4 or any(not isinstance(value, (int, float)) for value in crop_box):
            raise ValueError("cropBox must contain four normalized numbers")
        left, top, right, bottom = crop_box
        if not (0 <= left < right <= 1 and 0 <= top < bottom <= 1):
            raise ValueError("cropBox values must be normalized inside 0..1")
        box = (
            round(left * width),
            round(top * height),
            round(right * width),
            round(bottom * height),
        )
        cropped = image.crop(box)
        if cropped.width != cropped.height:
            raise ValueError(f"cropBox must resolve to a square; got {cropped.width}x{cropped.height}")
        return cropped

    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def next_candidate_path(candidate_id: str) -> Path:
    folder = SOURCE_ROOT / candidate_id
    versions = []
    if folder.exists():
        for path in folder.glob("candidate-v*.webp"):
            match = CANDIDATE_RE.fullmatch(path.name)
            if match:
                versions.append(int(match.group(1)))
    version = max(versions, default=0) + 1
    return folder / f"candidate-v{version}.webp"


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("usage: import_realistic_photo.py <job.json>")

    job_path = ROOT / sys.argv[1]
    job = json.loads(job_path.read_text(encoding="utf-8"))
    candidate_id = job["id"]
    source_url = job["sourceUrl"]

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    entry = next((item for item in catalog["assets"] if item.get("id") == candidate_id), None)
    if entry is None:
        raise SystemExit(f"Unknown source candidate id: {candidate_id}")
    if entry.get("creatureId") != candidate_id:
        raise SystemExit(f"Job only supports 1:1 candidate/content IDs; {candidate_id} maps to {entry.get('creatureId')}")

    raw = download(source_url)
    with Image.open(io.BytesIO(raw)) as opened:
        opened.load()
        image = opened.convert("RGB")

    cropped = square_crop(image, job.get("cropBox"))
    resized = cropped.resize((1024, 1024), Image.Resampling.LANCZOS, reducing_gap=3.0)
    cropped.close()
    image.close()

    target = next_candidate_path(candidate_id)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        raise SystemExit(f"Refusing to overwrite immutable source revision: {target}")
    resized.save(
        target,
        format="WEBP",
        quality=int(job.get("sourceQuality", 92)),
        method=6,
        lossless=False,
        exif=b"",
        xmp=b"",
        icc_profile=None,
    )
    resized.close()

    today = date.today().isoformat()
    entry["path"] = target.relative_to(ROOT).as_posix()
    entry["score"] = float(job["score"])
    entry["status"] = "keep"
    entry["identity"] = job.get("identity", "high")
    entry["ingestMode"] = "opaque-scene"
    entry["qaNote"] = job["qaNote"]
    entry["generatedOn"] = today
    entry["generationBatch"] = "issue-55-realistic-one-by-one"
    entry["generator"] = job.get("generator", "licensed underwater photograph")
    if job.get("scientificName"):
        entry["scientificName"] = job["scientificName"]
    entry["bytes"] = target.stat().st_size
    entry["sha256"] = sha256(target)
    entry["provenance"] = {
        "sourcePage": job["sourcePage"],
        "sourceUrl": source_url,
        "author": job["author"],
        "license": job["license"],
        "licenseUrl": job["licenseUrl"],
        "transformation": "square crop, resize to 1024x1024, WebP encode; no generative anatomy edits",
        "styleFamily": "poseidon-sunlit-square-v1",
    }
    catalog["updatedOn"] = today
    CATALOG.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(json.dumps({"id": candidate_id, "path": entry["path"], "bytes": entry["bytes"], "sha256": entry["sha256"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
