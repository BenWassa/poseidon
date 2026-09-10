from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .pipeline import (
    MODE_TRANSPARENT_SPECIMEN,
    SOURCE_MODES,
    AssetPipelineError,
    ingest,
    raise_if_invalid,
    validate_root,
    write_fallback,
)
from .source_catalog import (
    import_source_bundle,
    promote_source_candidate,
    raise_if_source_catalog_invalid,
    validate_source_catalog,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Poseidon creature asset pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    ingest_parser = sub.add_parser("ingest", help="Generate curated variants and manifest from an approved source image")
    ingest_parser.add_argument("--id", required=True, dest="creature_id")
    ingest_parser.add_argument("--source", required=True, type=Path)
    ingest_parser.add_argument("--mode", choices=SOURCE_MODES, default=MODE_TRANSPARENT_SPECIMEN)
    ingest_parser.add_argument("--root", type=Path, default=Path("assets/creatures"))
    ingest_parser.add_argument("--force", action="store_true", help="Replace an existing asset directory for this ID")

    fallback_parser = sub.add_parser("fallback", help="Write a component-neutral placeholder/missing-art manifest")
    fallback_parser.add_argument("--id", required=True, dest="creature_id")
    fallback_parser.add_argument("--status", choices=("placeholder", "missing"), default="placeholder")
    fallback_parser.add_argument("--root", type=Path, default=Path("assets/creatures"))
    fallback_parser.add_argument("--force", action="store_true")

    validate_parser = sub.add_parser("validate", help="Validate the complete creature asset root")
    validate_parser.add_argument("--root", type=Path, default=Path("assets/creatures"))

    source_validate = sub.add_parser("validate-source", help="Validate the editorial source-art catalog and imported masters")
    source_validate.add_argument("--catalog", type=Path, default=Path("assets/source/creatures/catalog.json"))
    source_validate.add_argument("--repo-root", type=Path, default=Path("."))
    source_validate.add_argument(
        "--allow-pending",
        action="store_true",
        help="Validate metadata while a declared binary import is still pending; the repository gate does not use this.",
    )

    import_bundle = sub.add_parser("import-source-bundle", help="Import the prepared source-art ZIP into cataloged immutable paths")
    import_bundle.add_argument("--bundle", required=True, type=Path)
    import_bundle.add_argument("--catalog", type=Path, default=Path("assets/source/creatures/catalog.json"))
    import_bundle.add_argument("--repo-root", type=Path, default=Path("."))

    promote = sub.add_parser("promote-source", help="Deliberately promote one eligible source candidate into canonical runtime assets")
    promote.add_argument("--candidate", required=True, dest="candidate_id")
    promote.add_argument("--catalog", type=Path, default=Path("assets/source/creatures/catalog.json"))
    promote.add_argument("--repo-root", type=Path, default=Path("."))
    promote.add_argument("--root", type=Path, default=Path("assets/creatures"))
    promote.add_argument("--force", action="store_true", help="Deliberately replace existing runtime art for the mapped stable ID")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "ingest":
            manifest = ingest(args.source, args.creature_id, args.root, args.force, args.mode)
            print(manifest)
        elif args.command == "fallback":
            manifest = write_fallback(args.creature_id, args.status, args.root, args.force)
            print(manifest)
        elif args.command == "validate":
            errors = validate_root(args.root)
            raise_if_invalid(errors)
            print(f"Validated creature asset root: {args.root}")
        elif args.command == "validate-source":
            errors = validate_source_catalog(args.catalog, args.repo_root, allow_pending=args.allow_pending)
            raise_if_source_catalog_invalid(errors)
            print(f"Validated creature source catalog: {args.catalog}")
        elif args.command == "import-source-bundle":
            catalog = import_source_bundle(args.bundle, args.catalog, args.repo_root)
            print(catalog)
        else:
            manifest = promote_source_candidate(
                args.catalog,
                args.candidate_id,
                args.repo_root,
                args.root,
                force=args.force,
            )
            print(manifest)
        return 0
    except AssetPipelineError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
