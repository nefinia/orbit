"""Regenerate README.md and llms.txt from orbit.json. Run: python3 build.py"""
import json
from datetime import datetime
from pathlib import Path

root = Path(__file__).parent
d = json.loads((root / "orbit.json").read_text(encoding="utf-8"))


def fmt_deadline(s):
    if "T" not in s:
        return s
    t = datetime.fromisoformat(s)
    return t.strftime("%Y-%m-%d %H:%M") + " (UTC" + t.strftime("%z")[:3] + ")"


lines = [
    f"# Orbit: {d['owner']}'s open calls, deadlines and ideas",
    "",
    d["about"],
    "",
    f"_Last updated {d['updated']}. Machine-readable version: [`orbit.json`](orbit.json)._",
    "",
    d["how_to_use"],
    "",
    "## Opportunities on the radar",
    "",
    "| Deadline | Opportunity | Type | Where | Value |",
    "|---|---|---|---|---|",
]
for o in sorted(d["opportunities"], key=lambda o: o["deadline"]):
    if o.get("status") != "open":
        continue
    lines.append(
        f"| {fmt_deadline(o['deadline'])} | [{o['title']}]({o['url']}) | {o['type']} | {o.get('location','')} | {o.get('value','')} |"
    )
lines += ["", "Details:", ""]
for o in d["opportunities"]:
    if o.get("status") != "open":
        continue
    extra = "; ".join(f"{r['what']} due {r['date']}" for r in o.get("related_deadlines", []))
    lines.append(f"- **{o['title']}**: {o.get('requirements','')}" + (f" ({extra})" if extra else ""))

lines += ["", "## Projects and ideas", ""]
for p in d["projects"]:
    title = f"[{p['title']}]({p['url']})" if p.get("url") else p["title"]
    lines.append(f"### {title}")
    lines.append("")
    lines.append(f"{p['summary']}  ")
    lines.append(f"**Stage:** {p['stage']}")
    if p.get("looking_for"):
        lines.append(f"  \n**Looking for:** {', '.join(p['looking_for'])}")
    lines.append("")

lines += ["## Kinds of opportunities worth suggesting", ""]
lines += [f"- {i}" for i in d["interests_for_new_opportunities"]]
lines.append("")

readme = "\n".join(lines)
(root / "README.md").write_text(readme, encoding="utf-8")
(root / "llms.txt").write_text(readme, encoding="utf-8")
print("README.md and llms.txt regenerated")
