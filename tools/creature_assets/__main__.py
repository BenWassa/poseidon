from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .pipeline import AssetPipelineError, ingest, raise_if_invalid, validate_root, write_fallback


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Poseidon creature asset pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    ingest_parser = sub.add_parser("ingest", help="Generate curated variants and manifest from an approved source image")
    ingest_parser.add_argument("--id", required=True, dest="creature_id")
    ingest_parser.add_argument("--source", required=True, type=Path)
    ingest_parser.add_argument("--root", type=Path, default=Path("assets/creatures"))
    ingest_parser.add_argument("--force", action="store_true", help="Replace an existing asset directory for this ID")

    fallback_parser = sub.add_parser("fallback", help="Write a component-neutral placeholder/missing-art manifest")
    fallback_parser.add_argument("--id", required=True, dest="creature_id")
    fallback_parser.add_argument("--status", choices=("placeholder", "missing"), default="placeholder")
    fallback_parser.add_argument("--root", type=Path, default=Path("assets/creatures"))
    fallback_parser.add_argument("--force", action="store_true")

    validate_parser = sub.add_parser("validate", help="Validate the complete creature asset root")
    validate_parser.add_argument("--root", type=Path, default=Path("assets/creatures"))
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "ingest":
            manifest = ingest(args.source, args.creature_id, args.root, args.force)
            print(manifest)
        elif args.command == "fallback":
            manifest = write_fallback(args.creature_id, args.status, args.root, args.force)
            print(manifest)
        else:
            errors = validate_root(args.root)
            raise_if_invalid(errors)
            print(f"Validated creature asset root: {args.root}")
        return 0
    except AssetPipelineError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
