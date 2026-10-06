"""Print the numbered tasks from docs/ASSIGNMENT.md."""

from pathlib import Path
import re

REPOSITORY_ROOT = Path(__file__).resolve().parents[4]
ASSIGNMENT_PATH = REPOSITORY_ROOT / "docs" / "ASSIGNMENT.md"
TASK_LINE = re.compile(r"^(\d+)\.\s+\*\*(.+?)\*\*")
ENDPOINT_LINE = re.compile(r"^\s+-\s+`([A-Z]+ /[^`]*)`")


def main() -> None:
    """Write each numbered task and its endpoint lines to stdout."""
    current_heading = "Assignment"
    for line in ASSIGNMENT_PATH.read_text().splitlines():
        if line.startswith("## "):
            current_heading = line.removeprefix("## ").strip("* ").strip()
            print(f"\n# {current_heading}")
            continue
        task_match = TASK_LINE.match(line)
        if task_match:
            print(f"{task_match.group(1)}. {task_match.group(2)}")
            continue
        endpoint_match = ENDPOINT_LINE.match(line)
        if endpoint_match:
            print(f"   - {endpoint_match.group(1)}")


if __name__ == "__main__":
    main()
