"""Generate Codex agent TOML files from the canonical Markdown agents."""

from pathlib import Path
import re

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIRECTORY = REPOSITORY_ROOT / ".claude" / "agents"
OUTPUT_DIRECTORY = REPOSITORY_ROOT / ".codex" / "agents"
FRONTMATTER_PATTERN = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.DOTALL)


def parse_frontmatter(raw_frontmatter: str) -> dict[str, str]:
    """Read simple `key: value` frontmatter. Values are single-line."""
    fields: dict[str, str] = {}
    for line in raw_frontmatter.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[key.strip()] = value.strip()
    return fields


def toml_single_line(value: str) -> str:
    """Encode a one-line string as a quoted TOML string."""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def toml_multiline(value: str) -> str:
    """Encode a multiline string as a TOML triple-quoted literal."""
    cleaned = value.replace("\\", "\\\\").strip()
    return f'"""\n{cleaned}\n"""'


def render_agent(markdown_path: Path) -> str:
    """Turn one Markdown agent file into Codex TOML."""
    match = FRONTMATTER_PATTERN.match(markdown_path.read_text())
    if match is None:
        raise SystemExit(f"Missing frontmatter in {markdown_path}")
    fields = parse_frontmatter(match.group(1))
    agent_name = fields.get("name", markdown_path.stem)
    description = fields.get("description", "")
    readonly = fields.get("readonly", "false").lower() == "true"
    sandbox_mode = "read-only" if readonly else "workspace-write"
    instructions = match.group(2).strip()
    return "\n".join(
        [
            f"name = {toml_single_line(agent_name)}",
            f"description = {toml_single_line(description)}",
            f'sandbox_mode = "{sandbox_mode}"',
            f"developer_instructions = {toml_multiline(instructions)}",
            "",
        ]
    )


def main() -> None:
    """Write one TOML file per Markdown agent."""
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    for markdown_path in sorted(SOURCE_DIRECTORY.glob("*.md")):
        toml_path = OUTPUT_DIRECTORY / f"{markdown_path.stem}.toml"
        toml_path.write_text(render_agent(markdown_path))
        print(toml_path.relative_to(REPOSITORY_ROOT))


if __name__ == "__main__":
    main()
