"""Fail fast if evaluation fixtures leave the synthetic Turkish boundary."""

import json
import re
import sys
from pathlib import Path

IDENTIFIER = re.compile(
    r"(?:name|ad[ıi]|soyad|tc[_ -]?kimlik|telefon|phone|address|adres|email|e-?posta)",
    re.I,
)


def main() -> int:
    root = Path(__file__).resolve().parents[3]
    fixture_dir = root / "evals" / "fixtures"
    failures = []
    for path in sorted(fixture_dir.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            metadata = data.get("metadata", {})
            if data.get("locale", "").lower() not in {"tr", "tr-tr"}:
                failures.append(f"{path.name}: locale must be tr/tr-TR")
            if metadata.get("synthetic") is not True:
                failures.append(f"{path.name}: metadata.synthetic must be true")
            if metadata.get("source") not in {"synthetic_fixture", "test_fixture"}:
                failures.append(f"{path.name}: unsupported source")
            if IDENTIFIER.search(" ".join(str(v) for v in metadata.values())):
                failures.append(f"{path.name}: direct-identifier-like metadata")
        except (OSError, json.JSONDecodeError, AttributeError) as exc:
            failures.append(f"{path.name}: invalid fixture ({exc})")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print(
        f"Checked {len(list(fixture_dir.glob('*.json')))} synthetic Turkish fixture(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
