"""Write the FastAPI OpenAPI document to backend/openapi.json, or verify it is current.

Run from backend/ with `uv run python ../scripts/export_openapi.py [--check]`.
"""

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1] / "backend"
OUTPUT_PATH = BACKEND_ROOT / "openapi.json"
sys.path.insert(0, str(BACKEND_ROOT))

from app.main import create_app  # noqa: E402


def render_document() -> str:
    document = create_app().openapi()
    return json.dumps(document, indent=2, sort_keys=True) + "\n"


def main() -> int:
    check_only = "--check" in sys.argv
    rendered = render_document()
    if check_only:
        if not OUTPUT_PATH.exists() or OUTPUT_PATH.read_text() != rendered:
            print(f"{OUTPUT_PATH.relative_to(BACKEND_ROOT.parent)} is stale. Run without --check.")
            return 1
        print("openapi.json is current")
        return 0
    OUTPUT_PATH.write_text(rendered)
    print(f"Wrote {OUTPUT_PATH.relative_to(BACKEND_ROOT.parent)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
