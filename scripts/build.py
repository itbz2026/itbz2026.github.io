from pathlib import Path
import re
import markdown

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
OUTPUT = ROOT / "pages" / "generated"

def parse_front_matter(text):
    if not text.startswith("---\n"):
        raise ValueError("Markdown article needs YAML front matter")
    _, front, body = text.split("---", 2)
    meta = {}
    for line in front.strip().splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip().strip('"').strip("'")
    return meta, body.strip()

def render_article(source):
    raw = source.read_text(encoding="utf-8")
    meta, body = parse_front_matter(raw)
    required = ("title", "description", "slug")
    missing = [key for key in required if not meta.get(key)]
    if missing:
        raise ValueError(f"{source}: missing metadata: {', '.join(missing)}")
    html = markdown.markdown(body, extensions=["fenced_code", "tables", "toc", "sane_lists"])
    title = meta["title"]
    description = meta["description"]
    page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{description}">
<title>{title} | IT Knowledge Base</title>
<link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
<div class="layout">
<aside></aside>
<main>
<div class="top"><span>IT Knowledge Base / {meta.get("category", "Documentation")} / {title}</span></div>
<a class="back" href="../proxmox.html">← Zur Proxmox-Übersicht</a>
<header class="hero"><small>IT Knowledge Base · Practical Documentation</small><h1>{title}</h1><p>{description}</p></header>
<article class="article markdown-article">{html}</article>
<footer>IT Knowledge Base · Generated from Markdown source: {source.relative_to(ROOT)}</footer>
</main>
</div>
<script src="/assets/js/navigation.js" defer></script>
</body>
</html>
"""
    OUTPUT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT / f"{meta['slug']}.html"
    destination.write_text(page, encoding="utf-8")
    print(f"Generated {destination.relative_to(ROOT)}")

def main():
    sources = sorted(CONTENT.rglob("*.md"))
    if not sources:
        raise SystemExit("No Markdown articles found in content/")
    for source in sources:
        render_article(source)

if __name__ == "__main__":
    main()
